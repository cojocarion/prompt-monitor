import browser from "webextension-polyfill";
import type { Runtime } from "webextension-polyfill";
import {
  type ExtensionMessage,
  type EmailIssue,
  type StateResponse,
  MessageType,
} from "@/shared/types";
import {
  getIssues,
  addIssues,
  clearIssues,
  getDismissedEmails,
  dismissEmail,
} from "@/shared/storage";
import {
  detectAndAnonymize,
  createIssuesFromEmails,
  filterDismissedEmails,
} from "@/shared/emailDetector";

let recentIssues: EmailIssue[] = [];

browser.runtime.onMessage.addListener(
  (
    message: unknown,
    sender: Runtime.MessageSender
  ): Promise<unknown> | undefined => {
    const msg = message as ExtensionMessage;
    if (!msg?.type) return undefined;

    return handleMessage(msg, sender);
  }
);

async function handleMessage(
  message: ExtensionMessage,
  sender: Runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case MessageType.SCAN_PAYLOAD:
      return handleScanPayload(message.payload, sender.tab?.url ?? "");

    case MessageType.DISMISS_EMAIL:
      return handleDismissEmail(message.payload.email);

    case MessageType.CLEAR_HISTORY:
      return handleClearHistory();

    case MessageType.GET_STATE:
      return handleGetState();

    default:
      console.warn("[Background] Unknown message type:", message);
      return null;
  }
}

async function handleScanPayload(
  payload: { body: string; url: string },
  tabUrl: string
): Promise<{
  foundEmails: string[];
  anonymizedBody: string;
  shouldBlock: boolean;
  newIssues: EmailIssue[];
}> {
  const { body, url } = payload;

  const { anonymizedText, uniqueEmails } = detectAndAnonymize(body);

  if (uniqueEmails.length === 0) {
    return {
      foundEmails: [],
      anonymizedBody: body,
      shouldBlock: false,
      newIssues: [],
    };
  }

  const dismissed = await getDismissedEmails();
  const dismissedSet = new Set(dismissed.map((d) => d.email.toLowerCase()));

  const activeEmails = filterDismissedEmails(uniqueEmails, dismissedSet);

  if (activeEmails.length === 0) {
    return {
      foundEmails: uniqueEmails,
      anonymizedBody: anonymizedText,
      shouldBlock: false,
      newIssues: [],
    };
  }

  const newIssues = createIssuesFromEmails(activeEmails, url || tabUrl, body);

  await addIssues(newIssues);

  recentIssues = newIssues;

  notifyPopup();

  return {
    foundEmails: uniqueEmails,
    anonymizedBody: anonymizedText,
    shouldBlock: true,
    newIssues,
  };
}

async function handleDismissEmail(
  email: string
): Promise<{ success: boolean }> {
  await dismissEmail(email);
  notifyPopup();
  return { success: true };
}

async function handleClearHistory(): Promise<{ success: boolean }> {
  await clearIssues();
  recentIssues = [];
  notifyPopup();
  return { success: true };
}

async function handleGetState(): Promise<StateResponse> {
  const [issues, dismissedEmails] = await Promise.all([
    getIssues(),
    getDismissedEmails(),
  ]);

  return {
    issues,
    dismissedEmails,
    recentIssues,
  };
}

async function notifyPopup(): Promise<void> {
  try {
    const state = await handleGetState();
    await browser.runtime.sendMessage({
      type: MessageType.ISSUES_UPDATED,
      payload: {
        issues: state.issues,
        dismissedEmails: state.dismissedEmails,
      },
    });
  } catch {
    // Popup might not be open, ignore error
  }
}

console.log("[Prompt Monitor] Background service worker started");
