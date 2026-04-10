/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  SlashCommand,
  CommandContext,
  OpenDialogActionReturn,
  MessageActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';

export const addProviderCommand: SlashCommand = {
  name: 'addprovider',
  altNames: ['add-provider'],
  // Plain string so /help and completion always show the line (not only after i18n init).
  description: 'Add OpenAI-compatible API (base URL + key) and discover models',
  kind: CommandKind.BUILT_IN,
  action: async (
    context: CommandContext,
  ): Promise<OpenDialogActionReturn | MessageActionReturn> => {
    const { services } = context;
    const { config } = services;

    if (!config) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('Configuration not available.'),
      };
    }

    if (!config.isInteractive()) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('/addprovider is only available in interactive mode.'),
      };
    }

    return {
      type: 'dialog',
      dialog: 'add-provider',
    };
  },
};
