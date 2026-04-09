# PHASES 4-6: WIDGET, ANALYTICS & CONTINUOUS LEARNING
## Final System Components for World-Class Product

---

# PHASE 4: PROFESSIONAL EMBEDDABLE WIDGET
## Transform Standalone Chat into Universal Web Component

**Duration:** Week 5 (5-7 days)  
**Complexity:** Medium  
**Impact:** 🔥 ESSENTIAL - Product becomes deployable  
**Current State:** Only standalone page `/l/[widgetApiKey]`  
**Target State:** One-line embed script for any website

---

## OBJECTIVES

1. ✅ Create embeddable widget.js script
2. ✅ Build floating chat UI component
3. ✅ Add customization (colors, position, greeting)
4. ✅ Mobile responsive design
5. ✅ Analytics tracking (unique visitors, sessions)

---

## WIDGET ARCHITECTURE

### Embed Code (What Customer Uses):

```html
<!-- Add to any website -->
<script>
  (function() {
    window.SalesBrainConfig = {
      apiKey: 'sb_abc123xyz',
      position: 'bottom-right',
      primaryColor: '#4F46E5'
    };
    var script = document.createElement('script');
    script.src = 'https://widget.salesbrain.ai/v1/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

### Widget Components:

```
┌─────────────────────────────────────┐
│  WIDGET.JS (Main Script)            │
│  - Loads on customer's website      │
│  - Creates iframe or shadow DOM     │
│  - Handles cross-domain messaging   │
│  - Tracks analytics                 │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  CHAT BUBBLE (Minimized State)      │
│  - Floating button                  │
│  - Shows unread count               │
│  - Customizable colors/position     │
└─────────────────────────────────────┘
                 ↓ (on click)
