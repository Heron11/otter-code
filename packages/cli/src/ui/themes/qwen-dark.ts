/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import type { SemanticColors } from './semantic-tokens.js';

const otterSemanticColors: SemanticColors = {
  text: {
    primary: '#F5F5F5',
    secondary: '#737373',
    link: '#FF8C00',
    accent: '#FF6A00',
    code: '#FFB347',
  },
  background: {
    primary: '#0D0D0D',
    diff: {
      added: '#3D2000',
      removed: '#430000',
    },
  },
  border: {
    default: '#737373',
    focused: '#FF8C00',
  },
  ui: {
    comment: '#A3A3A3',
    symbol: '#FFD59E',
    gradient: ['#FF6A00', '#FF8C00', '#FFB347', '#FFD59E', '#FFFFFF'],
  },
  status: {
    error: '#F26D78',
    success: '#FFB347',
    warning: '#FF8C00',
    errorDim: '#8B3A4A',
    warningDim: '#7A4000',
  },
};

const qwenDarkColors: ColorsTheme = {
  type: 'dark',
  Background: '#0D0D0D',
  Foreground: '#F5F5F5',
  LightBlue: '#FFB347',
  AccentBlue: '#FF8C00',
  AccentPurple: '#FF6A00',
  AccentCyan: '#FFD59E',
  AccentGreen: '#FFB347',
  AccentYellow: '#FF8C00',
  AccentRed: '#F26D78',
  AccentYellowDim: '#7A4000',
  AccentRedDim: '#8B3A4A',
  DiffAdded: '#3D2000',
  DiffRemoved: '#430000',
  Comment: '#A3A3A3',
  Gray: '#737373',
  GradientColors: ['#FF6A00', '#FF8C00', '#FFB347', '#FFD59E', '#FFFFFF'],
};

export const QwenDark: Theme = new Theme(
  'Qwen Dark',
  'dark',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: qwenDarkColors.Background,
      color: qwenDarkColors.Foreground,
    },
    'hljs-keyword': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-literal': {
      color: qwenDarkColors.AccentCyan,
    },
    'hljs-symbol': {
      color: qwenDarkColors.AccentCyan,
    },
    'hljs-name': {
      color: qwenDarkColors.LightBlue,
    },
    'hljs-link': {
      color: qwenDarkColors.AccentBlue,
    },
    'hljs-function .hljs-keyword': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-subst': {
      color: qwenDarkColors.Foreground,
    },
    'hljs-string': {
      color: qwenDarkColors.AccentCyan,
    },
    'hljs-title': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-type': {
      color: qwenDarkColors.AccentBlue,
    },
    'hljs-attribute': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-bullet': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-addition': {
      color: qwenDarkColors.AccentGreen,
    },
    'hljs-variable': {
      color: qwenDarkColors.Foreground,
    },
    'hljs-template-tag': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-template-variable': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-comment': {
      color: qwenDarkColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: qwenDarkColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-deletion': {
      color: qwenDarkColors.AccentRed,
    },
    'hljs-meta': {
      color: qwenDarkColors.AccentYellow,
    },
    'hljs-doctag': {
      fontWeight: 'bold',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
  },
  qwenDarkColors,
  otterSemanticColors,
);
