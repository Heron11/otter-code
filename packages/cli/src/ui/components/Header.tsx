/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { shortenPath, tildeifyPath } from '@qwen-code/qwen-code-core';
import { shortAsciiLogo } from './AsciiArt.js';
import { getAsciiArtWidth, getCachedStringWidth } from '../utils/textUtils.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

/** Orange → white gradient for the startup ASCII banner (truecolor). */
const LOGO_GRADIENT_COLORS = [
  '#FF6A00',
  '#FF8C00',
  '#FFB347',
  '#FFD59E',
  '#FFFFFF',
];

const HEADER_ACCENT_ORANGE = '#FF8C00';
const HEADER_TEXT_LIGHT = '#F5F5F5';
const HEADER_TEXT_MUTED = '#A3A3A3';

/**
 * Auth display type for the Header component.
 * Simplified representation of authentication method shown to users.
 */
export enum AuthDisplayType {
  QWEN_OAUTH = 'Qwen OAuth',
  CODING_PLAN = 'Coding Plan',
  API_KEY = 'API Key',
  UNKNOWN = 'Unknown',
}

interface HeaderProps {
  customAsciiArt?: string; // For user-defined ASCII art
  version: string;
  authDisplayType?: AuthDisplayType;
  model: string;
  workingDirectory: string;
}

export const Header: React.FC<HeaderProps> = ({
  customAsciiArt,
  version,
  authDisplayType,
  model,
  workingDirectory,
}) => {
  const { columns: terminalWidth } = useTerminalSize();

  const displayLogo = customAsciiArt ?? shortAsciiLogo;
  const logoWidth = getAsciiArtWidth(displayLogo);
  const formattedAuthType = authDisplayType ?? AuthDisplayType.UNKNOWN;

  // Calculate available space properly:
  // First determine if logo can be shown, then use remaining space for path
  const containerMarginX = 2; // marginLeft + marginRight on the outer container
  const logoGap = 2; // Gap between logo and info panel
  const infoPanelPaddingX = 1;
  const infoPanelBorderWidth = 2; // left + right border
  const infoPanelChromeWidth = infoPanelBorderWidth + infoPanelPaddingX * 2;
  const minPathLength = 20; // Minimum readable path length
  const minInfoPanelWidth = minPathLength + infoPanelChromeWidth;

  const availableTerminalWidth = Math.max(
    0,
    terminalWidth - containerMarginX * 2,
  );

  // Check if we have enough space for logo + gap + minimum info panel
  const showLogo =
    availableTerminalWidth >= logoWidth + logoGap + minInfoPanelWidth;

  // Calculate available width for info panel (use all remaining space)
  // Cap at 60 when in two-column layout (with logo)
  const maxInfoPanelWidth = 60;
  const availableInfoPanelWidth = showLogo
    ? Math.min(availableTerminalWidth - logoWidth - logoGap, maxInfoPanelWidth)
    : availableTerminalWidth;

  // Calculate max path lengths (subtract padding/borders from available space)
  const maxPathLength = Math.max(
    0,
    availableInfoPanelWidth - infoPanelChromeWidth,
  );

  const infoPanelContentWidth = Math.max(
    0,
    availableInfoPanelWidth - infoPanelChromeWidth,
  );
  const authModelText = `${formattedAuthType} | ${model}`;
  const modelHintText = ' (/model to change)';
  const showModelHint =
    infoPanelContentWidth > 0 &&
    getCachedStringWidth(authModelText + modelHintText) <=
      infoPanelContentWidth;

  // Now shorten the path to fit the available space
  const tildeifiedPath = tildeifyPath(workingDirectory);
  const shortenedPath = shortenPath(tildeifiedPath, Math.max(3, maxPathLength));
  const displayPath =
    maxPathLength <= 0
      ? ''
      : shortenedPath.length > maxPathLength
        ? shortenedPath.slice(0, maxPathLength)
        : shortenedPath;

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      marginX={containerMarginX}
      width={availableTerminalWidth}
    >
      {/* Left side: ASCII logo (only if enough space) */}
      {showLogo && (
        <>
          <Box flexShrink={0}>
            <Gradient colors={LOGO_GRADIENT_COLORS}>
              <Text>{displayLogo}</Text>
            </Gradient>
          </Box>
          {/* Fixed gap between logo and info panel */}
          <Box width={logoGap} />
        </>
      )}

      {/* Right side: Info panel (flexible width, max 60 in two-column layout) */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="#262626"
        paddingX={infoPanelPaddingX}
        flexGrow={showLogo ? 0 : 1}
        width={showLogo ? availableInfoPanelWidth : undefined}
      >
        {/* Title line: >_ Otter Code (v{version}) */}
        <Text>
          <Text bold color={HEADER_ACCENT_ORANGE}>
            &gt;_ Otter Code
          </Text>
          <Text color={HEADER_TEXT_LIGHT}> (v{version})</Text>
        </Text>
        {/* Empty line for spacing */}
        <Text> </Text>
        {/* Auth and Model line */}
        <Text>
          <Text color={HEADER_TEXT_MUTED}>{authModelText}</Text>
          {showModelHint && (
            <Text color={HEADER_TEXT_MUTED}>{modelHintText}</Text>
          )}
        </Text>
        {/* Directory line */}
        <Text color={HEADER_TEXT_LIGHT}>{displayPath}</Text>
      </Box>
    </Box>
  );
};
