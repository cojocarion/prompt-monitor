/**
 * Email detection and anonymization utilities
 */
import { EMAIL_REGEX, EMAIL_PLACEHOLDER, MAX_PROMPT_PREVIEW_LENGTH } from './constants';
import type { EmailIssue } from './types';
import { generateIssueId } from './storage';

export interface DetectionResult {
  foundEmails: string[];
  anonymizedText: string;
  uniqueEmails: string[];
}

/**
 * Detect all email addresses in a text
 * @param text - The text to scan
 * @returns Array of found email addresses
 */
export function detectEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX);
  return matches ?? [];
}

/**
 * Get unique emails from an array (case-insensitive)
 * @param emails - Array of email addresses
 * @returns Array of unique email addresses
 */
export function getUniqueEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  return emails.filter(email => {
    const lower = email.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

/**
 * Anonymize email addresses in text
 * @param text - The text containing emails
 * @returns Text with emails replaced by placeholder
 */
export function anonymizeEmails(text: string): string {
  return text.replace(EMAIL_REGEX, EMAIL_PLACEHOLDER);
}

/**
 * Detect and anonymize emails in one pass
 * @param text - The text to process
 * @returns Detection result with found emails and anonymized text
 */
export function detectAndAnonymize(text: string): DetectionResult {
  const foundEmails = detectEmails(text);
  const uniqueEmails = getUniqueEmails(foundEmails);
  const anonymizedText = anonymizeEmails(text);
  
  return {
    foundEmails,
    anonymizedText,
    uniqueEmails,
  };
}

/**
 * Create issue objects from detected emails
 * @param emails - Array of detected emails
 * @param url - The URL where emails were detected
 * @param promptText - The original prompt text
 * @returns Array of EmailIssue objects
 */
export function createIssuesFromEmails(
  emails: string[],
  url: string,
  promptText: string
): EmailIssue[] {
  const now = Date.now();
  const preview = promptText.substring(0, MAX_PROMPT_PREVIEW_LENGTH) + 
    (promptText.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : '');
  
  return getUniqueEmails(emails).map(email => ({
    id: generateIssueId(),
    email,
    detectedAt: now,
    url,
    promptPreview: preview,
  }));
}

/**
 * Filter out dismissed emails from detection results
 * @param emails - Array of detected emails
 * @param dismissedEmails - Set of dismissed email addresses (lowercase)
 * @returns Emails that are not dismissed
 */
export function filterDismissedEmails(
  emails: string[],
  dismissedEmails: Set<string>
): string[] {
  return emails.filter(email => !dismissedEmails.has(email.toLowerCase()));
}

