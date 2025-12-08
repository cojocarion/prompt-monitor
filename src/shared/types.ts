/**
 * Core types for the Prompt Monitor extension
 */

/** Detected email issue from a prompt */
export interface EmailIssue {
  id: string;
  email: string;
  detectedAt: number; // Unix timestamp
  url: string;
  promptPreview: string; // First 100 chars of the prompt for context
}

/** Dismissed email with expiration */
export interface DismissedEmail {
  email: string;
  dismissedAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp (24 hours after dismissedAt)
}

/** Storage schema for browser.storage.local */
export interface StorageSchema {
  issues: EmailIssue[];
  dismissedEmails: DismissedEmail[];
}

/** Message types for communication between scripts */
export enum MessageType {
  // Content -> Background
  SCAN_PAYLOAD = 'SCAN_PAYLOAD',
  
  // Background -> Content
  SCAN_RESULT = 'SCAN_RESULT',
  
  // Background -> Popup
  ISSUES_UPDATED = 'ISSUES_UPDATED',
  
  // Popup -> Background
  DISMISS_EMAIL = 'DISMISS_EMAIL',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
  GET_STATE = 'GET_STATE',
}

/** Base message structure */
export interface BaseMessage {
  type: MessageType;
}

/** Payload scan request from content script */
export interface ScanPayloadMessage extends BaseMessage {
  type: MessageType.SCAN_PAYLOAD;
  payload: {
    body: string;
    url: string;
  };
}

/** Scan result from background script */
export interface ScanResultMessage extends BaseMessage {
  type: MessageType.SCAN_RESULT;
  payload: {
    foundEmails: string[];
    anonymizedBody: string;
    shouldBlock: boolean;
    newIssues: EmailIssue[];
  };
}

/** Issues updated notification */
export interface IssuesUpdatedMessage extends BaseMessage {
  type: MessageType.ISSUES_UPDATED;
  payload: {
    issues: EmailIssue[];
    dismissedEmails: DismissedEmail[];
  };
}

/** Dismiss email request */
export interface DismissEmailMessage extends BaseMessage {
  type: MessageType.DISMISS_EMAIL;
  payload: {
    email: string;
  };
}

/** Clear history request */
export interface ClearHistoryMessage extends BaseMessage {
  type: MessageType.CLEAR_HISTORY;
}

/** Get current state request */
export interface GetStateMessage extends BaseMessage {
  type: MessageType.GET_STATE;
}

/** State response */
export interface StateResponse {
  issues: EmailIssue[];
  dismissedEmails: DismissedEmail[];
  recentIssues: EmailIssue[]; // Issues from the last scan
}

/** Union type for all messages */
export type ExtensionMessage =
  | ScanPayloadMessage
  | ScanResultMessage
  | IssuesUpdatedMessage
  | DismissEmailMessage
  | ClearHistoryMessage
  | GetStateMessage;

