import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// HomeMind Ai Panel - Production build

const PROVIDERS = {
  openai: "OpenAI",
  llama: "Llama",
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
  alter: "Alter",
  local: "Local Model",
};

class AiAgentHaPanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object, reflect: false, attribute: false },
      narrow: { type: Boolean, reflect: false, attribute: false },
      panel: { type: Object, reflect: false, attribute: false },
      _messages: { type: Array, reflect: false, attribute: false },
      _isLoading: { type: Boolean, reflect: false, attribute: false },
      _error: { type: String, reflect: false, attribute: false },
      _errorDetails: { type: Object, reflect: false, attribute: false },
      _showErrorDetails: { type: Boolean, reflect: false, attribute: false },
      _pendingAutomation: { type: Object, reflect: false, attribute: false },
      _promptHistory: { type: Array, reflect: false, attribute: false },
      _showPredefinedPrompts: { type: Boolean, reflect: false, attribute: false },
      _showPromptHistory: { type: Boolean, reflect: false, attribute: false },
      _selectedPrompts: { type: Array, reflect: false, attribute: false },
      _selectedProvider: { type: String, reflect: false, attribute: false },
      _availableProviders: { type: Array, reflect: false, attribute: false },
      _showProviderDropdown: { type: Boolean, reflect: false, attribute: false },
      _statusDetails: { type: String, reflect: false, attribute: false },
      _showStatusDetails: { type: Boolean, reflect: false, attribute: false },
      _requestStartTime: { type: Number, reflect: false, attribute: false },
      _elapsedTime: { type: Number, reflect: false, attribute: false },
      _currentPrompt: { type: String, reflect: false, attribute: false },
      _statusLog: { type: Array, reflect: false, attribute: false },
      _aiResponse: { type: String, reflect: false, attribute: false },
      _collapsedItems: { type: Object, reflect: false, attribute: false },
      _customSystemPrompt: { type: String, reflect: false, attribute: false },
      _expandedDetails: { type: Object, reflect: false, attribute: false }
    };
  }

  static get styles() {
    return css`
      :host {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%);
        -webkit-font-smoothing: antialiased;
        display: flex;
        flex-direction: column;
        height: 100vh;
        position: relative;
        overflow: hidden;
      }
      :host::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
      }
      .header {
        background: rgba(15, 20, 25, 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(99, 102, 241, 0.3);
        color: #e0e7ff;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 20px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(99, 102, 241, 0.1);
        position: relative;
        z-index: 100;
      }
      .header > div {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
      }
      .clear-button {
        border: none;
        border-radius: 16px;
        background: var(--error-color);
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        font-weight: 500;
        font-size: 13px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        min-width: unset;
        width: auto;
        height: 36px;
        flex-shrink: 0;
        position: relative;
        z-index: 101;
        font-family: inherit;
      }
      .options-button {
        border: none;
        border-radius: 16px;
        background: rgba(99, 102, 241, 0.4);
        color: #a5b4fc;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        min-width: 40px;
        height: 36px;
        flex-shrink: 0;
        position: relative;
        z-index: 101;
        font-family: inherit;
        border: 2px solid rgba(99, 102, 241, 0.6);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
      }
      .options-button:hover {
        background: rgba(99, 102, 241, 0.5);
        color: #cbd5e1;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
      }
      .options-button:active {
        transform: translateY(0);
      }
      .options-button ha-icon {
        --mdc-icon-size: 18px;
        color: inherit;
        flex-shrink: 0;
      }
      .options-button span {
        color: inherit;
        white-space: nowrap;
      }
      .clear-button:hover {
        background: var(--error-color);
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.13);
      }
      .clear-button:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      }
      .clear-button ha-icon {
        --mdc-icon-size: 16px;
        margin-right: 2px;
        color: #fff;
      }
      .clear-button span {
        color: #fff;
        font-weight: 500;
      }
      .content {
        flex-grow: 1;
        padding: 24px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .chat-container {
        width: 100%;
        padding: 0;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        height: 100%;
      }
      .messages {
        overflow-y: auto;
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 20px;
        margin-bottom: 24px;
        padding: 0;
        background: rgba(15, 20, 25, 0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        flex-grow: 1;
        width: 100%;
        position: relative;
        z-index: 1;
      }
      .prompts-section {
        margin-bottom: 12px;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border-radius: 16px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid var(--divider-color);
      }
      .prompts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .prompts-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        color: var(--primary-color);
        font-size: 12px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      .prompts-toggle:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }
      .prompts-toggle ha-icon {
        --mdc-icon-size: 14px;
      }
      .prompt-bubbles {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
      }
      .prompt-bubble {
        background: var(--primary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 20px;
        padding: 6px 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        line-height: 1.3;
        color: var(--primary-text-color);
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .prompt-bubble:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .prompt-bubble:active {
        transform: translateY(0);
      }
      .history-bubble {
        background: var(--primary-background-color);
        border: 1px solid var(--accent-color);
        border-radius: 20px;
        padding: 6px 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        line-height: 1.3;
        color: var(--accent-color);
        white-space: nowrap;
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .history-bubble:hover {
        background: var(--accent-color);
        color: var(--text-primary-color);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .history-delete {
        opacity: 0;
        transition: opacity 0.2s ease;
        color: var(--error-color);
        cursor: pointer;
        --mdc-icon-size: 14px;
      }
      .history-bubble:hover .history-delete {
        opacity: 1;
        color: var(--text-primary-color);
      }
      .message {
        margin-bottom: 16px;
        padding: 16px 20px;
        border-radius: 16px;
        max-width: 80%;
        line-height: 1.6;
        animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        word-wrap: break-word;
        position: relative;
        overflow: hidden;
      }
      .message::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.1;
        pointer-events: none;
      }
      .user-message {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%);
        color: #ffffff;
        margin-left: auto;
        border-bottom-right-radius: 4px;
        box-shadow: 
          0 4px 20px rgba(99, 102, 241, 0.4),
          0 0 30px rgba(99, 102, 241, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .assistant-message {
        background: rgba(30, 35, 50, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #e0e7ff;
        margin-right: auto;
        border-bottom-left-radius: 4px;
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
      }
      .input-container {
        position: relative;
        width: 100%;
        background: rgba(15, 20, 25, 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 2px solid rgba(99, 102, 241, 0.3);
        border-radius: 20px;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        margin-bottom: 24px;
        transition: all 0.3s ease;
        z-index: 1;
      }
      .input-container:focus-within {
        border-color: rgba(99, 102, 241, 0.6);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          0 0 40px rgba(99, 102, 241, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .input-main {
        display: flex;
        align-items: flex-end;
        padding: 12px;
        gap: 12px;
      }
      .input-wrapper {
        flex-grow: 1;
        position: relative;
        border: 1px solid var(--divider-color);
      }
      textarea {
        width: 100%;
        min-height: 24px;
        max-height: 200px;
        padding: 12px 16px 12px 16px;
        border: none;
        outline: none;
        resize: none;
        font-size: 16px;
        line-height: 1.5;
        background: transparent;
        color: var(--primary-text-color);
        font-family: inherit;
      }
      textarea::placeholder {
        color: var(--secondary-text-color);
      }
      .input-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px 12px 16px;
        border-top: 1px solid var(--divider-color);
        background: var(--card-background-color);
        border-radius: 0 0 12px 12px;
      }
      .provider-selector {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .provider-button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        transition: all 0.2s ease;
        min-width: 150px;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>');
        background-repeat: no-repeat;
        background-position: right 8px center;
        padding-right: 30px;
      }
      .provider-button:hover {
        background-color: var(--primary-background-color);
        border-color: var(--primary-color);
      }
      .provider-button:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
      }
      .provider-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-right: 8px;
      }
      .send-button {
        --mdc-theme-primary: #6366f1;
        --mdc-theme-on-primary: #ffffff;
        --mdc-typography-button-font-size: 14px;
        --mdc-typography-button-text-transform: none;
        --mdc-typography-button-letter-spacing: 0;
        --mdc-typography-button-font-weight: 600;
        --mdc-button-height: 40px;
        --mdc-button-padding: 0 20px;
        border-radius: 12px;
        transition: all 0.3s ease;
        min-width: 80px;
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      }
      .send-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 30px rgba(99, 102, 241, 0.6);
      }
      .send-button:active {
        transform: translateY(0);
      }
      .send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }
      .loading {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        padding: 16px 20px;
        border-radius: 16px;
        background: rgba(30, 35, 50, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(99, 102, 241, 0.3);
        margin-right: auto;
        max-width: 80%;
        animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .loading-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .loading-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .loading-dots {
        display: flex;
        gap: 4px;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        animation: bounce 1.4s infinite ease-in-out;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
      }
      .dot:nth-child(1) { animation-delay: -0.32s; }
      .dot:nth-child(2) { animation-delay: -0.16s; }
      .status-toggle {
        cursor: pointer;
        color: #a5b4fc;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 8px;
        transition: all 0.3s ease;
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid rgba(99, 102, 241, 0.3);
        user-select: none;
      }
      .status-toggle:hover {
        background: rgba(99, 102, 241, 0.4);
        border-color: rgba(99, 102, 241, 0.5);
        color: #cbd5e1;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      }
      .status-toggle:active {
        transform: translateY(0);
      }
      .status-toggle ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.3s ease;
        color: #a5b4fc;
      }
      .status-toggle.expanded ha-icon {
        transform: rotate(180deg);
      }
      .status-details {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 500px;
        overflow-y: auto;
      }
      .detail-section {
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 8px;
        border: 1px solid rgba(99, 102, 241, 0.2);
        overflow: hidden;
        transition: all 0.2s ease;
      }
      .detail-section:hover {
        border-color: rgba(99, 102, 241, 0.4);
        background: rgba(0, 0, 0, 0.4);
      }
      .status-persistent {
        margin-top: 12px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }
      .detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        cursor: pointer;
        user-select: none;
        transition: background 0.2s ease;
      }
      .detail-header:hover {
        background: rgba(99, 102, 241, 0.1);
      }
      .detail-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        color: #a5b4fc;
      }
      .detail-title ha-icon {
        --mdc-icon-size: 14px;
        color: #6366f1;
      }
      .detail-toggle {
        --mdc-icon-size: 16px;
        color: #94a3b8;
        transition: transform 0.2s ease;
      }
      .detail-toggle.expanded {
        transform: rotate(180deg);
      }
      .detail-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
      }
      .detail-content.expanded {
        max-height: 1000px;
      }
      .detail-text {
        margin: 0;
        padding: 8px;
        font-size: 10px;
        font-family: 'Courier New', monospace;
        color: #cbd5e1;
        white-space: pre-wrap;
        word-break: break-word;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(99, 102, 241, 0.1);
        line-height: 1.4;
        overflow-x: auto;
      }
      .step-item {
        display: flex;
        gap: 8px;
        padding: 4px 8px;
        border-top: 1px solid rgba(99, 102, 241, 0.1);
        transition: background 0.2s ease;
      }
      .step-item:first-child {
        border-top: none;
      }
      .step-item:hover {
        background: rgba(99, 102, 241, 0.05);
      }
      .step-time {
        font-size: 9px;
        color: #94a3b8;
        min-width: 60px;
        flex-shrink: 0;
        font-family: monospace;
      }
      .step-content {
        flex: 1;
        min-width: 0;
      }
      .step-message {
        font-size: 10px;
        color: #e0e7ff;
        font-weight: 500;
        margin-bottom: 2px;
        line-height: 1.3;
      }
      .step-details {
        font-size: 9px;
        color: #cbd5e1;
        font-family: monospace;
        white-space: pre-wrap;
        word-break: break-word;
        padding: 4px 6px;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 3px;
        margin-top: 2px;
        border-left: 2px solid #6366f1;
        line-height: 1.3;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
          margin-top: 0;
        }
        to {
          opacity: 1;
          max-height: 400px;
          padding-top: 12px;
          padding-bottom: 12px;
          margin-top: 12px;
        }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
      }
      .dialog-content {
        background: rgba(15, 20, 25, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 2px solid rgba(99, 102, 241, 0.5);
        border-radius: 20px;
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.5),
          0 0 80px rgba(99, 102, 241, 0.3);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        animation: slideInUp 0.3s ease-out;
        overflow: hidden;
      }
      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(99, 102, 241, 0.3);
      }
      .dialog-header h2 {
        margin: 0;
        color: #e0e7ff;
        font-size: 20px;
        font-weight: 600;
      }
      .dialog-close {
        background: transparent;
        border: none;
        color: #a5b4fc;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dialog-close:hover {
        background: rgba(99, 102, 241, 0.2);
        color: #cbd5e1;
      }
      .dialog-close ha-icon {
        --mdc-icon-size: 24px;
      }
      .dialog-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }
      .option-section {
        margin-bottom: 24px;
      }
      .option-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #a5b4fc;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .option-label ha-icon {
        --mdc-icon-size: 20px;
      }
      .option-description {
        color: #cbd5e1;
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 12px;
      }
      .option-description code {
        background: rgba(99, 102, 241, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        color: #a5b4fc;
      }
      .prompt-textarea {
        width: 100%;
        min-height: 100px;
        padding: 12px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 12px;
        color: #e0e7ff;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        outline: none;
        transition: border-color 0.2s ease;
      }
      .prompt-textarea:focus {
        border-color: rgba(99, 102, 241, 0.6);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }
      .prompt-textarea::placeholder {
        color: #94a3b8;
      }
      .option-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 8px;
        padding: 8px 12px;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 8px;
        color: #cbd5e1;
        font-size: 12px;
        line-height: 1.4;
      }
      .option-hint ha-icon {
        --mdc-icon-size: 16px;
        color: #a5b4fc;
        margin-top: 2px;
        flex-shrink: 0;
      }
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid rgba(99, 102, 241, 0.3);
      }
      .dialog-footer ha-button {
        --mdc-button-height: 40px;
        --mdc-button-padding: 0 20px;
        border-radius: 12px;
        font-weight: 600;
      }
      .status-time {
        font-size: 13px;
        font-weight: 600;
        color: #a5b4fc;
        margin-left: auto;
        padding: 6px 12px;
        background: rgba(99, 102, 241, 0.2);
        border-radius: 8px;
        border: 1px solid rgba(99, 102, 241, 0.3);
        min-width: 50px;
        text-align: center;
      }
      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1.0);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .error {
        color: var(--error-color);
        padding: 16px;
        margin: 8px 0;
        border-radius: 12px;
        background: var(--error-background-color);
      }
      .error-message {
        color: var(--error-color);
        padding: 16px;
        margin: 8px 0;
        border-radius: 12px;
        background: var(--error-background-color);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
      .error-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .error-details {
        margin-top: 12px;
        padding: 12px;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
        color: #fca5a5;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 400px;
        overflow-y: auto;
      }
        border: 1px solid var(--error-color);
        animation: fadeIn 0.3s ease-out;
      }
      .automation-suggestion {
        background: rgba(30, 35, 50, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 2px solid rgba(99, 102, 241, 0.4);
        border-radius: 16px;
        padding: 16px;
        margin: 8px 0;
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        position: relative;
        z-index: 10;
      }
      .automation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        user-select: none;
        margin-bottom: 12px;
      }
      .automation-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #a5b4fc;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }
      .automation-toggle:hover {
        background: rgba(99, 102, 241, 0.2);
      }
      .automation-toggle ha-icon {
        --mdc-icon-size: 16px;
        transition: transform 0.3s ease;
      }
      .automation-toggle.collapsed ha-icon {
        transform: rotate(-90deg);
      }
      .automation-content {
        max-height: 2000px;
        overflow: hidden;
        transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
        opacity: 1;
      }
      .automation-content.collapsed {
        max-height: 0;
        opacity: 0;
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
      }
      .automation-title {
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--primary-color);
        font-size: 16px;
      }
      .automation-description {
        margin-bottom: 16px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }
      .automation-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        justify-content: flex-end;
      }
      .automation-actions ha-button {
        --mdc-button-height: 40px;
        --mdc-button-padding: 0 20px;
        --mdc-typography-button-font-size: 14px;
        --mdc-typography-button-font-weight: 600;
        border-radius: 20px;
      }
      .automation-actions ha-button:first-child {
        --mdc-theme-primary: var(--success-color, #4caf50);
        --mdc-theme-on-primary: #fff;
      }
      .automation-actions ha-button:last-child {
        --mdc-theme-primary: var(--error-color);
        --mdc-theme-on-primary: #fff;
      }
      .automation-details {
        margin-top: 8px;
        padding: 8px;
        background: var(--primary-background-color);
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        white-space: pre-wrap;
        overflow-x: auto;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--divider-color);
      }
      .dashboard-suggestion {
        background: rgba(15, 20, 25, 0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 2px solid rgba(99, 102, 241, 0.5);
        border-radius: 20px;
        padding: 20px;
        margin: 12px 0;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 0 60px rgba(99, 102, 241, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        position: relative;
        z-index: 10;
        animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }
      .dashboard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        user-select: none;
      }
      .dashboard-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #a5b4fc;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }
      .dashboard-toggle:hover {
        background: rgba(99, 102, 241, 0.2);
      }
      .dashboard-toggle ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.3s ease;
      }
      .dashboard-toggle.collapsed ha-icon {
        transform: rotate(-90deg);
      }
      .dashboard-content {
        max-height: 2000px;
        overflow: hidden;
        transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
        opacity: 1;
      }
      .dashboard-content.collapsed {
        max-height: 0;
        opacity: 0;
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
      }
      .dashboard-suggestion::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #6366f1, #a855f7, #6366f1);
        background-size: 200% 100%;
        animation: shimmer 3s infinite;
      }
      .dashboard-title {
        font-weight: 600;
        margin-bottom: 12px;
        color: #a5b4fc;
        font-size: 18px;
        text-shadow: 0 0 10px rgba(165, 180, 252, 0.5);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dashboard-description {
        margin-bottom: 20px;
        color: #cbd5e1;
        line-height: 1.5;
        font-size: 14px;
      }
      .dashboard-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        justify-content: flex-end;
      }
      .dashboard-actions ha-button {
        --mdc-button-height: 40px;
        --mdc-button-padding: 0 20px;
        --mdc-typography-button-font-size: 14px;
        --mdc-typography-button-font-weight: 600;
        border-radius: 20px;
      }
      .dashboard-actions ha-button:first-child {
        --mdc-theme-primary: var(--info-color, #2196f3);
        --mdc-theme-on-primary: #fff;
      }
      .dashboard-actions ha-button:last-child {
        --mdc-theme-primary: var(--error-color);
        --mdc-theme-on-primary: #fff;
      }
      .dashboard-details {
        margin-top: 8px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        white-space: pre-wrap;
        overflow-x: auto;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: #94a3b8;
      }
      .preview-window {
        margin: 16px 0;
        background: rgba(0, 0, 0, 0.4);
        border: 2px solid rgba(99, 102, 241, 0.4);
        border-radius: 16px;
        padding: 20px;
        position: relative;
        overflow: hidden;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .preview-toggle {
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 6px;
        color: #a5b4fc;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
        margin-left: auto;
      }
      .preview-toggle:hover {
        background: rgba(99, 102, 241, 0.2);
      }
      .preview-toggle ha-icon {
        --mdc-icon-size: 16px;
        transition: transform 0.3s ease;
      }
      .preview-toggle.collapsed ha-icon {
        transform: rotate(-90deg);
      }
      .preview-content {
        max-height: 2000px;
        overflow: hidden;
        transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
        opacity: 1;
      }
      .preview-content.collapsed {
        max-height: 0;
        opacity: 0;
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
      }
      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(99, 102, 241, 0.3);
      }
      .preview-title {
        font-size: 16px;
        font-weight: 600;
        color: #a5b4fc;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .preview-badge {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .dashboard-preview {
        display: grid;
        gap: 12px;
      }
      .preview-card {
        background: rgba(30, 35, 50, 0.6);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s ease;
      }
      .preview-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        border-color: rgba(99, 102, 241, 0.6);
      }
      .preview-card-title {
        font-size: 14px;
        font-weight: 600;
        color: #cbd5e1;
        margin-bottom: 8px;
      }
      .preview-card-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .preview-entity {
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid rgba(99, 102, 241, 0.4);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        color: #a5b4fc;
      }
      .entity-change-preview {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .change-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(30, 35, 50, 0.6);
        border-radius: 12px;
        border-left: 3px solid #6366f1;
      }
      .change-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
      }
      .change-details {
        flex: 1;
      }
      .change-label {
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 4px;
      }
      .change-value {
        font-size: 14px;
        color: #e0e7ff;
        font-weight: 500;
      }
      .change-arrow {
        color: #6366f1;
        font-size: 20px;
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .no-providers {
        color: var(--error-color);
        font-size: 14px;
        padding: 8px;
      }
    `;
  }

  constructor() {
    super();
    this._messages = [];
    this._isLoading = false;
    this._error = null;
    this._errorDetails = null;
    this._showErrorDetails = false;
    this._pendingAutomation = null;
    this._promptHistory = [];
    this._promptHistoryLoaded = false;
    this._showPredefinedPrompts = true;
    this._showPromptHistory = true;
    this._statusDetails = '';
    this._showStatusDetails = false;
    this._requestStartTime = null;
    this._elapsedTime = 0;
    this._currentPrompt = '';
    this._statusLog = [];
    this._aiResponse = '';
    this._collapsedItems = {};
    this._customSystemPrompt = '';
    this._expandedDetails = {
      prompt: false,
      steps: true,
      response: false
    };
    // Load custom system prompt asynchronously - will be called after component is connected
    this._predefinedPrompts = [
      "Build a new automation to turn off all lights at 10:00 PM every day",
      "What's the current temperature inside and outside?",
      "Turn on all the lights in the living room",
      "Show me today's weather forecast",
      "What devices are currently on?",
      "Show me the energy usage for today",
      "Are all the doors and windows locked?",
      "Turn on movie mode in the living room",
      "What's the status of my security system?",
      "Show me who's currently home",
      "Turn off all devices when I leave home"
    ];
    this._selectedPrompts = this._getRandomPrompts();
    this._selectedProvider = null;
    this._availableProviders = [];
    this._showProviderDropdown = false;
    this.providersLoaded = false;
    this._eventSubscriptionSetup = false;
    this._serviceCallTimeout = null;
    // Load saved provider preference
    this._loadSelectedProvider();
    console.debug("HomeMind Ai Panel constructor called");
  }

  _getRandomPrompts() {
    // Shuffle array and take first 3 items
    const shuffled = [...this._predefinedPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  async connectedCallback() {
    try {
      super.connectedCallback();
      console.log("✅ HomeMind Ai Panel connectedCallback called");
      
      // Load chat history from localStorage
      this._loadChatHistory();
      
      // Load custom system prompt (safe to call here as method is defined)
      try {
        this._loadCustomSystemPrompt();
      } catch (e) {
        console.error('Error loading custom prompt:', e);
      }
      
      if (this.hass && !this._eventSubscriptionSetup) {
        this._eventSubscriptionSetup = true;
        this.hass.connection.subscribeEvents(
          (event) => this._handleLlamaResponse(event),
          'ai_agent_ha_response'
        );
        console.log("✅ Event subscription set up in connectedCallback()");
        // Load prompt history from Home Assistant storage
        await this._loadPromptHistory();
      } else {
        console.log("⚠️ DEBUG: hass not available or subscription already set up");
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.shadowRoot.querySelector('.provider-selector')?.contains(e.target)) {
          this._showProviderDropdown = false;
        }
      });
    } catch (error) {
      console.error("❌ ERROR in connectedCallback:", error);
      console.error("   Error stack:", error.stack);
    }
  }

  async updated(changedProps) {
    try {
      console.log("✅ DEBUG: updated() called with:", Object.keys(changedProps));

      // Set up event subscription when hass becomes available
      if (changedProps.has('hass')) {
        console.log("✅ DEBUG: hass property updated");
        console.log("   hass available:", !!this.hass);
        if (this.hass && !this._eventSubscriptionSetup) {
          this._eventSubscriptionSetup = true;
          this.hass.connection.subscribeEvents(
            (event) => this._handleLlamaResponse(event),
            'ai_agent_ha_response'
          );
          console.log("✅ Event subscription set up in updated()");
        }
      }
    } catch (error) {
      console.error("❌ ERROR in updated:", error);
      console.error("   Error stack:", error.stack);
    }

    // Load providers when hass becomes available
    if (changedProps.has('hass') && this.hass && !this.providersLoaded) {
      this.providersLoaded = true;

      try {
        // Uses the WebSocket API to get all entries with their complete data
        const allEntries = await this.hass.callWS({ type: 'config_entries/get' });

        const aiAgentEntries = allEntries.filter(
          entry => entry.domain === 'ai_agent_ha'
        );

        if (aiAgentEntries.length > 0) {
          // More robust approach: extract provider from entry data or use title mapping as fallback
          this._availableProviders = aiAgentEntries.map(entry => {
            let provider = "unknown";
            
            console.debug("Processing entry:", {
              title: entry.title,
              data: entry.data,
              options: entry.options
            });
            
            // First try to get provider from entry data
            if (entry.data && entry.data.ai_provider) {
              provider = entry.data.ai_provider;
              console.debug("Found provider in entry.data:", provider);
            } 
            // Try entry.options as well
            else if (entry.options && entry.options.ai_provider) {
              provider = entry.options.ai_provider;
              console.debug("Found provider in entry.options:", provider);
            }
            // Fallback to title mapping
            else if (entry.title) {
              const titleToProviderMap = {
                "HomeMind Ai (OpenRouter)": "openrouter",
                "HomeMind Ai (Google Gemini)": "gemini",
                "HomeMind Ai (OpenAI)": "openai",
                "HomeMind Ai (Llama)": "llama",
                "HomeMind Ai (Anthropic (Claude))": "anthropic",
                "HomeMind Ai (Anthropic)": "anthropic",
                "HomeMind Ai (Alter)": "alter",
                "HomeMind Ai (Local Model)": "local",
                // Legacy titles (before rebrand)
                "AI Agent HA (OpenRouter)": "openrouter",
                "AI Agent HA (Google Gemini)": "gemini",
                "AI Agent HA (OpenAI)": "openai",
                "AI Agent HA (Llama)": "llama",
                "AI Agent HA (Anthropic (Claude))": "anthropic",
                "AI Agent HA (Anthropic)": "anthropic",
                "AI Agent HA (Alter)": "alter",
                "AI Agent HA (Local Model)": "local",
              };
              provider = titleToProviderMap[entry.title] || "unknown";
              console.debug("Mapped provider from title:", entry.title, "->", provider);
            }
            
            // If still unknown, try to extract from title using regex
            if (provider === "unknown" && entry.title) {
              const titleLower = entry.title.toLowerCase();
              if (titleLower.includes("openrouter")) provider = "openrouter";
              else if (titleLower.includes("gemini")) provider = "gemini";
              else if (titleLower.includes("openai")) provider = "openai";
              else if (titleLower.includes("llama")) provider = "llama";
              else if (titleLower.includes("anthropic") || titleLower.includes("claude")) provider = "anthropic";
              else if (titleLower.includes("alter")) provider = "alter";
              else if (titleLower.includes("local")) provider = "local";
              console.debug("Extracted provider from title using regex:", provider);
            }
            
            const label = PROVIDERS[provider] || (provider !== "unknown" ? provider : "Unknown Provider");
            
            return {
              value: provider,
              label: label
            };
          });

          console.debug("Available AI providers (mapped from data/title):", this._availableProviders);

          // Load custom system prompt from config entries
          for (const entry of aiAgentEntries) {
            if (entry.data?.custom_system_prompt) {
              const entryProvider = entry.data?.ai_provider;
              // If we have a selected provider, only load for that one
              if (this._selectedProvider && entryProvider === this._selectedProvider) {
                this._customSystemPrompt = entry.data.custom_system_prompt;
                console.debug('Loaded custom system prompt from config entry for', entryProvider);
                break;
              } else if (!this._selectedProvider) {
                // If no provider selected yet, load from first entry with a prompt
                this._customSystemPrompt = entry.data.custom_system_prompt;
                console.debug('Loaded custom system prompt from config entry');
                break;
              }
            }
          }

          if (!this._selectedProvider && this._availableProviders.length > 0) {
            // Check for default provider from any config entry
            let defaultProvider = null;
            let defaultModel = null;
            for (const entry of aiAgentEntries) {
              if (entry.data?.default_provider) {
                defaultProvider = entry.data.default_provider;
                defaultModel = entry.data.default_model || null;
                break;
              }
            }
            
            // Use default provider if set, otherwise use first available
            if (defaultProvider) {
              const providerExists = this._availableProviders.some(p => p.value === defaultProvider);
              if (providerExists) {
                this._selectedProvider = defaultProvider;
                console.debug("Using default provider from config:", defaultProvider);
                // If default model is set, we could use it here, but model selection is handled separately
              } else {
                // Default provider not available, use first valid
                const validProviders = this._availableProviders.filter(p => p.value !== "unknown");
                this._selectedProvider = validProviders.length > 0 ? validProviders[0].value : this._availableProviders[0].value;
                console.debug("Default provider not available, using:", this._selectedProvider);
              }
            } else {
              // Filter out "unknown" providers if there are valid ones
              const validProviders = this._availableProviders.filter(p => p.value !== "unknown");
              if (validProviders.length > 0) {
                this._selectedProvider = validProviders[0].value;
              } else {
                this._selectedProvider = this._availableProviders[0].value;
              }
              console.debug("No default provider set, auto-selected:", this._selectedProvider);
            }
            // Save the auto-selected provider
            this._saveSelectedProvider(this._selectedProvider);
            // Load custom prompt for auto-selected provider
            const autoSelectedEntry = aiAgentEntries.find(entry => {
              const entryProvider = entry.data?.ai_provider;
              return entryProvider === this._selectedProvider;
            });
            if (autoSelectedEntry && autoSelectedEntry.data?.custom_system_prompt) {
              this._customSystemPrompt = autoSelectedEntry.data.custom_system_prompt;
              console.debug('Loaded custom system prompt for auto-selected provider');
            }
          } else if (this._selectedProvider) {
            // Verify saved provider still exists in available providers
            const providerExists = this._availableProviders.some(p => p.value === this._selectedProvider);
            if (!providerExists) {
              // Saved provider no longer available, select first valid one
              const validProviders = this._availableProviders.filter(p => p.value !== "unknown");
              if (validProviders.length > 0) {
                this._selectedProvider = validProviders[0].value;
                this._saveSelectedProvider(this._selectedProvider);
              }
            }
          }
        } else {
          console.debug("No 'ai_agent_ha' config entries found via WebSocket.");
          this._availableProviders = [];
        }
      } catch (error) {
        console.error("Error fetching config entries via WebSocket:", error);
        this._error = error.message || 'Failed to load AI provider configurations.';
        this._availableProviders = [];
      }
      this.requestUpdate();
    }

    // Load prompt history when hass becomes available and we haven't loaded it yet
    if (changedProps.has('hass') && this.hass && !this._promptHistoryLoaded) {
      this._promptHistoryLoaded = true;
      await this._loadPromptHistory();
    }

    // Load prompt history when provider changes
    if (changedProps.has('_selectedProvider') && this._selectedProvider && this.hass) {
      await this._loadPromptHistory();
      // Reload custom system prompt when provider changes
      await this._loadCustomSystemPrompt();
    }

    if (changedProps.has('_messages') || changedProps.has('_isLoading')) {
      this._scrollToBottom();
    }
  }

  _renderPromptsSection() {
    return html`
      <div class="prompts-section">
        <div class="prompts-header">
          <span>Quick Actions</span>
          <div style="display: flex; gap: 12px;">
            <div class="prompts-toggle" @click=${() => this._togglePredefinedPrompts()}>
              <ha-icon icon="${this._showPredefinedPrompts ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
              <span>Suggestions</span>
            </div>
            ${this._promptHistory.length > 0 ? html`
              <div class="prompts-toggle" @click=${() => this._togglePromptHistory()}>
                <ha-icon icon="${this._showPromptHistory ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                <span>Recent</span>
              </div>
            ` : ''}
          </div>
        </div>

        ${this._showPredefinedPrompts ? html`
          <div class="prompt-bubbles">
            ${this._selectedPrompts.map(prompt => html`
              <div class="prompt-bubble" @click=${() => this._usePrompt(prompt)}>
                ${prompt}
              </div>
            `)}
          </div>
        ` : ''}

        ${this._showPromptHistory && this._promptHistory.length > 0 ? html`
          <div class="prompt-bubbles">
            ${this._promptHistory.slice(-3).reverse().map((prompt, index) => html`
              <div class="history-bubble" @click=${(e) => this._useHistoryPrompt(e, prompt)}>
                <span style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis;">${prompt}</span>
                <ha-icon
                  class="history-delete"
                  icon="mdi:close"
                  @click=${(e) => this._deleteHistoryItem(e, prompt)}
                ></ha-icon>
              </div>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _togglePredefinedPrompts() {
    this._showPredefinedPrompts = !this._showPredefinedPrompts;
    // Refresh random selection when toggling on
    if (this._showPredefinedPrompts) {
      this._selectedPrompts = this._getRandomPrompts();
    }
  }

  _togglePromptHistory() {
    this._showPromptHistory = !this._showPromptHistory;
  }

  _usePrompt(prompt) {
    if (this._isLoading) return;
    const promptEl = this.shadowRoot.querySelector('#prompt');
    if (promptEl) {
      promptEl.value = prompt;
      promptEl.focus();
    }
  }

  _useHistoryPrompt(event, prompt) {
    event.stopPropagation();
    if (this._isLoading) return;
    const promptEl = this.shadowRoot.querySelector('#prompt');
    if (promptEl) {
      promptEl.value = prompt;
      promptEl.focus();
    }
  }

  async _deleteHistoryItem(event, prompt) {
    event.stopPropagation();
    this._promptHistory = this._promptHistory.filter(p => p !== prompt);
    await this._savePromptHistory();
    this.requestUpdate();
  }

  async _addToHistory(prompt) {
    if (!prompt || prompt.trim().length === 0) return;

    // Remove duplicates and add to front
    this._promptHistory = this._promptHistory.filter(p => p !== prompt);
    this._promptHistory.push(prompt);

    // Keep only last 20 prompts
    if (this._promptHistory.length > 20) {
      this._promptHistory = this._promptHistory.slice(-20);
    }

    await this._savePromptHistory();
    this.requestUpdate();
  }

  async _loadPromptHistory() {
    if (!this.hass) {
      console.debug('Hass not available, skipping prompt history load');
      return;
    }

    console.debug('Loading prompt history...');
    try {
      const result = await this.hass.callService('ai_agent_ha', 'load_prompt_history', {
        provider: this._selectedProvider
      });
      console.debug('Prompt history service result:', result);

      if (result && result.response && result.response.history) {
        this._promptHistory = result.response.history;
        console.debug('Loaded prompt history from service:', this._promptHistory);
        this.requestUpdate();
      } else if (result && result.history) {
        this._promptHistory = result.history;
        console.debug('Loaded prompt history from service (direct):', this._promptHistory);
        this.requestUpdate();
      } else {
        console.debug('No prompt history returned from service, checking localStorage');
        // Fallback to localStorage if service returns no data
        this._loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading prompt history from service:', error);
      // Fallback to localStorage if service fails
      this._loadFromLocalStorage();
    }
  }

  _loadFromLocalStorage() {
    try {
      const savedList = localStorage.getItem('ai_agent_ha_prompt_history');
      if (savedList) {
        const parsedList = JSON.parse(savedList);
        const saved = parsedList.history && parsedList.provider === this._selectedProvider ? parsedList.history : null;
        if (saved) {
          this._promptHistory = JSON.parse(saved);
          console.debug('Loaded prompt history from localStorage:', this._promptHistory);
          this.requestUpdate();
        } else {
          console.debug('No prompt history in localStorage');
          this._promptHistory = [];
        }
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      this._promptHistory = [];
    }
  }

  async _savePromptHistory() {
    if (!this.hass) {
      console.debug('Hass not available, saving to localStorage only');
      this._saveToLocalStorage();
      return;
    }

    console.debug('Saving prompt history:', this._promptHistory);
    try {
      const result = await this.hass.callService('ai_agent_ha', 'save_prompt_history', {
        history: this._promptHistory,
        provider: this._selectedProvider
      });
      console.debug('Save prompt history result:', result);

      // Also save to localStorage as backup
      this._saveToLocalStorage();
    } catch (error) {
      console.error('Error saving prompt history to service:', error);
      // Fallback to localStorage if service fails
      this._saveToLocalStorage();
    }
  }

  _saveToLocalStorage() {
    try {
      const data = {
        provider: this._selectedProvider,
        history: JSON.stringify(this._promptHistory)
      }
      localStorage.setItem('ai_agent_ha_prompt_history', JSON.stringify(data));
      console.debug('Saved prompt history to localStorage');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  render() {
    try {
      if (!this.hass) {
        console.log("⚠️ DEBUG: hass not available, showing loading state");
        return html`
          <div style="padding: 20px; color: #e0e7ff; text-align: center; margin-top: 50px;">
            <ha-icon icon="mdi:loading" style="animation: spin 1s linear infinite; --mdc-icon-size: 48px;"></ha-icon>
            <div style="margin-top: 16px; font-size: 16px;">Loading HomeMind Ai...</div>
            <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">Waiting for Home Assistant connection...</div>
          </div>
        `;
      }

      console.log("✅ DEBUG: Rendering panel with hass available");
      console.log("   Messages:", this._messages?.length || 0);
      console.log("   Loading:", this._isLoading);
      console.log("   Error:", this._error);
      console.log("   Provider:", this._selectedProvider);

    return html`
      <div class="header">
        <ha-icon icon="mdi:robot"></ha-icon>
        HomeMind Ai
        <div style="display: flex; gap: 8px; margin-left: auto;">
          <button
            class="clear-button"
            @click=${this._clearChat}
            ?disabled=${this._isLoading}
          >
            <ha-icon icon="mdi:delete-sweep"></ha-icon>
            <span>Clear Chat</span>
          </button>
        </div>
      </div>
      <div class="content">
        <div class="chat-container">
          <div class="messages" id="messages">
            ${this._messages.map((msg, index) => html`
              <div class="message ${msg.type}-message">
                ${msg.text}
                ${msg.automation ? html`
                  <div class="automation-suggestion">
                    <div class="automation-header" @click=${() => this._toggleCollapse(`automation-${index}`)}>
                      <div class="automation-title">${msg.automation.alias}</div>
                      <div class="automation-toggle ${this._isCollapsed(`automation-${index}`) ? 'collapsed' : ''}">
                        <ha-icon icon="mdi:chevron-down"></ha-icon>
                        <span>${this._isCollapsed(`automation-${index}`) ? 'Expand' : 'Collapse'}</span>
                      </div>
                    </div>
                    <div class="automation-content ${this._isCollapsed(`automation-${index}`) ? 'collapsed' : ''}">
                      <div class="automation-description">${msg.automation.description}</div>
                      <div class="automation-details">
                        ${JSON.stringify(msg.automation, null, 2)}
                      </div>
                      <div class="automation-actions">
                        <ha-button
                          @click=${() => this._approveAutomation(msg.automation)}
                          .disabled=${this._isLoading}
                        >Approve</ha-button>
                        <ha-button
                          @click=${() => this._rejectAutomation()}
                          .disabled=${this._isLoading}
                        >Reject</ha-button>
                      </div>
                    </div>
                  </div>
                ` : ''}
                ${msg.dashboard ? html`
                  <div class="dashboard-suggestion">
                    <div class="dashboard-header" @click=${() => this._toggleCollapse(`dashboard-${index}`)}>
                      <div class="dashboard-title">
                        <ha-icon icon="mdi:view-dashboard"></ha-icon>
                        ${msg.dashboard.title}
                      </div>
                      <div class="dashboard-toggle ${this._isCollapsed(`dashboard-${index}`) ? 'collapsed' : ''}">
                        <ha-icon icon="mdi:chevron-down"></ha-icon>
                        <span>${this._isCollapsed(`dashboard-${index}`) ? 'Expand' : 'Collapse'}</span>
                      </div>
                    </div>
                    <div class="dashboard-content ${this._isCollapsed(`dashboard-${index}`) ? 'collapsed' : ''}">
                      <div class="dashboard-description">Dashboard with ${msg.dashboard.views ? msg.dashboard.views.length : 0} view(s)</div>
                      ${this._renderDashboardPreview(msg.dashboard)}
                      <div class="dashboard-actions">
                        <ha-button
                          @click=${() => this._approveDashboard(msg.dashboard)}
                          .disabled=${this._isLoading}
                        >Create Dashboard</ha-button>
                        <ha-button
                          @click=${() => this._rejectDashboard()}
                          .disabled=${this._isLoading}
                        >Cancel</ha-button>
                      </div>
                    </div>
                  </div>
                ` : ''}
                ${msg.entityChange ? html`
                  ${this._renderEntityChangePreview(msg.entityChange)}
                ` : ''}
              </div>
            `)}
            ${this._isLoading ? html`
              <div class="loading">
                <div class="loading-header">
                  <div class="loading-content">
                    <span>AI Agent is processing</span>
                    <div class="loading-dots">
                      <div class="dot"></div>
                      <div class="dot"></div>
                      <div class="dot"></div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${this._requestStartTime ? html`
                      <span class="status-time">
                        ${this._elapsedTime}s
                      </span>
                    ` : ''}
                    <div 
                      class="status-toggle ${this._showStatusDetails ? 'expanded' : ''}"
                      @click=${() => { 
                        this._showStatusDetails = !this._showStatusDetails; 
                        this.requestUpdate(); 
                      }}
                    >
                      <ha-icon icon="mdi:chevron-down"></ha-icon>
                      <span>${this._showStatusDetails ? 'Hide' : 'Show'} Details</span>
                    </div>
                  </div>
                </div>
                ${this._showStatusDetails ? this._renderStatusDetails() : ''}
              </div>
            ` : ''}
            ${this._error ? html`
              <div class="error-message">
                <div class="error-header">
                  <ha-icon icon="mdi:alert-circle" style="color: #ef4444; margin-right: 8px;"></ha-icon>
                  <div style="flex: 1;">${this._error}</div>
                  ${this._errorDetails ? html`
                    <div 
                      class="detail-toggle ${this._showErrorDetails ? 'expanded' : ''}"
                      @click=${() => { 
                        this._showErrorDetails = !this._showErrorDetails; 
                        this.requestUpdate(); 
                      }}
                      style="cursor: pointer; display: flex; align-items: center; gap: 4px; color: #94a3b8; font-size: 12px;"
                    >
                      <ha-icon icon="mdi:chevron-down"></ha-icon>
                      <span>${this._showErrorDetails ? 'Hide' : 'Show'} Details</span>
                    </div>
                  ` : ''}
                </div>
                ${this._showErrorDetails && this._errorDetails ? html`
                  <div class="error-details" style="margin-top: 12px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 4px; font-family: monospace; font-size: 11px; color: #fca5a5; white-space: pre-wrap; word-break: break-all;">
                    ${JSON.stringify(this._errorDetails, null, 2)}
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
          ${this._renderPromptsSection()}
          <div class="input-container">
            <div class="input-main">
              <div class="input-wrapper">
                <textarea
                  id="prompt"
                  placeholder="Ask me anything about your Home Assistant..."
                  ?disabled=${this._isLoading}
                  @keydown=${this._handleKeyDown}
                  @input=${this._autoResize}
                ></textarea>
              </div>
            </div>

            <div class="input-footer">
              <div class="provider-selector">
                <span class="provider-label">Model:</span>
                ${this._availableProviders.length > 0 ? html`
                  <select
                    class="provider-button"
                    @change=${(e) => this._selectProvider(e.target.value)}
                    .value=${this._selectedProvider || this._availableProviders[0]?.value || ''}
                  >
                    ${this._availableProviders.map(provider => html`
                      <option
                        value=${provider.value}
                        ?selected=${provider.value === (this._selectedProvider || this._availableProviders[0]?.value)}
                      >
                        ${provider.label}
                      </option>
                    `)}
                  </select>
                ` : html`
                  <div class="provider-button" style="color: #94a3b8;">
                    No providers configured
                  </div>
                `}
              </div>

              <ha-button
                class="send-button"
                @click=${this._sendMessage}
                .disabled=${this._isLoading || !this._hasProviders()}
              >
                <ha-icon icon="mdi:send"></ha-icon>
              </ha-button>
            </div>
          </div>
        </div>
      </div>
    `;
    } catch (error) {
      console.error("❌ ERROR: Failed to render panel:", error);
      console.error("   Error stack:", error.stack);
      return html`
        <div style="padding: 20px; color: #ef4444; text-align: center; margin-top: 50px;">
          <ha-icon icon="mdi:alert-circle" style="--mdc-icon-size: 48px; color: #ef4444;"></ha-icon>
          <div style="margin-top: 16px; font-size: 16px; font-weight: 600;">Error Loading Panel</div>
          <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">${error.message || 'Unknown error'}</div>
          <div style="margin-top: 16px; font-size: 11px; color: #64748b; font-family: monospace;">
            Check browser console (F12) for details
          </div>
        </div>
      `;
    }
  }

  _scrollToBottom() {
    const messages = this.shadowRoot.querySelector('#messages');
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  _autoResize(e) {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !this._isLoading) {
      e.preventDefault();
      this._sendMessage();
    }
  }

  _toggleProviderDropdown() {
    this._showProviderDropdown = !this._showProviderDropdown;
    this.requestUpdate();
  }

  async _selectProvider(provider) {
    // Save current chat before switching
    this._saveChatHistory();
    
    this._selectedProvider = provider;
    console.debug("Provider changed to:", provider);
    
    // Save provider preference
    this._saveSelectedProvider(provider);
    
    // Load chat history for new provider
    this._loadChatHistory();
    
    await this._loadPromptHistory();
    this.requestUpdate();
  }

  _getSelectedProviderLabel() {
    if (!this._selectedProvider) {
      return 'Select Model';
    }
    const provider = this._availableProviders.find(p => p.value === this._selectedProvider);
    if (provider && provider.label) {
      return provider.label;
    }
    // Fallback: try to get from PROVIDERS map
    return PROVIDERS[this._selectedProvider] || this._selectedProvider || 'Unknown Model';
  }

  _loadSelectedProvider() {
    try {
      const saved = localStorage.getItem('ai_agent_ha_selected_provider');
      if (saved) {
        this._selectedProvider = saved;
        console.debug('Loaded saved provider:', saved);
      }
    } catch (e) {
      console.error('Error loading selected provider:', e);
    }
  }

  _saveSelectedProvider(provider) {
    try {
      if (provider) {
        localStorage.setItem('ai_agent_ha_selected_provider', provider);
        console.debug('Saved provider preference:', provider);
      }
    } catch (e) {
      console.error('Error saving selected provider:', e);
    }
  }

  async _sendMessage() {
    const promptEl = this.shadowRoot.querySelector('#prompt');
    let prompt = promptEl.value.trim();
    if (!prompt || this._isLoading) return;

    // Store original user message for display
    const originalUserMessage = prompt;
    
    // Prepend custom system prompt if set
    if (this._customSystemPrompt && this._customSystemPrompt.trim()) {
      const customPrompt = this._customSystemPrompt.trim();
      // Replace *User MSG* or {USER_MSG} with the actual user message
      if (customPrompt.includes('*User MSG*') || customPrompt.includes('{USER_MSG}')) {
        // Replace placeholder with user message
        prompt = customPrompt.replace(/\*User MSG\*/g, originalUserMessage).replace(/{USER_MSG}/g, originalUserMessage);
      } else {
        // If no placeholder, prepend custom prompt followed by user message
        prompt = `${customPrompt}\n\n${originalUserMessage}`;
      }
      console.log("🔧 DEBUG: Custom system prompt applied");
      console.log("   Custom prompt:", this._customSystemPrompt);
      console.log("   Original user message:", originalUserMessage);
      console.log("   Final combined prompt:", prompt);
    } else {
      console.log("🔧 DEBUG: No custom system prompt - using default");
    }

    console.log("📤 DEBUG: Sending to AI");
    console.log("   Provider:", this._selectedProvider);
    console.log("   Full prompt length:", prompt.length, "characters");
    console.log("   Prompt preview:", prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));

    // Add original user message to history (not the modified one)
    await this._addToHistory(promptEl.value.trim());

    // Add user message (show original in chat, but send modified to AI)
    this._messages = [...this._messages, { type: 'user', text: promptEl.value.trim() }];
    this._saveChatHistory(); // Save after adding message
    promptEl.value = '';
    promptEl.style.height = 'auto';
    this._isLoading = true;
    this._error = null;
    this._errorDetails = null;
    this._showErrorDetails = false;
    this._requestStartTime = Date.now();
    this._currentPrompt = prompt; // Store the modified prompt for status details
    this._statusLog = [];
    this._aiResponse = ''; // Clear previous response
    this._addStatusLog('📤 Sending request to AI service...', `Provider: ${this._selectedProvider}\nPrompt length: ${prompt.length} chars`);
    this._showStatusDetails = false;

    // Clear any existing timeout
    if (this._serviceCallTimeout) {
      clearTimeout(this._serviceCallTimeout);
    }

    // Update status periodically
    this._statusUpdateInterval = setInterval(() => {
      if (this._isLoading && this._requestStartTime) {
        const elapsed = Math.floor((Date.now() - this._requestStartTime) / 1000);
        this._elapsedTime = elapsed; // Store elapsed time for reactive updates
        
        // Update status message based on elapsed time
        if (elapsed < 10 && this._statusLog.length === 1) {
          this._updateStatusMessage(`Waiting for AI to process request... (${elapsed}s)`);
        } else if (elapsed < 30 && this._statusLog.length <= 2) {
          this._updateStatusMessage(`AI is analyzing your request... (${elapsed}s)`);
        } else if (elapsed < 120) {
          this._updateStatusMessage(`Processing request... (${elapsed}s)\nThe AI may be querying Home Assistant data.`);
        } else {
          this._updateStatusMessage(`Still processing... (${elapsed}s)\nComplex operations may take longer.`);
        }
        // Update status details periodically to show latest processing steps
        this._updateStatusDetails();
        this.requestUpdate();
      } else {
        // Clear interval if not loading
        if (this._statusUpdateInterval) {
          clearInterval(this._statusUpdateInterval);
          this._statusUpdateInterval = null;
        }
      }
    }, 1000);

    // Set timeout to clear loading state after 5 minutes (increased from 60 seconds)
    this._serviceCallTimeout = setTimeout(() => {
      if (this._isLoading) {
        console.warn("Service call timeout - clearing loading state");
        this._isLoading = false;
        this._error = 'Request timed out after 5 minutes. The request may be too complex or the AI service may be slow. Please try again with a simpler request.';
        this._messages = [...this._messages, {
          type: 'assistant',
          text: 'Sorry, the request timed out after 5 minutes. This may happen with very complex requests. Please try breaking your request into smaller parts or try again.'
        }];
        this._saveChatHistory(); // Save after timeout
        if (this._statusUpdateInterval) {
          clearInterval(this._statusUpdateInterval);
        }
        this.requestUpdate();
      }
    }, 300000); // 5 minute timeout (300000ms)

    try {
      console.debug("Calling ai_agent_ha service");
      this._addStatusLog('🔄 Calling Home Assistant service...', `Service: ai_agent_ha.query, Provider: ${this._selectedProvider}`);
      await this.hass.callService('ai_agent_ha', 'query', {
        prompt: prompt,
        provider: this._selectedProvider
      });
      this._addStatusLog('✅ Service call completed', 'Waiting for AI response...');
    } catch (error) {
      console.error("Error calling service:", error);
      this._clearLoadingState();
      this._error = error.message || 'An error occurred while processing your request';
      this._errorDetails = {
        message: error.message,
        stack: error.stack,
        response: error.response || error.data,
        status: error.status || error.statusCode,
        timestamp: new Date().toISOString()
      };
      this._messages = [...this._messages, {
        type: 'assistant',
        text: `Error: ${this._error}`
      }];
    }
  }

  _clearLoadingState() {
    this._isLoading = false;
    this._requestStartTime = null;
    this._elapsedTime = 0;
    // Don't clear status details - let user keep them visible
    // Don't clear current prompt or status log - keep for details view
    // Auto-expand response section when complete for easier debugging
    if (this._aiResponse) {
      this._expandedDetails.response = true;
    }
    if (this._serviceCallTimeout) {
      clearTimeout(this._serviceCallTimeout);
      this._serviceCallTimeout = null;
    }
    if (this._statusUpdateInterval) {
      clearInterval(this._statusUpdateInterval);
      this._statusUpdateInterval = null;
    }
    // Final update to show complete details
    this.requestUpdate();
  }

  _addStatusLog(message, details = '') {
    const timestamp = new Date().toLocaleTimeString();
    this._statusLog.push({
      timestamp,
      message,
      details
    });
    // Keep only last 20 log entries
    if (this._statusLog.length > 20) {
      this._statusLog.shift();
    }
    this._updateStatusDetails();
  }

  _updateStatusMessage(message) {
    // Update the main status message without adding to log
    this._statusDetails = message;
  }

  _updateStatusDetails() {
    // Build compact, informative status details
    let details = `📤 PROMPT SENT (${this._currentPrompt ? this._currentPrompt.length : 0} chars):\n`;
    if (this._currentPrompt) {
      // Show first 150 chars + last 50 chars if longer
      if (this._currentPrompt.length > 200) {
        details += `${this._currentPrompt.substring(0, 150)}...\n...${this._currentPrompt.substring(this._currentPrompt.length - 50)}\n`;
      } else {
        details += `${this._currentPrompt}\n`;
      }
    } else {
      details += `No prompt yet\n`;
    }
    details += `\n`;
    
    if (this._statusLog.length > 0) {
      details += `📊 STEPS:\n`;
      this._statusLog.forEach((log, index) => {
        const time = log.timestamp && !isNaN(new Date(log.timestamp).getTime()) 
          ? new Date(log.timestamp).toLocaleTimeString() 
          : 'Just now';
        details += `[${time}] ${log.message}`;
        if (log.details) {
          // Show compact details (first line only if multiple lines)
          const firstLine = log.details.split('\n')[0];
          if (firstLine.length > 80) {
            details += ` - ${firstLine.substring(0, 80)}...`;
          } else {
            details += ` - ${firstLine}`;
          }
        }
        details += `\n`;
      });
      details += `\n`;
    }
    
    if (this._aiResponse) {
      details += `📥 RESPONSE (${this._aiResponse.length} chars):\n`;
      // Show first 300 chars + last 100 chars if longer
      if (this._aiResponse.length > 400) {
        details += `${this._aiResponse.substring(0, 300)}...\n...${this._aiResponse.substring(this._aiResponse.length - 100)}`;
      } else {
        details += `${this._aiResponse}`;
      }
    } else if (this._isLoading) {
      details += `⏳ Waiting for response...`;
    }
    
    this._statusDetails = details;
  }

  _renderStatusDetails() {
    return html`
      <div class="status-details">
        <!-- Prompt Section -->
        ${this._currentPrompt ? html`
          <div class="detail-section">
            <div 
              class="detail-header"
              @click=${() => {
                this._expandedDetails.prompt = !this._expandedDetails.prompt;
                this.requestUpdate();
              }}
            >
              <div class="detail-title">
                <ha-icon icon="mdi:send"></ha-icon>
                <span>Prompt Sent (${this._currentPrompt.length} chars)</span>
              </div>
              <ha-icon 
                icon="mdi:chevron-down" 
                class="detail-toggle ${this._expandedDetails.prompt ? 'expanded' : ''}"
              ></ha-icon>
            </div>
            <div class="detail-content ${this._expandedDetails.prompt ? 'expanded' : ''}">
              <pre class="detail-text">${this._currentPrompt}</pre>
            </div>
          </div>
        ` : ''}
        
        <!-- Processing Steps Section -->
        ${this._statusLog && this._statusLog.length > 0 ? html`
          <div class="detail-section">
            <div 
              class="detail-header"
              @click=${() => {
                this._expandedDetails.steps = !this._expandedDetails.steps;
                this.requestUpdate();
              }}
            >
              <div class="detail-title">
                <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
                <span>Processing Steps (${this._statusLog.length})</span>
              </div>
              <ha-icon 
                icon="mdi:chevron-down" 
                class="detail-toggle ${this._expandedDetails.steps ? 'expanded' : ''}"
              ></ha-icon>
            </div>
            <div class="detail-content ${this._expandedDetails.steps ? 'expanded' : ''}">
              ${this._statusLog.map((log, index) => html`
                <div class="step-item">
                  <div class="step-time">
                    ${log.timestamp && !isNaN(new Date(log.timestamp).getTime()) 
                      ? new Date(log.timestamp).toLocaleTimeString() 
                      : 'Just now'}
                  </div>
                  <div class="step-content">
                    <div class="step-message">${log.message || log.content}</div>
                    ${log.details ? html`
                      <div class="step-details">${log.details}</div>
                    ` : ''}
                  </div>
                </div>
              `)}
            </div>
          </div>
        ` : ''}
        
        <!-- Response Section -->
        ${this._aiResponse ? html`
          <div class="detail-section">
            <div 
              class="detail-header"
              @click=${() => {
                this._expandedDetails.response = !this._expandedDetails.response;
                this.requestUpdate();
              }}
            >
              <div class="detail-title">
                <ha-icon icon="mdi:message-reply"></ha-icon>
                <span>AI Response (${this._aiResponse.length} chars)</span>
              </div>
              <ha-icon 
                icon="mdi:chevron-down" 
                class="detail-toggle ${this._expandedDetails.response ? 'expanded' : ''}"
              ></ha-icon>
            </div>
            <div class="detail-content ${this._expandedDetails.response ? 'expanded' : ''}">
              <pre class="detail-text">${this._aiResponse}</pre>
            </div>
          </div>
        ` : this._isLoading ? html`
          <div class="detail-section">
            <div class="detail-header">
              <div class="detail-title">
                <ha-icon icon="mdi:loading" style="animation: spin 1s linear infinite;"></ha-icon>
                <span>Waiting for response...</span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _handleLlamaResponse(event) {
    console.debug("Received llama response:", event);
    
    try {
      // Store the full response
      if (event.data && event.data.answer) {
        this._aiResponse = event.data.answer;
        const answerPreview = event.data.answer.length > 200 
          ? event.data.answer.substring(0, 200) + '...' 
          : event.data.answer;
        this._addStatusLog('📥 Received response from AI', `Response length: ${event.data.answer.length} characters`);
        this._updateStatusDetails(); // Update to show the response
      }
      
      this._clearLoadingState();
    if (event.data.success) {
      // Check if the answer is empty
      if (!event.data.answer || event.data.answer.trim() === '') {
        console.warn("AI agent returned empty response");
        this._messages = [
          ...this._messages,
          { type: 'assistant', text: 'I received your message but I\'m not sure how to respond. Could you please try rephrasing your question?' }
        ];
        return;
      }

      let message = { type: 'assistant', text: event.data.answer };

      // Check if the response contains an automation or dashboard suggestion
      try {
        console.debug("Attempting to parse response as JSON:", event.data.answer);
        let jsonText = event.data.answer;
        
        // Try to extract JSON from mixed text+JSON responses
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0] !== jsonText.trim()) {
          console.debug("Found JSON within mixed response, extracting:", jsonMatch[0]);
          jsonText = jsonMatch[0];
        }
        
        const response = JSON.parse(jsonText);
        console.debug("Parsed JSON response:", response);
        
        if (response.request_type === 'automation_suggestion') {
          console.debug("Found automation suggestion");
          message.automation = response.automation;
          message.text = response.message || 'I found an automation that might help you. Would you like me to create it?';
        } else if (response.request_type === 'dashboard_suggestion') {
          console.debug("Found dashboard suggestion:", response.dashboard);
          // Validate dashboard exists and is an object
          if (response.dashboard && typeof response.dashboard === 'object') {
            message.dashboard = response.dashboard;
            message.text = response.message || 'I created a dashboard configuration for you. Would you like me to create it?';
          } else {
            console.error("Dashboard suggestion missing or invalid dashboard object:", response);
            message.text = 'I tried to create a dashboard, but the configuration was invalid. Please try again.';
          }
        } else if (response.request_type === 'entity_change' || response.entity_change) {
          // Handle entity changes (renames, state changes, etc.)
          message.entityChange = response.entity_change || {
            type: response.request_type === 'entity_change' ? 'update' : 'change',
            entityId: response.entity_id,
            oldName: response.old_name,
            newName: response.new_name,
            oldState: response.old_state,
            newState: response.new_state,
            attributes: response.attributes
          };
          message.text = response.message || 'I\'ve prepared the changes. Preview them below and confirm if you\'d like to proceed.';
        } else if (response.request_type === 'final_response') {
          // If it's a final response, use the response field
          message.text = response.response || response.message || event.data.answer;
        } else if (response.message) {
          // If there's a message field, use it
          message.text = response.message;
        } else if (response.response) {
          // If there's a response field, use it
          message.text = response.response;
        }
        // If none of the above, keep the original event.data.answer as message.text
      } catch (e) {
        // Not a JSON response, treat as normal message
        console.debug("Response is not JSON, using as-is:", event.data.answer);
        console.debug("JSON parse error:", e);
        // message.text is already set to event.data.answer
      }

      console.debug("Adding message to UI:", message);
      this._messages = [...this._messages, message];
      this._saveChatHistory(); // Save after receiving response
    } else {
      const errorMessage = event.data.error || 'An error occurred';
      const friendlyError = this._formatErrorMessage(errorMessage);
      this._error = friendlyError;
      this._errorDetails = {
        error: errorMessage,
        eventData: event.data,
        debugInfo: event.data.debug_info || null,
        statusLog: [...this._statusLog],
        conversationHistory: this._currentPrompt,
        timestamp: new Date().toISOString()
      };
      this._addStatusLog('❌ Error occurred', errorMessage);
      this._messages = [
        ...this._messages,
        { type: 'assistant', text: friendlyError }
      ];
      this._saveChatHistory(); // Save after error
    }
    } catch (error) {
      console.error("Error in _handleLlamaResponse:", error);
      this._clearLoadingState();
      const friendlyError = this._formatErrorMessage(error.message || String(error));
      this._error = friendlyError;
      this._errorDetails = {
        error: error.message || String(error),
        stack: error.stack,
        statusLog: [...this._statusLog],
        conversationHistory: this._currentPrompt,
        timestamp: new Date().toISOString()
      };
      this._addStatusLog('❌ Error processing response', error.message || String(error));
      this._messages = [...this._messages, {
        type: 'assistant',
        text: friendlyError
      }];
      this._saveChatHistory(); // Save after error
      this.requestUpdate();
    }
  }

  _formatErrorMessage(errorMessage) {
    if (!errorMessage) return 'An error occurred. Please try again.';
    
    const errorStr = String(errorMessage);
    
    // Handle Gemini API rate limit errors (429)
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota')) {
      // Extract retry delay if available
      const retryMatch = errorStr.match(/retry.*?(\d+(?:\.\d+)?)\s*s/i) || errorStr.match(/retryDelay.*?"(\d+)s"/i);
      const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;
      
      // Extract quota limit if available
      const quotaMatch = errorStr.match(/limit:\s*(\d+)/i) || errorStr.match(/quotaValue.*?"(\d+)"/i);
      const quotaLimit = quotaMatch ? quotaMatch[1] : null;
      
      let message = '⚠️ **Rate Limit Exceeded**\n\n';
      message += 'You\'ve reached the API rate limit for this provider. ';
      
      if (quotaLimit) {
        message += `The free tier allows ${quotaLimit} requests per day. `;
      }
      
      if (retrySeconds) {
        const minutes = Math.floor(retrySeconds / 60);
        const seconds = retrySeconds % 60;
        if (minutes > 0) {
          message += `\n\n⏰ **Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.**`;
        } else {
          message += `\n\n⏰ **Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.**`;
        }
      } else {
        message += '\n\n⏰ **Please wait a few minutes before trying again.**';
      }
      
      message += '\n\n💡 **Tip:** You can switch to a different AI provider in the Model dropdown if you have other API keys configured.';
      
      return message;
    }
    
    // Handle timeout errors
    if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
      return '⏱️ **Request Timeout**\n\nThe request took too long to complete. This might happen with complex requests. Please try:\n\n• Breaking your request into smaller parts\n• Trying again in a moment\n• Using a different AI provider';
    }
    
    // Handle authentication errors
    if (errorStr.includes('401') || errorStr.includes('authentication') || errorStr.includes('API key') || errorStr.includes('invalid key')) {
      return '🔐 **Authentication Error**\n\nYour API key is invalid or missing. Please:\n\n• Check your API key in the integration settings\n• Verify the key is correct and has the right permissions\n• Make sure you\'ve selected the correct provider';
    }
    
    // Handle network errors
    if (errorStr.includes('connection') || errorStr.includes('network') || errorStr.includes('ECONNREFUSED')) {
      return '🌐 **Network Error**\n\nUnable to connect to the AI service. Please:\n\n• Check your internet connection\n• Verify the AI service is available\n• Try again in a moment';
    }
    
    // Handle "Failed after X retries" errors
    if (errorStr.includes('Failed after') && errorStr.includes('retries')) {
      const retryMatch = errorStr.match(/Failed after (\d+) retries/i);
      const retries = retryMatch ? retryMatch[1] : null;
      
      let message = '❌ **Request Failed**\n\nThe request failed after multiple attempts. ';
      
      // Try to extract the underlying error
      const lastErrorMatch = errorStr.match(/Last error[:\s]+(.+?)(?:\n|$)/i);
      if (lastErrorMatch) {
        const underlyingError = lastErrorMatch[1].trim();
        // Recursively format the underlying error
        return this._formatErrorMessage(underlyingError);
      }
      
      if (retries) {
        message += `The system tried ${retries} times but couldn't complete the request. `;
      }
      
      message += 'Please try again or switch to a different AI provider.';
      
      return message;
    }
    
    // Generic error - show first 200 chars to avoid overwhelming the user
    const truncated = errorStr.length > 200 ? errorStr.substring(0, 200) + '...' : errorStr;
    return `❌ **Error**\n\n${truncated}\n\nPlease try again or check the browser console (F12) for more details.`;
  }

  async _approveAutomation(automation) {
    if (this._isLoading) return;
    this._isLoading = true;
    try {
      const result = await this.hass.callService('ai_agent_ha', 'create_automation', {
        automation: automation
      });

      console.debug("Automation creation result:", result);

      // The result should be an object with a message property
      if (result && result.message) {
        this._messages = [...this._messages, {
          type: 'assistant',
          text: result.message
        }];
      } else {
        // Fallback success message if no message is provided
        this._messages = [...this._messages, {
          type: 'assistant',
          text: `Automation "${automation.alias}" has been created successfully!`
        }];
      }
    } catch (error) {
      console.error("Error creating automation:", error);
      this._error = error.message || 'An error occurred while creating the automation';
      this._messages = [...this._messages, {
        type: 'assistant',
        text: `Error: ${this._error}`
      }];
    } finally {
      this._clearLoadingState();
    }
  }

  _rejectAutomation() {
    this._messages = [...this._messages, {
      type: 'assistant',
      text: 'Automation creation cancelled. Would you like to try something else?'
    }];
  }

  async _approveDashboard(dashboard) {
    if (this._isLoading) return;
    if (!dashboard) {
      console.error("Dashboard is null or undefined");
      this._error = 'Dashboard configuration is missing';
      return;
    }
    this._isLoading = true;
    try {
      console.debug("Creating dashboard with config:", dashboard);
      const result = await this.hass.callService('ai_agent_ha', 'create_dashboard', {
        dashboard_config: dashboard
      });

      console.debug("Dashboard creation result:", result);

      // The result should be an object with a message property
      if (result && result.message) {
        this._messages = [...this._messages, {
          type: 'assistant',
          text: result.message
        }];
      } else {
        // Fallback success message if no message is provided
        this._messages = [...this._messages, {
          type: 'assistant',
          text: `Dashboard "${dashboard.title}" has been created successfully!`
        }];
      }
    } catch (error) {
      console.error("Error creating dashboard:", error);
      this._error = error.message || 'An error occurred while creating the dashboard';
      this._messages = [...this._messages, {
        type: 'assistant',
        text: `Error: ${this._error}`
      }];
    } finally {
      this._clearLoadingState();
    }
  }

  _rejectDashboard() {
    this._messages = [...this._messages, {
      type: 'assistant',
      text: 'Dashboard creation cancelled. Would you like me to create a different dashboard?'
    }];
  }

  shouldUpdate(changedProps) {
    // Only update if internal state changes, not on every hass update
    return changedProps.has('_messages') ||
           changedProps.has('_isLoading') ||
           changedProps.has('_elapsedTime') ||
           changedProps.has('_statusDetails') ||
           changedProps.has('_showStatusDetails') ||
           changedProps.has('_error') ||
           changedProps.has('_promptHistory') ||
           changedProps.has('_showPredefinedPrompts') ||
           changedProps.has('_showPromptHistory') ||
           changedProps.has('_availableProviders') ||
           changedProps.has('_selectedProvider') ||
           changedProps.has('_showProviderDropdown');
  }

  _clearChat() {
    this._messages = [];
    this._saveChatHistory(); // Save empty chat
    this._clearLoadingState();
    this._error = null;
    this._errorDetails = null;
    this._showErrorDetails = false;
    this._pendingAutomation = null;
    // Don't clear prompt history - users might want to keep it
  }

  _loadChatHistory() {
    try {
      const saved = localStorage.getItem('ai_agent_ha_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only load if it's for the current provider or no provider is selected yet
        if (!parsed.provider || parsed.provider === this._selectedProvider || !this._selectedProvider) {
          this._messages = parsed.messages || [];
          console.debug('Loaded chat history from localStorage:', this._messages.length, 'messages');
        } else {
          this._messages = [];
        }
      }
    } catch (e) {
      console.error('Error loading chat history from localStorage:', e);
      this._messages = [];
    }
  }

  _saveChatHistory() {
    try {
      const data = {
        provider: this._selectedProvider,
        messages: this._messages,
        timestamp: Date.now()
      };
      localStorage.setItem('ai_agent_ha_chat_history', JSON.stringify(data));
      console.debug('Saved chat history to localStorage:', this._messages.length, 'messages');
    } catch (e) {
      console.error('Error saving chat history to localStorage:', e);
    }
  }

  _getProviderInfo(providerId) {
    return this._availableProviders.find(p => p.value === providerId);
  }

  _hasProviders() {
    return this._availableProviders && this._availableProviders.length > 0;
  }

  _buildDefaultStatusDetails() {
    let details = `📤 Sent to AI:\n`;
    details += `"${this._currentPrompt || 'No prompt yet'}"\n\n`;
    details += `⏳ Status: Waiting for response...`;
    return details;
  }

  _toggleCollapse(itemId) {
    this._collapsedItems[itemId] = !this._collapsedItems[itemId];
    this.requestUpdate();
  }

  _isCollapsed(itemId) {
    return this._collapsedItems[itemId] === true;
  }

  async _loadCustomSystemPrompt() {
    try {
      if (!this.hass || !this._selectedProvider) {
        this._customSystemPrompt = '';
        return;
      }

      // Get config entries from Home Assistant
      const allEntries = await this.hass.callWS({ type: 'config_entries/get' });
      const aiAgentEntries = allEntries.filter(entry => entry.domain === 'ai_agent_ha');

      // Find the entry for the selected provider
      const selectedEntry = aiAgentEntries.find(entry => {
        const entryProvider = entry.data?.ai_provider;
        return entryProvider === this._selectedProvider;
      });

      if (selectedEntry && selectedEntry.data?.custom_system_prompt) {
        this._customSystemPrompt = selectedEntry.data.custom_system_prompt;
        console.debug('Loaded custom system prompt from config entry:', this._customSystemPrompt);
      } else {
        this._customSystemPrompt = '';
        console.debug('No custom system prompt found in config entry');
      }
    } catch (e) {
      console.error('Error loading custom system prompt:', e);
      this._customSystemPrompt = '';
    }
  }

  _renderDashboardPreview(dashboard) {
    if (!dashboard || !dashboard.views) {
      return html``;
    }

    const previewCards = [];
    dashboard.views.forEach((view, viewIndex) => {
      if (view.cards) {
        view.cards.forEach((card, cardIndex) => {
          if (card.type === 'entities' && card.entities) {
            previewCards.push({
              title: card.title || `View ${viewIndex + 1} - Card ${cardIndex + 1}`,
              entities: card.entities.slice(0, 6), // Show first 6 entities
              type: 'entities'
            });
          } else if (card.type === 'light' && card.entity) {
            previewCards.push({
              title: card.name || card.entity,
              entities: [card.entity],
              type: 'light'
            });
          } else if (card.type === 'button' && card.name) {
            previewCards.push({
              title: card.name,
              entities: [],
              type: 'button'
            });
          } else if (card.type === 'grid' && card.cards) {
            card.cards.forEach(subCard => {
              if (subCard.name) {
                previewCards.push({
                  title: subCard.name,
                  entities: [],
                  type: 'button'
                });
              }
            });
          }
        });
      }
    });

    const previewId = `preview-${Date.now()}`;
    return html`
      <div class="preview-window">
        <div class="preview-header">
          <div class="preview-title">
            <ha-icon icon="mdi:eye"></ha-icon>
            Preview
            <span class="preview-badge">${dashboard.views ? dashboard.views.length : 0} Views</span>
          </div>
          <div class="preview-toggle ${this._isCollapsed(previewId) ? 'collapsed' : ''}" @click=${() => this._toggleCollapse(previewId)}>
            <ha-icon icon="mdi:chevron-down"></ha-icon>
            <span>${this._isCollapsed(previewId) ? 'Show' : 'Hide'}</span>
          </div>
        </div>
        <div class="preview-content ${this._isCollapsed(previewId) ? 'collapsed' : ''}">
          <div class="dashboard-preview">
          ${previewCards.length > 0 ? previewCards.map(card => html`
            <div class="preview-card">
              <div class="preview-card-title">${card.title}</div>
              ${card.entities.length > 0 ? html`
                <div class="preview-card-content">
                  ${card.entities.map(entity => html`
                    <div class="preview-entity">${typeof entity === 'string' ? entity : entity.entity || entity}</div>
                  `)}
                </div>
              ` : html`
                <div class="preview-card-content">
                  <div class="preview-entity">${card.type === 'button' ? 'Button Control' : 'Card'}</div>
                </div>
              `}
            </div>
          `) : html`
            <div class="preview-card">
              <div class="preview-card-title">Dashboard Preview</div>
              <div class="preview-card-content">
                <div class="preview-entity">${dashboard.title}</div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  _renderEntityChangePreview(change) {
    if (!change) return html``;

    const changePreviewId = `change-preview-${Date.now()}`;
    return html`
      <div class="preview-window">
        <div class="preview-header">
          <div class="preview-title">
            <ha-icon icon="mdi:swap-horizontal"></ha-icon>
            Change Preview
            <span class="preview-badge">${change.type || 'Update'}</span>
          </div>
          <div class="preview-toggle ${this._isCollapsed(changePreviewId) ? 'collapsed' : ''}" @click=${() => this._toggleCollapse(changePreviewId)}>
            <ha-icon icon="mdi:chevron-down"></ha-icon>
            <span>${this._isCollapsed(changePreviewId) ? 'Show' : 'Hide'}</span>
          </div>
        </div>
        <div class="preview-content ${this._isCollapsed(changePreviewId) ? 'collapsed' : ''}">
          <div class="entity-change-preview">
          ${change.entityId ? html`
            <div class="change-item">
              <div class="change-icon">
                <ha-icon icon="mdi:tag"></ha-icon>
              </div>
              <div class="change-details">
                <div class="change-label">Entity</div>
                <div class="change-value">${change.entityId}</div>
              </div>
            </div>
          ` : ''}
          ${change.oldName && change.newName ? html`
            <div class="change-item">
              <div class="change-icon">
                <ha-icon icon="mdi:rename-box"></ha-icon>
              </div>
              <div class="change-details">
                <div class="change-label">Name Change</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div class="change-value">${change.oldName}</div>
                  <ha-icon icon="mdi:arrow-right" class="change-arrow"></ha-icon>
                  <div class="change-value" style="color: #a5b4fc;">${change.newName}</div>
                </div>
              </div>
            </div>
          ` : ''}
          ${change.oldState !== undefined && change.newState !== undefined ? html`
            <div class="change-item">
              <div class="change-icon">
                <ha-icon icon="mdi:state-machine"></ha-icon>
              </div>
              <div class="change-details">
                <div class="change-label">State Change</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div class="change-value">${change.oldState}</div>
                  <ha-icon icon="mdi:arrow-right" class="change-arrow"></ha-icon>
                  <div class="change-value" style="color: #a5b4fc;">${change.newState}</div>
                </div>
              </div>
            </div>
          ` : ''}
          ${change.attributes ? html`
            <div class="change-item">
              <div class="change-icon">
                <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
              </div>
              <div class="change-details">
                <div class="change-label">Attributes</div>
                <div class="change-value">${Object.keys(change.attributes).length} attribute(s) updated</div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

try {
  customElements.define("ai_agent_ha-panel", AiAgentHaPanel);
  console.log("✅ HomeMind Ai Panel registered successfully");
} catch (error) {
  console.error("❌ ERROR: Failed to register HomeMind Ai Panel:", error);
  console.error("   Error details:", error.message, error.stack);
}