import browser from "webextension-polyfill";
import { MessageType } from "@/shared/types";

interface DetectionEvent {
  type: string;
  prompt: string;
  emails: string[];
  url: string;
  timestamp: number;
}

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
        },
      });

      showAlert(data.emails.length);
    } catch (error) {
      console.error("[Prompt Monitor] Error sending to background:", error);
    }
  }
});

/**
 * Show alert notification to user
 */
function showAlert(count: number): void {
  // Create alert element
  const alert = document.createElement("div");
  alert.id = "prompt-monitor-alert";
  alert.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    ">
      <div style="
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">
          🛡️ Email${count > 1 ? "s" : ""} Detected & Protected
        </div>
        <div style="opacity: 0.9; font-size: 13px;">
          ${count} email address${
    count > 1 ? "es were" : " was"
  } anonymized before sending.
          Click the extension icon for details.
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-left: 8px;
      ">✕</button>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;

  // Remove existing alert if any
  document.getElementById("prompt-monitor-alert")?.remove();

  // Add to page
  document.body.appendChild(alert);

  // Auto-remove after 8 seconds
  setTimeout(() => {
    alert.style.transition = "opacity 0.3s ease-out";
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, 8000);
}

console.log("[Prompt Monitor] Content script loaded (isolated world)");
