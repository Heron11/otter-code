/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';

interface UseAddProviderCommandReturn {
  isAddProviderDialogOpen: boolean;
  openAddProviderDialog: () => void;
  closeAddProviderDialog: () => void;
}

export const useAddProviderCommand = (): UseAddProviderCommandReturn => {
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);

  const openAddProviderDialog = useCallback(() => {
    setIsAddProviderDialogOpen(true);
  }, []);

  const closeAddProviderDialog = useCallback(() => {
    setIsAddProviderDialogOpen(false);
  }, []);

  return {
    isAddProviderDialogOpen,
    openAddProviderDialog,
    closeAddProviderDialog,
  };
};
