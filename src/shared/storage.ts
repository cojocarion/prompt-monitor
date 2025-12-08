/**
 * Browser storage utilities with cross-browser support
 */
import browser from 'webextension-polyfill';
import type { EmailIssue, DismissedEmail, StorageSchema } from './types';
import { STORAGE_KEYS, DISMISS_DURATION_MS } from './constants';

/** Get all issues from storage */
export async function getIssues(): Promise<EmailIssue[]> {
  const result = await browser.storage.local.get(STORAGE_KEYS.ISSUES);
  return (result[STORAGE_KEYS.ISSUES] as EmailIssue[]) ?? [];
}

/** Save issues to storage */
export async function saveIssues(issues: EmailIssue[]): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.ISSUES]: issues });
}

/** Add new issues to storage */
export async function addIssues(newIssues: EmailIssue[]): Promise<EmailIssue[]> {
  const existing = await getIssues();
  const updated = [...newIssues, ...existing];
  await saveIssues(updated);
  return updated;
}

/** Clear all issues from storage */
export async function clearIssues(): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.ISSUES]: [] });
}

/** Get dismissed emails from storage */
export async function getDismissedEmails(): Promise<DismissedEmail[]> {
  const result = await browser.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS);
  const dismissed = (result[STORAGE_KEYS.DISMISSED_EMAILS] as DismissedEmail[]) ?? [];
  
  // Filter out expired dismissals
  const now = Date.now();
  const active = dismissed.filter(d => d.expiresAt > now);
  
  // If any expired, update storage
  if (active.length !== dismissed.length) {
    await saveDismissedEmails(active);
  }
  
  return active;
}

/** Save dismissed emails to storage */
export async function saveDismissedEmails(dismissed: DismissedEmail[]): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.DISMISSED_EMAILS]: dismissed });
}

/** Dismiss an email for 24 hours */
export async function dismissEmail(email: string): Promise<DismissedEmail[]> {
  const dismissed = await getDismissedEmails();
  const now = Date.now();
  
  // Check if already dismissed
  const existing = dismissed.find(d => d.email.toLowerCase() === email.toLowerCase());
  if (existing && existing.expiresAt > now) {
    return dismissed;
  }
  
  // Add new dismissal
  const newDismissal: DismissedEmail = {
    email: email.toLowerCase(),
    dismissedAt: now,
    expiresAt: now + DISMISS_DURATION_MS,
  };
  
  const updated = [
    newDismissal,
    ...dismissed.filter(d => d.email.toLowerCase() !== email.toLowerCase()),
  ];
  
  await saveDismissedEmails(updated);
  return updated;
}

/** Check if an email is currently dismissed */
export async function isEmailDismissed(email: string): Promise<boolean> {
  const dismissed = await getDismissedEmails();
  const now = Date.now();
  return dismissed.some(
    d => d.email.toLowerCase() === email.toLowerCase() && d.expiresAt > now
  );
}

/** Get all storage data */
export async function getAllStorage(): Promise<StorageSchema> {
  const [issues, dismissedEmails] = await Promise.all([
    getIssues(),
    getDismissedEmails(),
  ]);
  return { issues, dismissedEmails };
}

/** Generate a unique ID for issues */
export function generateIssueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

