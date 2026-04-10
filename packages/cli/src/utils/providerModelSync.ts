/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared discovery + merge logic for OpenAI-compatible `/v1/models` sync.
 * Used by startup sync (`syncLocalModels`) and `/addprovider`.
 */

import * as fs from 'node:fs';
import { createDebugLogger } from '@qwen-code/qwen-code-core';
import { USER_SETTINGS_PATH } from '../config/settings.js';

const debugLogger = createDebugLogger('MODEL_SYNC');

export const FETCH_TIMEOUT_MS = 2000;

export type ServerProbe = {
  baseUrl: string;
  envKey: string;
  label: string;
};

/** Default OpenAI-compatible `/v1` bases for common local runtimes */
export const DEFAULT_LOCAL_SERVERS: readonly ServerProbe[] = [
  {
    baseUrl: 'http://127.0.0.1:1234/v1',
    envKey: 'LMSTUDIO_API_KEY',
    label: 'LM Studio',
  },
  {
    baseUrl: 'http://127.0.0.1:11434/v1',
    envKey: 'OLLAMA_API_KEY',
    label: 'Ollama',
  },
  {
    baseUrl: 'http://127.0.0.1:1337/v1',
    envKey: 'ATOMIC_API_KEY',
    label: 'Atomic Chat',
  },
];

const SKIP_PATTERNS = ['embed', 'embedding'];

export function normalizeOpenAiBaseUrl(input: string): string {
  const t = input.trim();
  if (!t) return t;
  let u = t;
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`;
  }
  const noTrail = u.replace(/\/+$/, '');
  if (/\/v1$/i.test(noTrail)) {
    return noTrail;
  }
  return `${noTrail}/v1`;
}

/** Stable env key for a custom provider (hostname-based). */
export function computeProviderEnvKey(baseUrl: string): string {
  try {
    const u = new URL(baseUrl.replace(/\/v1\/?$/i, ''));
    const host = u.hostname.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
    return `OTTER_${host}_API_KEY`;
  } catch {
    return `OTTER_CUSTOM_${Date.now()}`;
  }
}

export function providerLabelFromBaseUrl(baseUrl: string): string {
  try {
    const u = new URL(baseUrl.replace(/\/v1\/?$/i, ''));
    return u.hostname || 'Custom';
  } catch {
    return 'Custom';
  }
}

export function toFriendlyName(id: string, label: string): string {
  const base = id.split('/').pop() ?? id;
  return (
    base
      .replace(/[-_.]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() + ` (${label})`
  );
}

export function isLargeModel(id: string): boolean {
  return /[2-9]\d[Bb]|1\d{2,}[Bb]/i.test(id);
}

/**
 * GET {baseUrl}/models — OpenAI-compatible list. Optional Bearer when apiKey is set.
 */
export async function fetchModelsFromServer(
  baseUrl: string,
  apiKey?: string,
): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {};
    if (apiKey && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/models`, {
      signal: controller.signal,
      headers,
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

/**
 * Default local servers plus one entry per distinct `baseUrl` in `modelProviders.openai`.
 */
export function collectServersToProbe(
  settings: Record<string, unknown>,
): ServerProbe[] {
  const seen = new Set<string>();
  const out: ServerProbe[] = [];

  const add = (s: ServerProbe) => {
    const k = s.baseUrl.replace(/\/+$/, '').toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push({
      ...s,
      baseUrl: s.baseUrl.replace(/\/+$/, ''),
    });
  };

  for (const s of DEFAULT_LOCAL_SERVERS) {
    add(s);
  }

  const providers = settings['modelProviders'] as
    | Record<string, Array<Record<string, unknown>>>
    | undefined;
  const openaiList = providers?.['openai'] ?? [];

  for (const m of openaiList) {
    const bu = m['baseUrl'] as string | undefined;
    const ek = m['envKey'] as string | undefined;
    if (bu && ek) {
      add({
        baseUrl: bu.replace(/\/+$/, ''),
        envKey: ek,
        label: providerLabelFromBaseUrl(bu),
      });
    }
  }

  return out;
}

export function buildProviderModelEntry(
  id: string,
  server: ServerProbe,
): Record<string, unknown> {
  return {
    id,
    name: toFriendlyName(id, server.label),
    envKey: server.envKey,
    baseUrl: server.baseUrl,
    generationConfig: {
      timeout: isLargeModel(id) ? 300000 : 120000,
      maxRetries: 2,
      contextWindowSize: 128000,
      deferMaxTokensToProvider: true,
      samplingParams: {
        temperature: 0.7,
      },
    },
  };
}

export function ensureDefaultEnvPlaceholders(
  env: Record<string, string>,
): void {
  if (!env['ATOMIC_API_KEY']) env['ATOMIC_API_KEY'] = 'atomic-chat';
  if (!env['LMSTUDIO_API_KEY']) env['LMSTUDIO_API_KEY'] = 'lm-studio';
  if (!env['OLLAMA_API_KEY']) env['OLLAMA_API_KEY'] = 'ollama';
}

/**
 * Reads settings, probes all servers (defaults + configured provider base URLs),
 * appends new model ids, writes file. Same behavior as legacy LM Studio-only sync.
 */
export async function syncLocalModels(): Promise<void> {
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

  const env = (settings['env'] as Record<string, string>) ?? {};
  ensureDefaultEnvPlaceholders(env);
  settings['env'] = env;

  const servers = collectServersToProbe(settings);
  const allNewEntries: Array<Record<string, unknown>> = [];

  for (const server of servers) {
    const apiKey = env[server.envKey];
    const liveIds = await fetchModelsFromServer(server.baseUrl, apiKey);
    if (liveIds.length === 0) {
      debugLogger.debug(
        `${server.label} (${server.baseUrl}) not reachable or no models — skipping.`,
      );
      continue;
    }

    const newForServer = liveIds
      .filter((id) => !existingIds.has(id))
      .map((id) => {
        existingIds.add(id);
        return buildProviderModelEntry(id, server);
      });

    allNewEntries.push(...newForServer);
  }

  if (allNewEntries.length === 0) {
    debugLogger.debug(
      'All discovered models already in settings — nothing to add.',
    );
    return;
  }

  if (!settings['modelProviders']) settings['modelProviders'] = {};
  (settings['modelProviders'] as Record<string, unknown>)['openai'] = [
    ...allNewEntries,
    ...openaiList,
  ];

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
      `✅  Synced ${allNewEntries.length} model(s) from configured providers: ${names}\n`,
    );
  } catch (err) {
    debugLogger.debug(`Failed to write settings.json: ${String(err)}`);
  }
}
