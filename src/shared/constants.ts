/**
 * Application constants
 */

/** Regex pattern for detecting email addresses (RFC 5322 compliant) */
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** Placeholder for anonymized email addresses */
export const EMAIL_PLACEHOLDER = '[EMAIL_ADDRESS]';

/** Duration in milliseconds for email dismissal (24 hours) */
export const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

/** Storage keys */
export const STORAGE_KEYS = {
  ISSUES: 'issues',
  DISMISSED_EMAILS: 'dismissedEmails',
} as const;

/** ChatGPT API endpoints to intercept */
export const CHATGPT_API_PATTERNS = [
  'https://chatgpt.com/backend-api/conversation',
  'https://chat.openai.com/backend-api/conversation',
] as const;

/** Maximum prompt preview length */
export const MAX_PROMPT_PREVIEW_LENGTH = 100;

/** Tab identifiers for the popup UI */
export const TABS = {
  ISSUES_FOUND: 'issues',
  HISTORY: 'history',
} as const;

export type TabId = typeof TABS[keyof typeof TABS];

