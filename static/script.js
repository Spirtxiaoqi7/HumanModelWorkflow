// Global state
let conversationHistory = [];     // {role, content} role: user (model output), assistant (trainer)
let isWaiting = false;
let apiConfigured = false;

// DOM elements
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const initBtn = document.getElementById('initBtn');
const testBtn = document.getElementById('testBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const baseUrlInput = document.getElementById('baseUrlInput');
const modelInput = document.getElementById('modelInput');
const statusMsg = document.getElementById('statusMsg');

// Helper: escape HTML
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Helper: add message to UI
function appendMessage(role, content, isTrainer) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isTrainer ? 'trainer' : 'model'}`;
    const avatarText = isTrainer ? 'TR' : 'MD';
    messageDiv.innerHTML = `
        <div class="avatar">${avatarText}</div>
        <div class="bubble">${escapeHtml(content)}</div>
    `;
    messagesDiv.appendChild(messageDiv);
    const container = document.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
}

// Helper: show system message
function appendSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `<div class="avatar">SYS</div><div class="bubble">${escapeHtml(text)}</div>`;
    messagesDiv.appendChild(messageDiv);
    const container = document.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
}

// Loading indicator
function setLoading(loading) {
    isWaiting = loading;
    if (loading) {
        sendBtn.disabled = true;
        userInput.disabled = true;
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingIndicator';
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = `<div class="avatar">TR</div><div class="bubble">Training engineer is thinking...</div>`;
        messagesDiv.appendChild(loadingDiv);
        document.querySelector('.messages-container').scrollTop = document.querySelector('.messages-container').scrollHeight;
    } else {
        sendBtn.disabled = !apiConfigured;
        userInput.disabled = !apiConfigured;
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.remove();
    }
}

// API call
async function callAPI(endpoint, payload) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }
        return data;
    } catch (err) {
        throw err;
    }
}

// Test connection
async function testConnection() {
    const apiKey = apiKeyInput.value.trim();
    const baseUrl = baseUrlInput.value.trim() || null;
    const model = modelInput.value.trim() || 'gpt-3.5-turbo';

    if (!apiKey) {
        statusMsg.textContent = 'API key is required';
        statusMsg.className = 'status error';
        return;
    }

    statusMsg.textContent = 'Testing connection...';
    statusMsg.className = 'status';

    try {
        const result = await callAPI('/api/test', {
            api_key: apiKey,
            base_url: baseUrl,
            model: model
        });
        if (result.success) {
            statusMsg.textContent = 'Connection successful';
            statusMsg.className = 'status success';
        } else {
            statusMsg.textContent = 'Connection failed: ' + result.message;
            statusMsg.className = 'status error';
        }
    } catch (err) {
        statusMsg.textContent = 'Connection error: ' + err.message;
        statusMsg.className = 'status error';
    }
}

// Start training: get first AI message
async function startTraining() {
    if (isWaiting) return;
    resetConversation();

    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        statusMsg.textContent = 'Please enter API key';
        statusMsg.className = 'status error';
        return;
    }

    setLoading(true);
    try {
        const data = await callAPI('/api/chat', {
            messages: [],
            api_key: apiKey,
            base_url: baseUrlInput.value.trim() || null,
            model: modelInput.value.trim() || 'gpt-3.5-turbo'
        });
        const firstReply = data.reply;
        if (firstReply) {
            appendMessage('trainer', firstReply, true);
            conversationHistory.push({ role: 'assistant', content: firstReply });
            apiConfigured = true;
            sendBtn.disabled = false;
            userInput.disabled = false;
            userInput.focus();
            statusMsg.textContent = 'Training session active';
            statusMsg.className = 'status success';
        } else {
            throw new Error('Empty response');
        }
    } catch (err) {
        appendSystemMessage('Failed to start training: ' + err.message);
        statusMsg.textContent = 'Start failed: ' + err.message;
        statusMsg.className = 'status error';
        apiConfigured = false;
        sendBtn.disabled = true;
        userInput.disabled = true;
    } finally {
        setLoading(false);
    }
}

// Send user message (as model output)
async function sendUserMessage() {
    if (isWaiting) return;
    const userText = userInput.value.trim();
    if (!userText) return;

    appendMessage('model', userText, false);
    conversationHistory.push({ role: 'user', content: userText });
    userInput.value = '';

    setLoading(true);
    try {
        const data = await callAPI('/api/chat', {
            messages: conversationHistory,
            api_key: apiKeyInput.value.trim(),
            base_url: baseUrlInput.value.trim() || null,
            model: modelInput.value.trim() || 'gpt-3.5-turbo'
        });
        const assistantReply = data.reply;
        if (assistantReply) {
            appendMessage('trainer', assistantReply, true);
            conversationHistory.push({ role: 'assistant', content: assistantReply });
        } else {
            throw new Error('No reply from AI');
        }
    } catch (err) {
        appendSystemMessage('Error: ' + err.message);
        statusMsg.textContent = 'Chat error: ' + err.message;
        statusMsg.className = 'status error';
    } finally {
        setLoading(false);
    }
}

// Reset conversation (keep API settings)
function resetConversation() {
    conversationHistory = [];
    messagesDiv.innerHTML = '';
    const systemMsgDiv = document.createElement('div');
    systemMsgDiv.className = 'message system';
    systemMsgDiv.innerHTML = `<div class="avatar">SYS</div><div class="bubble">Conversation reset. Click Start Training to begin a new session.</div>`;
    messagesDiv.appendChild(systemMsgDiv);
    apiConfigured = false;
    sendBtn.disabled = true;
    userInput.disabled = true;
    userInput.value = '';
    statusMsg.textContent = 'Reset. Configure API and start training.';
    statusMsg.className = 'status';
}

// Event binding
sendBtn.addEventListener('click', sendUserMessage);
resetBtn.addEventListener('click', resetConversation);
initBtn.addEventListener('click', startTraining);
testBtn.addEventListener('click', testConnection);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isWaiting && apiConfigured) {
        e.preventDefault();
        sendUserMessage();
    }
});

// Initial status
statusMsg.textContent = 'Enter API key and test connection';
statusMsg.className = 'status';