import React, { useState, useRef, useEffect } from 'react';
import './VidyaAIChatWidget.css';

const API_BASE_URL =
  (typeof window !== 'undefined' && (window.VIDYAAI_API_URL || window.VIDYAMARGDARSHAK_API_URL)) ||
  (import.meta.env && import.meta.env.VITE_VIDYAAI_API_URL) ||
  'http://127.0.0.1:8000';

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function cleanTitle(title, source) {
  if (title && title.trim()) {
    return title.trim();
  }
  if (!source) return 'Knowledge Guide';
  const filename = source.split(/[/\\]/).pop() || source;
  return filename
    .replace(/^\d+[-_]?/, '')
    .replace(/\.(md|json|txt|pdf)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMarkdown(rawText) {
  if (!rawText) return '';

  // 1. Strip any bracketed citations or file references completely
  let text = rawText
    .replace(/\[(?:Source:?\s*)?[^\]]*?\.(?:md|json|txt|pdf|html|csv)[^\]]*?\]/gi, '')
    .replace(/\[(?:Source|Reference|Ref):\s*[^\]]+?\]/gi, '')
    .replace(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g, '')
    .replace(/\n*(?:\*\*|__)?(?:sources?|references?):(?:\*\*|__)?[\s\S]*$/gi, '')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();

  // 2. Escape HTML entities
  let escaped = escapeHtml(text);

  // 3. Helper to format inline styling (bold, italic, code) cleanly
  function inlineFormat(str) {
    return str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/`([^`]+?)`/g, '<code>$1</code>')
      .replace(/(^|[^\*])\*([^\*\s][^\*]*?)\*([^\*]|$)/g, '$1<em>$2</em>$3')
      .replace(/\*\*/g, '')
      .replace(/(^|\s)\*(?=\s|$)/g, '$1');
  }

  // 4. Process line-by-line for structured lists and paragraphs
  const lines = escaped.split(/\r?\n/);
  const outputBlocks = [];
  let inUl = false;
  let inOl = false;

  function closeLists() {
    if (inUl) {
      outputBlocks.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      outputBlocks.push('</ol>');
      inOl = false;
    }
  }

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeLists();
      continue;
    }

    // Headings: ###, ##, #
    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      closeLists();
      const level = headerMatch[1].length;
      const tag = level <= 2 ? 'h4' : 'h5';
      outputBlocks.push(`<${tag} class="vm-md-heading">${inlineFormat(headerMatch[2])}</${tag}>`);
      continue;
    }

    // Bullet List Items: *, -, •
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.+)$/);
    if (bulletMatch) {
      if (inOl) {
        outputBlocks.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        outputBlocks.push('<ul class="vm-md-list">');
        inUl = true;
      }
      outputBlocks.push(`<li>${inlineFormat(bulletMatch[1])}</li>`);
      continue;
    }

    // Numbered List Items: 1., 2), etc.
    const numberMatch = trimmed.match(/^\d+[\.\)]\s+(.+)$/);
    if (numberMatch) {
      if (inUl) {
        outputBlocks.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        outputBlocks.push('<ol class="vm-md-list">');
        inOl = true;
      }
      outputBlocks.push(`<li>${inlineFormat(numberMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph line
    closeLists();
    outputBlocks.push(`<p class="vm-md-p">${inlineFormat(trimmed)}</p>`);
  }

  closeLists();
  return outputBlocks.join('');
}

