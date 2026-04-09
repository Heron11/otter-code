/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Auto-syncs locally running LM Studio and Atomic Chat models into
 * ~/.qwen/settings.json on every Otter Code startup.
 * Models already present are left untouched; only new ones are appended.
 * Embedding models are always skipped.
 */

import * as fs from 'node:fs';
import { createDebugLogger } from '@qwen-code/qwen-code-core';
import { USER_SETTINGS_PATH } from '../config/settings.js';

const debugLogger = createDebugLogger('MODEL_SYNC');

const FETCH_TIMEOUT_MS = 2000;

const LOCAL_SERVERS = [
  {
    baseUrl: 'http://127.0.0.1:1234/v1',
    envKey: 'LMSTUDIO_API_KEY',
    label: 'LM Studio',
  },
  {
    baseUrl: 'http://127.0.0.1:1337/v1',
    envKey: 'ATOMIC_API_KEY',
    label: 'Atomic Chat',
  },
];

const SKIP_PATTERNS = ['embed', 'embedding'];

function toFriendlyName(id: string, label: string): string {
  const base = id.split('/').pop() ?? id;
  return (
    base
      .replace(/[-_.]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() + ` (${label})`
  );
}

function isLargeModel(id: string): boolean {
  return /[2-9]\d[Bb]|1\d{2,}[Bb]/i.test(id);
}

async function fetchModelsFrom(baseUrl: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}/models`, {
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

  const allNewEntries: Array<Record<string, unknown>> = [];

  for (const server of LOCAL_SERVERS) {
    const liveIds = await fetchModelsFrom(server.baseUrl);
    if (liveIds.length === 0) {
      debugLogger.debug(
        `${server.label} not reachable or no models loaded — skipping.`,
      );
      continue;
    }

    const newForServer = liveIds
      .filter((id) => !existingIds.has(id))
      .map((id) => {
        existingIds.add(id);
        return {
          id,
          name: toFriendlyName(id, server.label),
          envKey: server.envKey,
          baseUrl: server.baseUrl,
          generationConfig: {
            timeout: isLargeModel(id) ? 300000 : 120000,
            maxRetries: 2,
            samplingParams: {
              temperature: 0.7,
              max_tokens: 8192,
            },
          },
        };
      });

    allNewEntries.push(...newForServer);
  }

  if (allNewEntries.length === 0) {
    debugLogger.debug('All local models already in settings — nothing to add.');
    return;
  }

  if (!settings['modelProviders']) settings['modelProviders'] = {};
  (settings['modelProviders'] as Record<string, unknown>)['openai'] = [
    ...allNewEntries,
    ...openaiList,
  ];

  // Ensure API key placeholders exist in env
  const env = (settings['env'] as Record<string, string>) ?? {};
  if (!env['ATOMIC_API_KEY']) env['ATOMIC_API_KEY'] = 'atomic-chat';
  if (!env['LMSTUDIO_API_KEY']) env['LMSTUDIO_API_KEY'] = 'lm-studio';
  settings['env'] = env;

  try {
    fs.writeFileSync(
      USER_SETTINGS_PATH,
      JSON.stringify(settings, null, 2),
      'utf-8',
    );
    const names = allNewEntries.map((e) => e['name'] as string).join(', ');
    debugLogger.debug(
      `Synced ${allNewEntries.length} new model(s) into settings.json.`,
    );
    process.stderr.write(
      `✅  Synced ${allNewEntries.length} LM Studio/Atomic model(s) into settings: ${names}\n`,
    );
  } catch (err) {
    debugLogger.debug(`Failed to write settings.json: ${String(err)}`);
  }
}
