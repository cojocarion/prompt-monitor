/**
 * Main World Content Script
 * Intercepts fetch calls and shows confirmation before sending to ChatGPT
 */

const DEBUG = true;

function log(...args: unknown[]): void {
  if (DEBUG) {
    console.log("[Prompt Monitor]", ...args);
  }
}

const originalFetch = window.fetch;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Storage for dismissed emails (synced from content script)
let dismissedEmails: Set<string> = new Set();

// Listen for dismissed emails updates from content script
window.addEventListener("promptMonitorDismissedUpdate", (event) => {
  const customEvent = event as CustomEvent<{ emails: string[] }>;
  dismissedEmails = new Set(
    customEvent.detail.emails.map((e) => e.toLowerCase())
  );
  log("Dismissed emails updated:", dismissedEmails);
});

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX);
  return matches ? [...new Set(matches)] : [];
}

function filterNonDismissedEmails(emails: string[]): string[] {
  return emails.filter((email) => !dismissedEmails.has(email.toLowerCase()));
}

function anonymizeEmails(text: string, emailsToAnonymize: string[]): string {
  let anonymized = text;
  emailsToAnonymize.forEach((email) => {
    anonymized = anonymized.split(email).join("[EMAIL_ADDRESS]");
  });
  return anonymized;
}

function isChatRequest(url: string): boolean {
  return (
    url.endsWith("/backend-api/conversation") ||
    url.endsWith("/backend-api/f/conversation")
  );
}

type UserDecision = "anonymize" | "send_original" | "cancel";

function showConfirmationPopup(emails: string[]): Promise<UserDecision> {
  return new Promise((resolve) => {
    document.getElementById("prompt-monitor-confirmation")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "prompt-monitor-confirmation";
    overlay.innerHTML = `
      <div class="pm-overlay" style="
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.6); z-index: 999998;
        display: flex; align-items: center; justify-content: center;
      ">
        <div class="pm-modal" style="
          background: #1e1e2e; border-radius: 16px; padding: 24px;
          max-width: 480px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #e0e0e0;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #fff;">
                Email Address${emails.length > 1 ? "es" : ""} Detected
              </h2>
              <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.7;">
                Your prompt contains ${emails.length} email address${
      emails.length > 1 ? "es" : ""
    }
              </p>
            </div>
          </div>
          <div style="background: #2a2a3e; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
            ${emails
              .map(
                (email) => `
              <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">
                <code style="background: rgba(245, 158, 11, 0.2); padding: 2px 8px;
                  border-radius: 4px; font-size: 13px; color: #fbbf24;">${email}</code>
              </div>
            `
              )
              .join("")}
          </div>
          <p style="font-size: 14px; margin-bottom: 20px;">What would you like to do?</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="pm-btn-anonymize" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white; border: none; padding: 12px 20px; border-radius: 8px;
              font-size: 14px; font-weight: 500; cursor: pointer;">
             Send Anonymized (Recommended)
            </button>
            <button id="pm-btn-original" style="background: #3b3b4f; color: white;
              border: 1px solid rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 8px;
              font-size: 14px; font-weight: 500; cursor: pointer;">
              Send Original (Not Recommended)
            </button>
            <button id="pm-btn-cancel" style="background: transparent; color: #a0a0a0;
              border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const cleanup = () => overlay.remove();

    document
      .getElementById("pm-btn-anonymize")
      ?.addEventListener("click", () => {
        cleanup();
        resolve("anonymize");
      });
    document
      .getElementById("pm-btn-original")
      ?.addEventListener("click", () => {
        cleanup();
        resolve("send_original");
      });
    document.getElementById("pm-btn-cancel")?.addEventListener("click", () => {
      cleanup();
      resolve("cancel");
    });

    overlay.querySelector(".pm-overlay")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        cleanup();
        resolve("cancel");
      }
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanup();
        document.removeEventListener("keydown", handleEscape);
        resolve("cancel");
      }
    };
    document.addEventListener("keydown", handleEscape);
  });
}

// Override fetch
window.fetch = async function (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.href
      : input.url;

  if (isChatRequest(url) && init?.body && typeof init.body === "string") {
    log("*** CHAT REQUEST INTERCEPTED ***");

    try {
      const bodyObj = JSON.parse(init.body);

      let prompt = "";
      if (bodyObj.messages && Array.isArray(bodyObj.messages)) {
        for (const msg of bodyObj.messages) {
          if (msg.content?.parts && Array.isArray(msg.content.parts)) {
            prompt = msg.content.parts.join("\n");
            break;
          }
        }
      }

      const allEmails = extractEmails(prompt);
      const emails = filterNonDismissedEmails(allEmails);

      if (emails.length > 0) {
        log("🚨 EMAILS DETECTED:", emails);

        const decision = await showConfirmationPopup(emails);
        log("User decision:", decision);

        if (decision === "cancel") {
          return new Response(JSON.stringify({ cancelled: true }), {
            status: 499,
            statusText: "Cancelled",
          });
        }

        if (decision === "anonymize") {
          const anonymized = anonymizeEmails(prompt, emails);

          if (bodyObj.messages && Array.isArray(bodyObj.messages)) {
            for (const msg of bodyObj.messages) {
              if (msg.content?.parts && Array.isArray(msg.content.parts)) {
                msg.content.parts = [anonymized];
                break;
              }
            }
          }

          const anonymizedBody = JSON.stringify(bodyObj);
          log("✅ ANONYMIZED BODY:", anonymizedBody.substring(0, 300));

          window.dispatchEvent(
            new CustomEvent("promptMonitorDetection", {
              detail: {
                type: "PROMPT_MONITOR_DETECTION",
                action: "anonymized",
                prompt,
                emails,
                url,
                timestamp: Date.now(),
              },
            })
          );

          return originalFetch.apply(this, [
            input,
            { ...init, body: anonymizedBody },
          ]);
        }

        // User chose send_original
        window.dispatchEvent(
          new CustomEvent("promptMonitorDetection", {
            detail: {
              type: "PROMPT_MONITOR_DETECTION",
              action: "sent_original",
              prompt,
              emails,
              url,
              timestamp: Date.now(),
            },
          })
        );

        // Send original request
        return originalFetch.apply(this, [input, init]);
      }
    } catch (e) {
      log("Error processing request:", e);
    }
  }

  return originalFetch.apply(this, [input, init]);
};

log("Fetch interceptor installed (MAIN world)");