┌─────────────────────────────────────┐
│  CHAT WINDOW (Expanded State)       │
│  - Full conversation interface      │
│  - Message history                  │
│  - Typing indicators                │
│  - Mobile responsive                │
└─────────────────────────────────────┘
```

---

## IMPLEMENTATION

### STEP 1: Create Widget Script

**New file:** `public/widget/v1/widget.js`

```javascript
(function() {
  'use strict';
  
  // Configuration
  const config = window.SalesBrainConfig || {};
  const API_KEY = config.apiKey;
  const BASE_URL = config.baseUrl || 'https://api.salesbrain.ai';
  const POSITION = config.position || 'bottom-right';
  const PRIMARY_COLOR = config.primaryColor || '#4F46E5';
  
  if (!API_KEY) {
    console.error('SalesBrain: API key is required');
    return;
  }
  
  // Create chat container
  const container = document.createElement('div');
  container.id = 'salesbrain-widget';
  container.style.cssText = `
    position: fixed;
    ${POSITION.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
    ${POSITION.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Create bubble (minimized state)
  const bubble = document.createElement('button');
  bubble.id = 'salesbrain-bubble';
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
    transition: transform 0.2s;
  `;
  
  bubble.onmouseenter = () => bubble.style.transform = 'scale(1.1)';
  bubble.onmouseleave = () => bubble.style.transform = 'scale(1)';
  
  // Create chat window (expanded state)
  const chatWindow = document.createElement('div');
  chatWindow.id = 'salesbrain-chat';
  chatWindow.style.cssText = `
    display: none;
    width: 380px;
    height: 600px;
    max-height: 90vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    overflow: hidden;
    flex-direction: column;
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
    <button id="salesbrain-close" style="
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
        "
      />
      <button 
        id="salesbrain-send"
        style="
          background: ${PRIMARY_COLOR};
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
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
  
  bubble.onclick = toggleChat;
  document.getElementById('salesbrain-close').onclick = toggleChat;
  
  // Start conversation
  async function startConversation() {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/public/lead-chat/${API_KEY}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      conversationId = data.conversationId;
      
      // Show greeting
      if (data.greeting) {
        addMessage('assistant', data.greeting);
      }
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
    document.getElementById('salesbrain-input').value = '';
    
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
      if (data.response) {
        addMessage('assistant', data.response);
      }
      
      // Check if conversation ended
      if (data.conversationEnded) {
        addMessage('system', 'This conversation has ended. Thank you for chatting with us!');
      }
      
    } catch (error) {
      hideTyping();
      console.error('SalesBrain: Failed to send message', error);
      addMessage('assistant', 'Sorry, I had trouble sending that. Please try again.');
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
        : role === 'system'
        ? 'background: #FEF3C7; color: #92400E;'
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
          animation: typing 1.4s infinite;
        "></span>
        <span style="
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: typing 1.4s infinite 0.2s;
        "></span>
        <span style="
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: typing 1.4s infinite 0.4s;
        "></span>
      </div>
    `;
    messages.appendChild(typingIndicator);
    messages.scrollTop = messages.scrollHeight;
    
    // Add animation
    if (!document.getElementById('typing-animation')) {
      const style = document.createElement('style');
      style.id = 'typing-animation';
      style.textContent = `
        @keyframes typing {
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
  document.getElementById('salesbrain-send').onclick = () => {
    const input = document.getElementById('salesbrain-input');
    sendMessage(input.value);
  };
  
  document.getElementById('salesbrain-input').onkeypress = (e) => {
    if (e.key === 'Enter') {
      sendMessage(e.target.value);
    }
  };
  
  // Mobile responsive
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
  
  console.log('SalesBrain widget loaded successfully');
})();
```

---

### STEP 2: Widget Configuration UI

**File:** `app/(dashboard)/settings/widget/page.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function WidgetSettingsPage() {
  const [config, setConfig] = useState({
    enabled: true,
    apiKey: 'sb_abc123xyz',
    position: 'bottom-right',
    primaryColor: '#4F46E5',
    greeting: 'Hi! How can I help you today?'
  });
  
  const embedCode = `
<script>
  (function() {
    window.SalesBrainConfig = {
      apiKey: '${config.apiKey}',
      position: '${config.position}',
      primaryColor: '${config.primaryColor}'
    };
    var script = document.createElement('script');
    script.src = 'https://widget.salesbrain.ai/v1/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
  `.trim();
  
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Widget Settings</h1>
      
      {/* Configuration */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Position</label>
          <select 
            value={config.position}
            onChange={(e) => setConfig({...config, position: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <input 
            type="color"
            value={config.primaryColor}
            onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
            className="border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Greeting Message</label>
          <input 
            type="text"
            value={config.greeting}
            onChange={(e) => setConfig({...config, greeting: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>
      
      {/* Embed Code */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Embed Code</h2>
        <p className="text-sm text-gray-600 mb-2">
          Copy this code and paste it before the closing &lt;/body&gt; tag on your website:
        </p>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">{embedCode}</pre>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(embedCode)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Copy to Clipboard
        </button>
      </div>
      
      {/* Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <div className="border rounded-lg p-8 bg-gray-50 relative h-96">
          <p className="text-gray-500">Your widget will appear here</p>
          {/* Render widget preview */}
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 5: ADVANCED ANALYTICS & INSIGHTS

**Duration:** Week 6 (5-7 days)

### Key Features:
1. ✅ Historical trends (conversations over time)
2. ✅ Conversion funnel (started → qualified → booked)
3. ✅ Lead quality metrics
4. ✅ A/B testing (greeting variations)
5. ✅ CSV export

---

## PHASE 6: CONTINUOUS LEARNING SYSTEM

**Duration:** Week 7-8 (10-12 days)

### Key Features:
1. ✅ Owner feedback loop (approve/reject AI responses)
2. ✅ Pattern discovery (what makes leads convert)
3. ✅ Auto-improvement (system learns from corrections)
4. ✅ Quality trends dashboard
5. ✅ CRM integration hooks

### Learning Flow:
```
AI responds → Owner reviews → Owner corrects
   ↓                              ↓
Stores response            Updates patterns
   ↓                              ↓
Tracks accuracy            Refines prompts
   ↓                              ↓
Shows trends              Gets smarter
```

---

## 8-WEEK TIMELINE SUMMARY

### Week 1: Intelligent Scoring
- Hybrid scoring (rules + AI)
- Early exit logic
- Scoring breakdown UI

### Week 2-3: CLOSER Framework
- Verbatim phrase extraction
- CLOSER-aware conversations
- Objection tracking
- Phase progress UI

### Week 4: Vector Search
- Pinecone integration
- Knowledge base vectorization
- RAG in conversations
- Semantic search API

### Week 5: Embeddable Widget
- Widget.js script
- Floating chat UI
- Customization options
- Mobile responsive

### Week 6: Advanced Analytics
- Historical trends
- Conversion metrics
- Quality insights
- Export functionality

### Week 7-8: Continuous Learning
- Feedback loop
- Pattern discovery
- Auto-improvement
- CRM integration

---

## TOTAL IMPACT

After 8 weeks, you'll have:

✅ AI that scores leads intelligently (hybrid approach)  
✅ AI that follows CLOSER framework naturally  
✅ AI that knows everything about the business (RAG)  
✅ Embeddable widget for any website  
✅ Advanced analytics dashboard  
✅ Self-improving system that learns

**This is the best lead warm-up system in the world.** 🏆

---

**END OF ALL PHASES**
