/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { ConfigContext } from '../contexts/ConfigContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { UIStateContext } from '../contexts/UIStateContext.js';
import { SettingScope } from '../../config/settings.js';
import { TextInput } from './shared/TextInput.js';
import { DescriptiveRadioButtonSelect } from './shared/DescriptiveRadioButtonSelect.js';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { t } from '../../i18n/index.js';
import {
  buildProviderModelEntry,
  computeProviderEnvKey,
  fetchModelsFromServer,
  normalizeOpenAiBaseUrl,
  providerLabelFromBaseUrl,
  type ServerProbe,
} from '../../utils/providerModelSync.js';

type Step = 'url' | 'key' | 'confirm';

interface AddProviderDialogProps {
  onClose: () => void;
}

export function AddProviderDialog({
  onClose,
}: AddProviderDialogProps): React.JSX.Element {
  const config = useContext(ConfigContext);
  const settings = useSettings();
  const uiState = useContext(UIStateContext);

  const [step, setStep] = useState<Step>('url');
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fetchedIds, setFetchedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const normalizedBase = useMemo(
    () => normalizeOpenAiBaseUrl(baseUrlInput),
    [baseUrlInput],
  );

  const serverProbe: ServerProbe | null = useMemo(() => {
    if (!normalizedBase) return null;
    return {
      baseUrl: normalizedBase,
      envKey: computeProviderEnvKey(normalizedBase),
      label: providerLabelFromBaseUrl(normalizedBase),
    };
  }, [normalizedBase]);

  const newModelCount = useMemo(() => {
    if (!serverProbe || fetchedIds.length === 0) return 0;
    const openai =
      settings.merged.modelProviders?.['openai'] ??
      ([] as Array<{
        id: string;
      }>);
    const existing = new Set(openai.map((m) => m.id));
    return fetchedIds.filter((id) => !existing.has(id)).length;
  }, [fetchedIds, serverProbe, settings.merged.modelProviders]);

  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        onClose();
      }
    },
    { isActive: true },
  );

  const runFetch = useCallback(async () => {
    if (!serverProbe) {
      setErrorMessage(t('Enter a valid base URL (OpenAI-compatible /v1).'));
      return;
    }
    setBusy(true);
    setErrorMessage(null);
    try {
      const ids = await fetchModelsFromServer(serverProbe.baseUrl, apiKeyInput);
      if (ids.length === 0) {
        setErrorMessage(
          t(
            'No models found. Check the URL, API key, and that GET /v1/models works.',
          ),
        );
        setBusy(false);
        return;
      }
      setFetchedIds(ids);
      setStep('confirm');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [serverProbe, apiKeyInput]);

  const applyModels = useCallback(() => {
    if (!config || !serverProbe || fetchedIds.length === 0) {
      onClose();
      return;
    }

    const existing = (settings.merged.modelProviders?.['openai'] ??
      []) as Array<{
      id: string;
    }>;
    const existingIds = new Set(existing.map((m) => m.id));
    const newEntries = fetchedIds
      .filter((id) => !existingIds.has(id))
      .map((id) => buildProviderModelEntry(id, serverProbe));

    const env = {
      ...(settings.merged.env ?? {}),
      [serverProbe.envKey]: apiKeyInput,
    };

    settings.setValue(SettingScope.User, 'env', env);

    const mergedOpenai = [...newEntries, ...existing];
    settings.setValue(SettingScope.User, 'modelProviders.openai', mergedOpenai);

    config.reloadModelProvidersConfig(settings.merged.modelProviders);

    uiState?.historyManager.addItem(
      {
        type: 'success',
        text:
          t('Added') +
          ` ${newEntries.length} ` +
          t('model(s) for') +
          ` ${serverProbe.baseUrl} (${serverProbe.envKey})`,
      },
      Date.now(),
    );

    onClose();
  }, [
    apiKeyInput,
    config,
    fetchedIds,
    onClose,
    serverProbe,
    settings,
    uiState?.historyManager,
  ]);

  if (step === 'url') {
    return (
      <Box flexDirection="column">
        <Text bold color={theme.text.accent}>
          {t('Add OpenAI-compatible provider')} (Otter Code)
        </Text>
        <Box marginTop={1}>
          <Text dimColor>
            {t('Base URL')} ({t('e.g.')} https://api.openai.com/v1)
          </Text>
        </Box>
        {errorMessage && (
          <Box marginTop={1}>
            <Text color={theme.status.error}>{errorMessage}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <TextInput
            value={baseUrlInput}
            onChange={setBaseUrlInput}
            onSubmit={() => {
              if (!normalizeOpenAiBaseUrl(baseUrlInput)) {
                setErrorMessage(t('Invalid URL.'));
                return;
              }
              setErrorMessage(null);
              setStep('key');
            }}
            placeholder="https://..."
            inputWidth={72}
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>{t('Enter — continue · Esc — cancel')}</Text>
        </Box>
      </Box>
    );
  }

  if (step === 'key') {
    return (
      <Box flexDirection="column">
        <Text bold>{t('API key')}</Text>
        <Box marginTop={1}>
          <Text dimColor>
            {t('Stored in')} ~/.qwen/settings.json → env.{serverProbe?.envKey}
          </Text>
        </Box>
        {errorMessage && (
          <Box marginTop={1}>
            <Text color={theme.status.error}>{errorMessage}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <TextInput
            value={apiKeyInput}
            onChange={setApiKeyInput}
            onSubmit={() => {
              void runFetch();
            }}
            placeholder={t('sk-...')}
            inputWidth={72}
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>
            {busy
              ? t('Fetching models…')
              : t('Enter — fetch models · Esc — cancel')}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>
        {t('Found')} {fetchedIds.length} {t('model(s)')}
      </Text>
      <Box marginTop={1}>
        <Text dimColor>
          {newModelCount === 0
            ? t('All of these models are already in your settings.')
            : t('New models to add:') + ` ${newModelCount}`}
        </Text>
      </Box>
      <Box marginTop={1}>
        <DescriptiveRadioButtonSelect
          items={[
            {
              value: 'add' as const,
              key: 'add',
              title: <Text bold>{t('Save to settings')}</Text>,
              description:
                newModelCount > 0
                  ? t('Append provider models to modelProviders.openai')
                  : t('Update API key env entry only (no new model rows)'),
            },
            {
              value: 'cancel' as const,
              key: 'cancel',
              title: <Text>{t('Cancel')}</Text>,
              description: t('Close without saving'),
            },
          ]}
          onSelect={(v) => {
            if (v === 'add') {
              applyModels();
            } else {
              onClose();
            }
          }}
          initialIndex={0}
        />
      </Box>
    </Box>
  );
}
