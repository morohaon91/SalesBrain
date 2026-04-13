(function() {
  'use strict';

  // Configuration from parent window
  const config = window.SalesBrainConfig || {};
  const API_KEY = config.apiKey;
  const BASE_URL = config.baseUrl || 'https://api.salesbrain.ai';
  const POSITION = config.position || 'bottom-right';
  const PRIMARY_COLOR = config.primaryColor || '#4F46E5';
  const GREETING = config.greeting || 'Hi! How can I help you today?';

  if (!API_KEY) {
    console.error('SalesBrain: API key is required');
    return;
  }

  // Create main container
  const container = document.createElement('div');
  container.id = 'salesbrain-widget';
  container.style.cssText = `
    position: fixed;
    ${POSITION.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
    ${POSITION.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create chat bubble (minimized state)
  const bubble = document.createElement('button');
  bubble.id = 'salesbrain-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  bubble.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: ${PRIMARY_COLOR};
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    font-size: 0;
  `;

  bubble.addEventListener('mouseenter', () => bubble.style.transform = 'scale(1.1)');
  bubble.addEventListener('mouseleave', () => bubble.style.transform = 'scale(1)');

  // Create chat window (expanded state)
  const chatWindow = document.createElement('div');
  chatWindow.id = 'salesbrain-chat';
  chatWindow.style.cssText = `
    display: none;
    position: absolute;
    bottom: 80px;
    ${POSITION.includes('right') ? 'right: 0;' : 'left: 0;'}
    width: 380px;
    height: 600px;
    max-height: 90vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    overflow: hidden;
    flex-direction: column;
    display: none;
  `;

  // Chat header
  const header = document.createElement('div');
  header.style.cssText = `
    background: ${PRIMARY_COLOR};
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <div>
      <div style="font-weight: 600; font-size: 16px;">Chat with us</div>
      <div style="font-size: 12px; opacity: 0.9;">We typically reply instantly</div>
    </div>
    <button id="salesbrain-close" aria-label="Close chat" style="
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 24px;
      padding: 0;
      width: 32px;
      height: 32px;
    ">&times;</button>
  `;

  // Messages area
  const messages = document.createElement('div');
  messages.id = 'salesbrain-messages';
  messages.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #F9FAFB;
  `;

  // Input area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = `
    padding: 16px;
    border-top: 1px solid #E5E7EB;
    background: white;
  `;
  inputArea.innerHTML = `
    <div style="display: flex; gap: 8px;">
      <input
        type="text"
        id="salesbrain-input"
        placeholder="Type your message..."
        style="
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
        "
      />
      <button
        id="salesbrain-send"
        aria-label="Send message"
        style="
          background: ${PRIMARY_COLOR};
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        "
      >Send</button>
    </div>
  `;

  // Assemble chat window
  chatWindow.appendChild(header);
  chatWindow.appendChild(messages);
  chatWindow.appendChild(inputArea);

  // Add to container
  container.appendChild(bubble);
  container.appendChild(chatWindow);
  document.body.appendChild(container);

  // State
  let conversationId = null;
  let isOpen = false;

  // Toggle chat
  function toggleChat() {
    isOpen = !isOpen;
    bubble.style.display = isOpen ? 'none' : 'flex';
    chatWindow.style.display = isOpen ? 'flex' : 'none';

    if (isOpen && !conversationId) {
      startConversation();
    }
  }

  bubble.addEventListener('click', toggleChat);
  document.getElementById('salesbrain-close').addEventListener('click', toggleChat);

  // Start conversation
  async function startConversation() {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/public/lead-chat/${API_KEY}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      conversationId = data.data?.conversationId;

      // Show greeting
      addMessage('assistant', GREETING);
    } catch (error) {
      console.error('SalesBrain: Failed to start conversation', error);
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    }
  }

  // Send message
  async function sendMessage(content) {
    if (!content.trim() || !conversationId) return;

    // Add user message to UI
    addMessage('user', content);

    // Clear input
    const input = document.getElementById('salesbrain-input');
    input.value = '';
    input.disabled = true;

    // Show typing indicator
    showTyping();

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/public/lead-chat/${API_KEY}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            content
          })
        }
      );

      const data = await response.json();

      // Remove typing indicator
      hideTyping();

      // Add AI response
      if (data.data?.reply) {
        addMessage('assistant', data.data.reply);
      }

      input.disabled = false;
      input.focus();

    } catch (error) {
      hideTyping();
      console.error('SalesBrain: Failed to send message', error);
      addMessage('assistant', 'Sorry, I had trouble sending that. Please try again.');
      input.disabled = false;
    }
  }

  // Add message to UI
  function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      ${role === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
    `;

    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 12px;
      ${role === 'user'
        ? `background: ${PRIMARY_COLOR}; color: white;`
        : 'background: white; color: #111827; box-shadow: 0 1px 2px rgba(0,0,0,0.1);'
      }
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    `;
    bubble.textContent = content;

    messageDiv.appendChild(bubble);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  // Typing indicator
  let typingIndicator = null;

  function showTyping() {
    typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.style.cssText = 'margin-bottom: 12px;';
    typingIndicator.innerHTML = `
      <div style="
        display: inline-block;
        padding: 10px 14px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      ">
        <span style="
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: salesbrain-typing 1.4s infinite;
        "></span>
        <span style="
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: salesbrain-typing 1.4s infinite 0.2s;
        "></span>
        <span style="
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: salesbrain-typing 1.4s infinite 0.4s;
        "></span>
      </div>
    `;
    messages.appendChild(typingIndicator);
    messages.scrollTop = messages.scrollHeight;

    // Add animation if not already added
    if (!document.getElementById('salesbrain-typing-animation')) {
      const style = document.createElement('style');
      style.id = 'salesbrain-typing-animation';
      style.textContent = `
        @keyframes salesbrain-typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function hideTyping() {
    if (typingIndicator) {
      typingIndicator.remove();
      typingIndicator = null;
    }
  }

  // Event listeners
  document.getElementById('salesbrain-send').addEventListener('click', () => {
    const input = document.getElementById('salesbrain-input');
    sendMessage(input.value);
  });

  document.getElementById('salesbrain-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage(e.target.value);
    }
  });

  // Mobile responsive
  function handleResize() {
    if (window.innerWidth < 768) {
      chatWindow.style.cssText += `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
      `;
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  console.log('SalesBrain widget loaded successfully');
})();
