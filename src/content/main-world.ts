/**
 * Main World Content Script
 * Intercepts fetch calls and anonymizes emails before sending to ChatGPT
 */

const DEBUG = true;

function log(...args: unknown[]): void {
  if (DEBUG) {
    console.log("[Prompt Monitor]", ...args);
  }
}

const originalFetch = window.fetch;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX);
  return matches ? [...new Set(matches)] : [];
}

function anonymizeEmails(text: string): {
  anonymized: string;
  emails: string[];
} {
  const emails = extractEmails(text);
  let anonymized = text;
  emails.forEach((email) => {
    anonymized = anonymized.split(email).join("[EMAIL_ADDRESS]");
  });
  return { anonymized, emails };
}

function isChatRequest(url: string): boolean {
  return (
    url.endsWith("/backend-api/conversation") ||
    url.endsWith("/backend-api/f/conversation")
  );
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

      // Extract prompt from messages
      let prompt = "";
      if (bodyObj.messages && Array.isArray(bodyObj.messages)) {
        for (const msg of bodyObj.messages) {
          if (msg.content?.parts && Array.isArray(msg.content.parts)) {
            prompt = msg.content.parts.join("\n");
            break;
          }
        }
      }

      const emails = extractEmails(prompt);

      if (emails.length > 0) {
        log("🚨 EMAILS DETECTED:", emails);

        // Anonymize the prompt
        const { anonymized } = anonymizeEmails(prompt);

        // Update the body with anonymized prompt
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

        // Notify content script about detection (for storage and UI)
        window.dispatchEvent(
          new CustomEvent("promptMonitorDetection", {
            detail: {
              type: "PROMPT_MONITOR_DETECTION",
              prompt: prompt,
              emails: emails,
              url: url,
              timestamp: Date.now(),
            },
          })
        );

        // Call fetch with anonymized body
        return originalFetch.apply(this, [
          input,
          { ...init, body: anonymizedBody },
        ]);
      }
    } catch (e) {
      log("Error processing request:", e);
    }
  }

  return originalFetch.apply(this, [input, init]);
};

log("Fetch interceptor installed (MAIN world)");
