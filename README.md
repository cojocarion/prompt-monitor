# 🛡️ Prompt Monitor - Browser Extension

A privacy-focused browser extension that monitors ChatGPT prompts for sensitive data (email addresses) and anonymizes them before sending.

## ✨ Features

- **Email Detection**: Automatically scans ChatGPT prompts for email addresses using regex
- **Automatic Anonymization**: Replaces detected emails with `[EMAIL_ADDRESS]` placeholder
- **Real-time Alerts**: Shows notifications when emails are detected and anonymized
- **Issues Tracking**: View all detected emails in the "Issues Found" tab
- **History**: Browse previously detected emails in the "History" tab
- **Dismiss System**: Dismiss specific emails for 24 hours (won't trigger alerts during this period)
- **Cross-Browser Support**: Works on Chrome, Firefox, Edge, and other Chromium-based browsers

## 🏗️ Tech Stack

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management with modern patterns
- **Vite** - Fast build tool with HMR
- **TailwindCSS v4** - Utility-first styling
- **WebExtension Polyfill** - Cross-browser compatibility
- **Manifest V3** - Latest extension manifest standard

## 📁 Project Structure

\`\`\`
src/
├── background/          # Service Worker (handles detection & storage)
│   └── index.ts
├── content/             # Content Scripts (page integration)
│   ├── index.ts        # Bridge between injected & background
│   └── injected.ts     # Fetch interceptor (runs in page context)
├── components/          # React UI components
│   ├── ui/             # Reusable UI components
│   ├── Header.tsx
│   ├── IssuesTab.tsx
│   ├── HistoryTab.tsx
│   └── EmailCard.tsx
├── hooks/               # Custom React hooks
├── store/               # Redux store & slices
├── shared/              # Shared types, constants & utilities
├── lib/                 # Utility functions
├── App.tsx              # Main popup component
└── main.tsx             # Entry point
\`\`\`

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- Chrome, Firefox, or Edge browser

### Installation

\`\`\`bash
# Install dependencies
bun install

# Development mode (with HMR)
bun run dev

# Production build
bun run build

# Build and create ZIP for distribution
bun run build:prod
\`\`\`

### Loading the Extension

#### Chrome / Edge
1. Run \`bun run build\`
2. Go to \`chrome://extensions/\` (or \`edge://extensions/\`)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the \`dist\` folder

#### Firefox
1. Run \`bun run build\`
2. Go to \`about:debugging#/runtime/this-firefox\`
3. Click "Load Temporary Add-on"
4. Select any file in the \`dist\` folder

## 🧪 Testing

1. Load the extension in your browser
2. Go to [ChatGPT](https://chatgpt.com)
3. Type a message containing an email address (e.g., "Contact me at test@example.com")
4. Send the message
5. You should see:
   - A popup alert indicating the email was anonymized
   - The extension popup shows the detected email in "Issues Found"

## 📦 Building for Distribution

\`\`\`bash
bun run build:prod
\`\`\`

This creates \`prompt-monitor-extension.zip\` ready for submission to browser extension stores.

## 🔧 How It Works

1. **Fetch Interception**: The injected script overrides \`window.fetch\` to intercept ChatGPT API calls
2. **Payload Scanning**: Request bodies are scanned for email patterns using regex
3. **Service Worker Processing**: The background script processes detections, manages storage, and handles dismiss logic
4. **Anonymization**: Detected emails are replaced with \`[EMAIL_ADDRESS]\` before the request is sent
5. **User Notification**: Alerts are shown and issues are logged for user review

## 📄 License

MIT
