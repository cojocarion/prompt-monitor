import browser from "webextension-polyfill";
import { MessageType, type StateResponse } from "@/shared/types";

interface DetectionEvent {
  type: string;
  action: "anonymized" | "sent_original";
  prompt: string;
  emails: string[];
  url: string;
  timestamp: number;
}

// Load and sync dismissed emails to main world
async function syncDismissedEmails(): Promise<void> {
  try {
    const response = (await browser.runtime.sendMessage({
      type: MessageType.GET_STATE,
    })) as StateResponse | undefined;

    if (response?.dismissedEmails) {
      const emails = response.dismissedEmails
        .filter((d) => d.expiresAt > Date.now())
        .map((d) => d.email);

      window.dispatchEvent(
        new CustomEvent("promptMonitorDismissedUpdate", {
          detail: { emails },
        })
      );
    }
  } catch (error) {
    console.error("[Prompt Monitor] Error syncing dismissed emails:", error);
  }
}

// Sync on load and periodically
syncDismissedEmails();
setInterval(syncDismissedEmails, 60000); // Every minute

// Listen for dismiss requests from main world
window.addEventListener("promptMonitorDismiss", async (event) => {
  const customEvent = event as CustomEvent<{ emails: string[] }>;
  const { emails } = customEvent.detail;

  try {
    // Dismiss each email
    for (const email of emails) {
      await browser.runtime.sendMessage({
        type: MessageType.DISMISS_EMAIL,
        payload: { email },
      });
    }

    // Sync dismissed emails back to main world
    await syncDismissedEmails();
  } catch (error) {
    console.error("[Prompt Monitor] Error dismissing emails:", error);
  }
});

window.addEventListener("promptMonitorDetection", async (event) => {
  const customEvent = event as CustomEvent<DetectionEvent>;
  const data = customEvent.detail;

  if (data.emails && data.emails.length > 0) {
    try {
      await browser.runtime.sendMessage({
        type: MessageType.SCAN_PAYLOAD,
        payload: {
          body: data.prompt,
          url: data.url,
          detectedEmails: data.emails,
          action: data.action,
        },
      });

      showAlert(data.emails.length, data.action);
    } catch (error) {
      console.error("[Prompt Monitor] Error sending to background:", error);
    }
  }
});

/**
 * Show alert notification to user
 */
function showAlert(
  count: number,
  action: "anonymized" | "sent_original"
): void {
  const isAnonymized = action === "anonymized";
  const bgColor = isAnonymized
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
  const icon = isAnonymized ? "🛡️" : "⚠️";
  const title = isAnonymized ? "Email(s) Anonymized" : "Email(s) Sent As-Is";
  const message = isAnonymized
    ? `${count} email address${
        count > 1 ? "es were" : " was"
      } anonymized before sending.`
    : `${count} email address${
        count > 1 ? "es were" : " was"
      } sent without anonymization.`;

  const alert = document.createElement("div");
  alert.id = "prompt-monitor-alert";
  alert.innerHTML = `
    <div style="
      position: fixed; top: 20px; right: 20px;
      background: ${bgColor}; color: white;
      padding: 16px 24px; border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px; display: flex; align-items: center; gap: 12px;
      animation: slideIn 0.3s ease-out; max-width: 400px;
    ">
      <div style="font-size: 24px;">${icon}</div>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
        <div style="opacity: 0.9; font-size: 13px;">${message}</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: rgba(255, 255, 255, 0.2); border: none; color: white;
        width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; margin-left: 8px;
      ">✕</button>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;

  document.getElementById("prompt-monitor-alert")?.remove();
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.style.transition = "opacity 0.3s ease-out";
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}
