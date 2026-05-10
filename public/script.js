/**
 * Simple chatbot frontend using Vanilla JS.
 * Handles form submission, UI updates, and API interaction.
 */

const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Store conversation history for context
let conversation = [];

/**
 * Creates and appends a message element to the chat box
 */
function addMessageToUI(role, text) {
  const isUser = role === 'user';
  
  const msgWrapper = document.createElement('div');
  msgWrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`;
  
  const msgContent = document.createElement('div');
  msgContent.className = `max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
    isUser 
      ? 'bg-blue-600 text-white rounded-br-none' 
      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
  }`;
  
  if (!isUser) {
    const nameLabel = document.createElement('p');
    nameLabel.className = 'text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1';
    nameLabel.textContent = 'Gemini';
    msgContent.appendChild(nameLabel);
  }

  const textElement = document.createElement('p');
  textElement.className = 'whitespace-pre-wrap leading-relaxed';
  textElement.textContent = text;
  msgContent.appendChild(textElement);
  
  msgWrapper.appendChild(msgContent);
  chatBox.appendChild(msgWrapper);
  
  // Auto-scroll to bottom
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

/**
 * Shows the "Thinking..." indicator
 */
function showThinking() {
  const thinkingWrapper = document.createElement('div');
  thinkingWrapper.id = 'thinking-indicator';
  thinkingWrapper.className = 'flex justify-start';
  
  const thinkingContent = document.createElement('div');
  thinkingContent.className = 'bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2';
  
  thinkingContent.innerHTML = `
    <div class="flex gap-1">
      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
    </div>
    <span class="text-slate-400 text-sm italic">Thinking...</span>
  `;
  
  thinkingWrapper.appendChild(thinkingContent);
  chatBox.appendChild(thinkingWrapper);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  
  return thinkingWrapper;
}

/**
 * Handles form submission
 */
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const text = userInput.value.trim();
  if (!text) return;
  
  // Clear input
  userInput.value = '';
  
  // 1. Update UI with user message
  addMessageToUI('user', text);
  
  // 2. Add to internal state
  conversation.push({ role: 'user', text });
  
  // 3. Show thinking indicator
  const thinkingIndicator = showThinking();
  
  try {
    // 4. API Request to the Express backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    // Remove thinking indicator
    thinkingIndicator.remove();

    if (!response.ok) {
        throw new Error('Server returned an error');
    }

    const data = await response.json();
    
    if (data && data.result) {
      // 5. Success: Add AI response to UI and state
      addMessageToUI('model', data.result);
      conversation.push({ role: 'model', text: data.result });
    } else {
      // 6. No result handling
      addMessageToUI('model', 'Sorry, no response received.');
    }
    
  } catch (error) {
    console.error('Error fetching chat:', error);
    if (document.getElementById('thinking-indicator')) {
      thinkingIndicator.remove();
    }
    // 7. Error handling
    addMessageToUI('model', 'Failed to get response from server.');
  }
});