export default function VidyaAIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: '👋 Hi! How can **VidyaAI** help you today?',
      isWelcome: true,
      sources: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSourcesIndex, setActiveSourcesIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Close sources popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.vm-sources-wrapper')) {
        setActiveSourcesIndex(null);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Build chat history for context
    const chatHistory = messages
      .filter((m) => !m.isWelcome)
      .slice(-6)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.text
      }));
    chatHistory.push({ role: 'user', content: text });

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: data.answer,
        sources: data.sources || []
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: `Sorry, I could not connect to the VidyaAI backend (${err.message}). Make sure the API server is running on ${API_BASE_URL}.`,
        sources: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleChipClick = (query) => {
    handleSendMessage(query);
  };

  return (
    <div id="vm-widget-container">
      {/* Floating Circular Trigger Button */}
      <button
        id="vm-trigger-btn"
        className="vm-floating-trigger"
        title="Ask VidyaAI"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className="vm-pulse-dot" />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chatbox Window Container */}
      <div ref={chatWindowRef} id="vm-chat-box" className={`vm-chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="vm-chat-header">
          <div className="vm-header-left">
            <div className="vm-avatar">🎓</div>
            <div className="vm-header-info">
              <h3>VidyaAI</h3>
              <div className="vm-header-status">
                <span className="vm-status-indicator" />
                <span>Online</span>
              </div>
            </div>
          </div>
          <button
            id="vm-close-btn"
            className="vm-close-btn"
            title="Close Chat"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat messages area */}
        <div id="vm-messages" className="vm-chat-messages">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'bot';
            return (
              <div key={msg.id} className={`vm-message ${msg.role}`}>
                <div className="vm-message-bubble">
                  {isBot ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                  ) : (
                    <p className="vm-md-p">{escapeHtml(msg.text)}</p>
                  )}

                  {msg.isWelcome && (
                    <div className="vm-suggestions">
                      <button
                        type="button"
                        className="vm-suggestion-chip"
                        onClick={() => handleChipClick('How does Maharashtra CAP admission work?')}
                      >
                        CAP Admissions
                      </button>
                      <button
                        type="button"
                        className="vm-suggestion-chip"
                        onClick={() => handleChipClick('What is the difference between B.Tech CSE and BCA?')}
                      >
                        B.Tech vs BCA
                      </button>
                      <button
                        type="button"
                        className="vm-suggestion-chip"
                        onClick={() =>
                          handleChipClick('What documents are needed for Caste Validity Certificate in Maharashtra?')
                        }
                      >
                        Caste Validity
                      </button>
                      <button
                        type="button"
                        className="vm-suggestion-chip"
                        onClick={() => handleChipClick('What is the eligibility criteria for NEET UG?')}
                      >
                        NEET UG
                      </button>
                    </div>
                  )}

                  {isBot && msg.sources && msg.sources.length > 0 && (
                    <div
                      className={`vm-sources-wrapper ${activeSourcesIndex === index ? 'active' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="vm-sources-btn"
                        title="Click or hover to view verified sources"
                        onClick={() =>
                          setActiveSourcesIndex((prev) => (prev === index ? null : index))
                        }
                      >
                        <svg className="vm-sources-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        <span>Sources ({msg.sources.length})</span>
                      </button>
                      <div className="vm-sources-toast">
                        <div className="vm-sources-toast-header">
                          <span>📚 Consulted Knowledge Base ({msg.sources.length})</span>
                          <button
                            type="button"
                            className="vm-sources-toast-close"
                            title="Close"
                            onClick={() => setActiveSourcesIndex(null)}
                          >
                            &times;
                          </button>
                        </div>
                        <div className="vm-sources-toast-body">
                          {msg.sources.map((s, sIdx) => {
                            const title = cleanTitle(s.title, s.source);
                            const metaInfo = [];
                            if (s.category) metaInfo.push(s.category);
                            if (s.section && s.section !== 'Overview') metaInfo.push(s.section);

                            return (
                              <div key={sIdx} className="vm-source-item">
                                <div className="vm-source-title">📄 {title}</div>
                                {metaInfo.length > 0 && (
                                  <div className="vm-source-meta">{metaInfo.join(' • ')}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div id="vm-typing-indicator" className="vm-message bot">
              <div className="vm-typing-indicator">
                <div className="vm-dot" />
                <div className="vm-dot" />
                <div className="vm-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form id="vm-chat-form" className="vm-chat-input-area" onSubmit={handleFormSubmit}>
          <input
            ref={inputRef}
            type="text"
            id="vm-user-input"
            placeholder="Ask VidyaAI..."
            autoComplete="off"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            id="vm-send-btn"
            className="vm-send-btn"
            title="Send message"
            disabled={isLoading || !inputText.trim()}
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
