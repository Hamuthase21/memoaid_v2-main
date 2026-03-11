import React, { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Change these to your preferred GPT endpoint and key
const DEFAULT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_API_KEY = '';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
  const newMessages = [...messages, { role: 'user' as const, content: input }];
  setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || 'No response';
  setMessages([...newMessages, { role: 'assistant' as const, content: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant' as const, content: 'Error: ' + e }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', border: '1px solid #ccc', borderRadius: 8, padding: 16, background: '#fff' }}>
      <h3>ChatGPT Chat</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{ width: '100%', marginBottom: 4 }}
        />
        <input
          type="text"
          placeholder="API URL"
          value={apiUrl}
          onChange={e => setApiUrl(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ height: 200, overflowY: 'auto', border: '1px solid #eee', marginBottom: 8, padding: 8, background: '#fafafa' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left', margin: '4px 0' }}>
            <b>{m.role === 'user' ? 'You' : 'GPT'}:</b> {m.content}
          </div>
        ))}
        {loading && <div>Loading...</div>}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type your message..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
