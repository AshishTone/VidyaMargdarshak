/**
 * VidyaAI Floating Chat Widget
 * Self-contained embeddable script for website integration.
 */
(function () {
  const API_BASE_URL = window.VIDYAAI_API_URL || window.VIDYAMARGDARSHAK_API_URL || "http://127.0.0.1:8000";

  // Inject Widget DOM
  const widgetHtml = `
    <div id="vm-widget-container">
      <!-- Floating Circular Trigger Button -->
      <button id="vm-trigger-btn" class="vm-floating-trigger" title="Ask VidyaAI">
        <span class="vm-pulse-dot"></span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <!-- Chatbox Modal Window -->
      <div id="vm-chat-box" class="vm-chat-window">
        <!-- Header -->
        <div class="vm-chat-header">
          <div class="vm-header-left">
            <div class="vm-avatar">🎓</div>
            <div class="vm-header-info">
              <h3>VidyaAI</h3>
              <div class="vm-header-status">
                <span class="vm-status-indicator"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
          <button id="vm-close-btn" class="vm-close-btn" title="Close Chat">
            <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Chat messages area -->
        <div id="vm-messages" class="vm-chat-messages">
          <div class="vm-message bot">
            <div class="vm-message-bubble">
              <p class="vm-md-p">👋 Hi! How can <strong>VidyaAI</strong> help you today?</p>
              <div class="vm-suggestions">
                <button class="vm-suggestion-chip" data-query="How does Maharashtra CAP admission work?">CAP Admissions</button>
                <button class="vm-suggestion-chip" data-query="What is the difference between B.Tech CSE and BCA?">B.Tech vs BCA</button>
                <button class="vm-suggestion-chip" data-query="What documents are needed for Caste Validity Certificate in Maharashtra?">Caste Validity</button>
                <button class="vm-suggestion-chip" data-query="What is the eligibility criteria for NEET UG?">NEET UG</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <form id="vm-chat-form" class="vm-chat-input-area">
          <input type="text" id="vm-user-input" placeholder="Ask VidyaAI..." autocomplete="off" />
          <button type="submit" id="vm-send-btn" class="vm-send-btn" title="Send message">
            <svg style="width:18px;height:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", widgetHtml);

  const triggerBtn = document.getElementById("vm-trigger-btn");
  const closeBtn = document.getElementById("vm-close-btn");
  const chatBox = document.getElementById("vm-chat-box");
  const messagesContainer = document.getElementById("vm-messages");
  const chatForm = document.getElementById("vm-chat-form");
  const userInput = document.getElementById("vm-user-input");
  const sendBtn = document.getElementById("vm-send-btn");

  let chatHistory = [];

  // Toggle Chat Box
  triggerBtn.addEventListener("click", () => {
    chatBox.classList.toggle("open");
    if (chatBox.classList.contains("open")) {
      userInput.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    chatBox.classList.remove("open");
  });

  // Suggestion chips & Sources toast handler
  messagesContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".vm-suggestion-chip");
    if (chip) {
      const query = chip.getAttribute("data-query");
      if (query) {
        userInput.value = query;
        sendMessage(query);
      }
      return;
    }

    // Sources toast toggle
    const sourceBtn = e.target.closest(".vm-sources-btn");
    if (sourceBtn) {
      const wrapper = sourceBtn.closest(".vm-sources-wrapper");
      if (wrapper) {
        // Close other open source toasts
        document.querySelectorAll(".vm-sources-wrapper.active").forEach(w => {
          if (w !== wrapper) w.classList.remove("active");
        });
        wrapper.classList.toggle("active");
      }
      return;
    }

    const toastClose = e.target.closest(".vm-sources-toast-close");
    if (toastClose) {
      const wrapper = toastClose.closest(".vm-sources-wrapper");
      if (wrapper) wrapper.classList.remove("active");
      return;
    }
  });

  // Close open sources popovers when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".vm-sources-wrapper")) {
      document.querySelectorAll(".vm-sources-wrapper.active").forEach(w => {
        w.classList.remove("active");
      });
    }
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = userInput.value.trim();
    if (query) {
      sendMessage(query);
    }
  });

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  function cleanTitle(title, source) {
    if (title && title.trim()) {
      return title.trim();
    }
    if (!source) return "Knowledge Guide";
    const filename = source.split(/[/\\]/).pop() || source;
    return filename
      .replace(/^\d+[-_]?/, '')
      .replace(/\.(md|json|txt|pdf)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function formatMarkdown(rawText) {
    if (!rawText) return "";

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
        // Bold: **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Inline code: `code`
        .replace(/`([^`]+?)`/g, '<code>$1</code>')
        // Italic: *text* (avoiding stray asterisks)
        .replace(/(^|[^\*])\*([^\*\s][^\*]*?)\*([^\*]|$)/g, '$1<em>$2</em>$3')
        // Clean away any leftover stray asterisks or double asterisks
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

  function appendMessage(role, text, sources = []) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `vm-message ${role}`;

    let contentHtml = "";
    if (role === "bot") {
      contentHtml = formatMarkdown(text);
    } else {
      contentHtml = `<p class="vm-md-p">${escapeHtml(text)}</p>`;
    }

    let sourcesHtml = "";
    if (sources && sources.length > 0) {
      const sourceItems = sources.map(s => {
        const title = escapeHtml(cleanTitle(s.title, s.source));
        const metaInfo = [];
        if (s.category) metaInfo.push(escapeHtml(s.category));
        if (s.section && s.section !== "Overview") metaInfo.push(escapeHtml(s.section));
        const metaTag = metaInfo.length > 0 ? `<div class="vm-source-meta">${metaInfo.join(" • ")}</div>` : "";

        return `
          <div class="vm-source-item">
            <div class="vm-source-title">📄 ${title}</div>
            ${metaTag}
          </div>
        `;
      }).join("");

      sourcesHtml = `
        <div class="vm-sources-wrapper">
          <button type="button" class="vm-sources-btn" title="Click or hover to view verified sources">
            <svg class="vm-sources-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
            <span>Sources (${sources.length})</span>
          </button>
          <div class="vm-sources-toast">
            <div class="vm-sources-toast-header">
              <span>📚 Consulted Knowledge Base (${sources.length})</span>
              <button type="button" class="vm-sources-toast-close" title="Close">&times;</button>
            </div>
            <div class="vm-sources-toast-body">
              ${sourceItems}
            </div>
          </div>
        </div>
      `;
    }

    msgDiv.innerHTML = `<div class="vm-message-bubble">${contentHtml}${sourcesHtml}</div>`;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "vm-typing-indicator";
    typingDiv.className = "vm-message bot";
    typingDiv.innerHTML = `
      <div class="vm-typing-indicator">
        <div class="vm-dot"></div>
        <div class="vm-dot"></div>
        <div class="vm-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById("vm-typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  async function sendMessage(text) {
    appendMessage("user", text);
    userInput.value = "";
    sendBtn.disabled = true;
    showTypingIndicator();

    chatHistory.push({ role: "user", content: text });

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-6)
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      removeTypingIndicator();
      appendMessage("bot", data.answer, data.sources);
      chatHistory.push({ role: "model", content: data.answer });
    } catch (err) {
      removeTypingIndicator();
      appendMessage("bot", `Sorry, I could not connect to the VidyaAI backend (${err.message}). Make sure the API server is running on ${API_BASE_URL}.`);
    } finally {
      sendBtn.disabled = false;
      userInput.focus();
    }
  }
})();
