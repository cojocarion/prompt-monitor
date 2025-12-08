/**
 * Custom hooks for extension functionality
 */
import { useEffect, useCallback } from 'react';
import browser from 'webextension-polyfill';
import { useAppDispatch, fetchState, updateFromBackground } from '@/store';
import { MessageType, type IssuesUpdatedMessage } from '@/shared/types';

/**
 * Hook to initialize extension state and listen for updates
 */
export function useExtensionSync() {
  const dispatch = useAppDispatch();

  // Fetch initial state
  useEffect(() => {
    dispatch(fetchState());
  }, [dispatch]);

  // Listen for background updates
  useEffect(() => {
    const handleMessage = (message: unknown) => {
      const msg = message as IssuesUpdatedMessage;
      if (msg?.type === MessageType.ISSUES_UPDATED) {
        dispatch(updateFromBackground(msg.payload));
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, [dispatch]);
}

/**
 * Hook to detect browser type for cross-browser compatibility
 */
export function useBrowserType(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
  // Detect browser based on user agent and available APIs
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('edg/')) return 'edge';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
  if (userAgent.includes('chrome')) return 'chrome';
  
  return 'unknown';
}

/**
 * Hook to get extension version
 */
export function useExtensionVersion(): string {
  return browser.runtime.getManifest().version;
}

/**
 * Hook to open extension options (if available)
 */
export function useOpenOptions() {
  return useCallback(() => {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    }
  }, []);
}

