/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @deprecated Import from `providerModelSync.js` — kept for path stability. */
export {
  syncLocalModels,
  fetchModelsFromServer,
  normalizeOpenAiBaseUrl,
  computeProviderEnvKey,
  buildProviderModelEntry,
  collectServersToProbe,
  DEFAULT_LOCAL_SERVERS,
  type ServerProbe,
} from './providerModelSync.js';
