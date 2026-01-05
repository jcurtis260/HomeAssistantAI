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
      _statusLog: { type: Array, reflect: false, attribute: false }
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
      .clear-button {
        margin-left: auto;
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
        color: var(--primary-color);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      .status-toggle:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }
      .status-toggle ha-icon {
        --mdc-icon-size: 16px;
        transition: transform 0.2s ease;
      }
      .status-toggle.expanded ha-icon {
        transform: rotate(180deg);
      }
      .status-details {
        margin-top: 8px;
        padding: 8px;
        background: var(--primary-background-color);
        border-radius: 8px;
        font-size: 12px;
        color: var(--secondary-text-color);
        max-height: 200px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .status-time {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-left: auto;
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
        border: 1px solid var(--error-color);
        animation: fadeIn 0.3s ease-out;
      }
      .automation-suggestion {
        background: var(--secondary-background-color);
        border: 1px solid var(--primary-color);
        border-radius: 12px;
        padding: 16px;
        margin: 8px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 10;
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
    console.debug("HomeMind Ai Panel constructor called");
  }

  _getRandomPrompts() {
    // Shuffle array and take first 3 items
    const shuffled = [...this._predefinedPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  async connectedCallback() {
    super.connectedCallback();
    console.debug("HomeMind Ai Panel connected");
    
    // Load chat history from localStorage
    this._loadChatHistory();
    
    if (this.hass && !this._eventSubscriptionSetup) {
      this._eventSubscriptionSetup = true;
      this.hass.connection.subscribeEvents(
        (event) => this._handleLlamaResponse(event),
        'ai_agent_ha_response'
      );
      console.debug("Event subscription set up in connectedCallback()");
      // Load prompt history from Home Assistant storage
      await this._loadPromptHistory();
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.shadowRoot.querySelector('.provider-selector')?.contains(e.target)) {
        this._showProviderDropdown = false;
      }
    });
  }

  async updated(changedProps) {
    console.debug("Updated called with:", changedProps);

    // Set up event subscription when hass becomes available
    if (changedProps.has('hass') && this.hass && !this._eventSubscriptionSetup) {
      this._eventSubscriptionSetup = true;
      this.hass.connection.subscribeEvents(
        (event) => this._handleLlamaResponse(event),
        'ai_agent_ha_response'
      );
      console.debug("Event subscription set up in updated()");
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
            
            // First try to get provider from entry data
            if (entry.data && entry.data.ai_provider) {
              provider = entry.data.ai_provider;
            } else {
              // Fallback to title mapping
              const titleToProviderMap = {
                "HomeMind Ai (OpenRouter)": "openrouter",
                "HomeMind Ai (Google Gemini)": "gemini",
                "HomeMind Ai (OpenAI)": "openai",
                "HomeMind Ai (Llama)": "llama",
                "HomeMind Ai (Anthropic (Claude))": "anthropic",
                "HomeMind Ai (Alter)": "alter",
                "HomeMind Ai (Local Model)": "local",
              };
              provider = titleToProviderMap[entry.title] || "unknown";
            }
            
            return {
              value: provider,
              label: PROVIDERS[provider] || provider
            };
          });

          console.debug("Available AI providers (mapped from data/title):", this._availableProviders);

          if (!this._selectedProvider && this._availableProviders.length > 0) {
            this._selectedProvider = this._availableProviders[0].value;
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
    console.debug("Rendering with state:", {
      messages: this._messages,
      isLoading: this._isLoading,
      error: this._error
    });
    console.debug("Messages array:", this._messages);

    return html`
      <div class="header">
        <ha-icon icon="mdi:robot"></ha-icon>
        HomeMind Ai
        <button
          class="clear-button"
          @click=${this._clearChat}
          ?disabled=${this._isLoading}
        >
          <ha-icon icon="mdi:delete-sweep"></ha-icon>
          <span>Clear Chat</span>
        </button>
      </div>
      <div class="content">
        <div class="chat-container">
          <div class="messages" id="messages">
            ${this._messages.map(msg => html`
              <div class="message ${msg.type}-message">
                ${msg.text}
                ${msg.automation ? html`
                  <div class="automation-suggestion">
                    <div class="automation-title">${msg.automation.alias}</div>
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
                ` : ''}
                ${msg.dashboard ? html`
                  <div class="dashboard-suggestion">
                    <div class="dashboard-title">
                      <ha-icon icon="mdi:view-dashboard"></ha-icon>
                      ${msg.dashboard.title}
                    </div>
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
                ${this._showStatusDetails ? html`
                  <div class="status-details">
                    ${this._statusDetails || this._buildDefaultStatusDetails()}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            ${this._error ? html`
              <div class="error">${this._error}</div>
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
                <select
                  class="provider-button"
                  @change=${(e) => this._selectProvider(e.target.value)}
                  .value=${this._selectedProvider || ''}
                >
                  ${this._availableProviders.map(provider => html`
                    <option
                      value=${provider.value}
                      ?selected=${provider.value === this._selectedProvider}
                    >
                      ${provider.label}
                    </option>
                  `)}
                </select>
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
    
    // Load chat history for new provider
    this._loadChatHistory();
    
    await this._loadPromptHistory();
    this.requestUpdate();
  }

  _getSelectedProviderLabel() {
    const provider = this._availableProviders.find(p => p.value === this._selectedProvider);
    return provider ? provider.label : 'Select Model';
  }

  async _sendMessage() {
    const promptEl = this.shadowRoot.querySelector('#prompt');
    const prompt = promptEl.value.trim();
    if (!prompt || this._isLoading) return;

    console.debug("Sending message:", prompt);
    console.debug("Sending message with provider:", this._selectedProvider);

    // Add to history
    await this._addToHistory(prompt);

    // Add user message
    this._messages = [...this._messages, { type: 'user', text: prompt }];
    this._saveChatHistory(); // Save after adding message
    promptEl.value = '';
    promptEl.style.height = 'auto';
    this._isLoading = true;
    this._error = null;
    this._requestStartTime = Date.now();
    this._currentPrompt = prompt;
    this._statusLog = [];
    this._addStatusLog('📤 Sending request to AI service...', `Prompt: "${prompt}"`);
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
      await this.hass.callService('ai_agent_ha', 'query', {
        prompt: prompt,
        provider: this._selectedProvider
      });
    } catch (error) {
      console.error("Error calling service:", error);
      this._clearLoadingState();
      this._error = error.message || 'An error occurred while processing your request';
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
    this._statusDetails = '';
    this._currentPrompt = '';
    if (this._serviceCallTimeout) {
      clearTimeout(this._serviceCallTimeout);
      this._serviceCallTimeout = null;
    }
    if (this._statusUpdateInterval) {
      clearInterval(this._statusUpdateInterval);
      this._statusUpdateInterval = null;
    }
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
    // Build detailed status from log
    let details = `📋 Request Details:\n`;
    details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    details += `📤 Sent to AI:\n`;
    details += `"${this._currentPrompt}"\n\n`;
    
    if (this._statusLog.length > 0) {
      details += `📊 Processing Steps:\n`;
      details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      this._statusLog.forEach((log, index) => {
        details += `\n[${log.timestamp}] ${log.message}`;
        if (log.details) {
          details += `\n   ${log.details}`;
        }
      });
    }
    
    this._statusDetails = details;
  }

  _handleLlamaResponse(event) {
    console.debug("Received llama response:", event);
    
    try {
      // Log the response received
      if (event.data && event.data.answer) {
        const answerPreview = event.data.answer.length > 200 
          ? event.data.answer.substring(0, 200) + '...' 
          : event.data.answer;
        this._addStatusLog('📥 Received response from AI', `Response: ${answerPreview}`);
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
      this._error = event.data.error || 'An error occurred';
      this._messages = [
        ...this._messages,
        { type: 'assistant', text: `Error: ${this._error}` }
      ];
      this._saveChatHistory(); // Save after error
    }
    } catch (error) {
      console.error("Error in _handleLlamaResponse:", error);
      this._clearLoadingState();
      this._error = 'An error occurred while processing the response';
      this._messages = [...this._messages, {
        type: 'assistant',
        text: 'Sorry, an error occurred while processing the response. Please try again.'
      }];
      this._saveChatHistory(); // Save after error
      this.requestUpdate();
    }
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
    let details = `📋 Request Details:\n`;
    details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    details += `📤 Sent to AI:\n`;
    details += `"${this._currentPrompt || 'No prompt yet'}"\n\n`;
    details += `⏳ Status:\n`;
    details += `Waiting for response...\n\n`;
    details += `The AI agent is processing your request. This may take a few moments depending on the complexity of your query.`;
    return details;
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

    return html`
      <div class="preview-window">
        <div class="preview-header">
          <div class="preview-title">
            <ha-icon icon="mdi:eye"></ha-icon>
            Preview
            <span class="preview-badge">${dashboard.views ? dashboard.views.length : 0} Views</span>
          </div>
        </div>
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

    return html`
      <div class="preview-window">
        <div class="preview-header">
          <div class="preview-title">
            <ha-icon icon="mdi:swap-horizontal"></ha-icon>
            Change Preview
            <span class="preview-badge">${change.type || 'Update'}</span>
          </div>
        </div>
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