/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Auto-syncs locally running LM Studio models into ~/.qwen/settings.json
 * on every Otter Code startup. Models already present are left untouched;
 * only new ones are appended. The embedding model is always skipped.
 */

import * as fs from 'node:fs';
import { createDebugLogger } from '@qwen-code/qwen-code-core';
import { USER_SETTINGS_PATH } from '../config/settings.js';

const debugLogger = createDebugLogger('LMSTUDIO_SYNC');

const LMSTUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
const FETCH_TIMEOUT_MS = 2000;

/** Models whose IDs contain these strings are never added (e.g. embeddings). */
const SKIP_PATTERNS = ['embed', 'embedding'];

function toFriendlyName(id: string): string {
  const base = id.split('/').pop() ?? id;
  return (
    base
      .replace(/[-_.]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() + ' (LM Studio)'
  );
}

function isLargeModel(id: string): boolean {
  return /[2-9]\d[Bb]|1\d{2,}[Bb]/i.test(id);
}

async function fetchLmStudioModels(): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${LMSTUDIO_BASE_URL}/models`, {
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Array<{ id: string }> };
    return (json.data ?? [])
      .map((m) => m.id)
      .filter((id) => !SKIP_PATTERNS.some((p) => id.toLowerCase().includes(p)));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function syncLmStudioModels(): Promise<void> {
  const liveIds = await fetchLmStudioModels();
  if (liveIds.length === 0) {
    debugLogger.debug(
      'LM Studio not reachable or no models loaded — skipping sync.',
    );
    return;
  }

  let raw: string;
  try {
    raw = fs.readFileSync(USER_SETTINGS_PATH, 'utf-8');
  } catch {
    debugLogger.debug('settings.json not found — skipping sync.');
    return;
  }

  let settings: Record<string, unknown>;
  try {
    settings = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    debugLogger.debug('settings.json parse error — skipping sync.');
    return;
  }

  const providers = settings['modelProviders'] as
    | Record<string, Array<Record<string, unknown>>>
    | undefined;
  const openaiList: Array<Record<string, unknown>> =
    (providers?.['openai'] as Array<Record<string, unknown>>) ?? [];

  const existingIds = new Set(openaiList.map((m) => m['id'] as string));

  const newEntries = liveIds
    .filter((id) => !existingIds.has(id))
    .map((id) => ({
      id,
      name: toFriendlyName(id),
      envKey: 'LMSTUDIO_API_KEY',
      baseUrl: `${LMSTUDIO_BASE_URL}`,
      generationConfig: {
        timeout: isLargeModel(id) ? 300000 : 120000,
        maxRetries: 2,
        samplingParams: {
          temperature: 0.7,
          max_tokens: 8192,
        },
      },
    }));

  if (newEntries.length === 0) {
    debugLogger.debug(
      'All LM Studio models already in settings — nothing to add.',
    );
    return;
  }

  if (!settings['modelProviders']) settings['modelProviders'] = {};
  (settings['modelProviders'] as Record<string, unknown>)['openai'] = [
    ...newEntries,
    ...openaiList,
  ];

  try {
    fs.writeFileSync(
      USER_SETTINGS_PATH,
      JSON.stringify(settings, null, 2),
      'utf-8',
    );
    debugLogger.debug(
      `Synced ${newEntries.length} new LM Studio model(s) into settings.json.`,
    );
    // Print visible confirmation so users know the sync happened
    process.stderr.write(
      `✅  Synced ${newEntries.length} LM Studio model(s) into settings: ${newEntries.map((e) => e.name).join(', ')}\n`,
    );
  } catch (err) {
    debugLogger.debug(`Failed to write settings.json: ${String(err)}`);
  }
}
