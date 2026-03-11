import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const GEMINI_API_KEY = 'AIzaSyAMd5zyShNpDWRPclqLrUk4bzhYytGFZCY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY;


const CHAT_LIST_KEY = 'gemini_chat_list';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created: number;
}

function generateTitle(messages: Message[]): string {
  const firstUserMsg = messages.find(m => m.role === 'user');
  return firstUserMsg ? firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '') : 'New Chat';
}

const GeminiChat: React.FC = () => {
  const [chatList, setChatList] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(CHAT_LIST_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const saved = localStorage.getItem(CHAT_LIST_KEY);
    if (saved) {
      const chats: ChatSession[] = JSON.parse(saved);
      return chats.length > 0 ? chats[0].id : '';
    }
    return '';
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Get messages for active chat
  const messages = chatList.find(c => c.id === activeChatId)?.messages || [];

  // Scroll to bottom on new message

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist chat list
  useEffect(() => {
    localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(chatList));
  }, [chatList]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    let updatedList = [...chatList];
    let chatIdx = updatedList.findIndex(c => c.id === activeChatId);
    if (chatIdx === -1) {
      // New chat
      const newId = Date.now().toString();
      updatedList.unshift({
        id: newId,
        title: 'New Chat',
        messages: [{ role: 'user', content: input }],
        created: Date.now(),
      });
      setActiveChatId(newId);
      chatIdx = 0;
    } else {
      updatedList[chatIdx] = {
        ...updatedList[chatIdx],
        messages: [...updatedList[chatIdx].messages, { role: 'user', content: input }],
      };
    }
    setChatList(updatedList);
    setInput('');
    setLoading(true);
    try {
      const newMessages = updatedList[chatIdx].messages;
      const contents = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));
      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
      });
      const data = await res.json();
      let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply && data.error) {
        reply = `Error: ${data.error.message || JSON.stringify(data.error)}`;
      }
      if (!reply) {
        reply = 'No response';
      }
      // Add Gemini reply
      updatedList = [...updatedList];
      updatedList[chatIdx] = {
        ...updatedList[chatIdx],
        messages: [...updatedList[chatIdx].messages, { role: 'model', content: reply }],
        title: generateTitle(newMessages),
      };
      setChatList(updatedList);
    } catch (e) {
      updatedList = [...updatedList];
      updatedList[chatIdx] = {
        ...updatedList[chatIdx],
        messages: [...updatedList[chatIdx].messages, { role: 'model', content: 'Error: ' + e }],
      };
      setChatList(updatedList);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg flex h-[600px] border border-gray-200 overflow-hidden">
      {/* Sidebar for chat history */}
      <aside className="w-64 bg-gradient-to-b from-emerald-400 to-cyan-400 text-white flex flex-col border-r border-emerald-200">
        <div className="px-6 py-4 border-b border-emerald-300 flex items-center justify-between">
          <span className="font-bold text-lg">Chats</span>
          <button
            className="text-xs text-white/70 hover:text-white transition"
            title="New chat"
            onClick={() => {
              const newId = Date.now().toString();
              setChatList([{ id: newId, title: 'New Chat', messages: [], created: Date.now() }, ...chatList]);
              setActiveChatId(newId);
            }}
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatList.length === 0 && (
            <div className="text-center text-white/70 mt-10">No chats yet</div>
          )}
          {chatList.map(chat => (
            <div
              key={chat.id}
              className={`px-5 py-3 cursor-pointer border-b border-emerald-300 transition-all ${
                chat.id === activeChatId ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div className="truncate">{chat.title}</div>
              <div className="text-xs text-white/60">{new Date(chat.created).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <button
          className="m-4 text-xs text-white/70 hover:text-red-200 transition"
          title="Clear all chats"
          onClick={() => {
            setChatList([]);
            setActiveChatId('');
          }}
        >
          Clear All
        </button>
      </aside>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-cyan-50">
          <h3 className="text-lg font-bold text-emerald-600">Gemini Chat</h3>
          <button
            className="text-xs text-gray-400 hover:text-red-500 transition"
            title="Clear chat"
            onClick={() => {
              setChatList(chatList.map(c => c.id === activeChatId ? { ...c, messages: [] } : c));
            }}
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-emerald-50 to-cyan-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-16">Start the conversation!</div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[70%] whitespace-pre-line shadow-md ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white self-end'
                    : 'bg-white border border-emerald-100 text-gray-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="mb-3 flex justify-start">
              <div className="rounded-lg px-4 py-2 max-w-[70%] bg-white border border-emerald-100 text-gray-400 shadow-sm">
                Gemini is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form
          className="px-6 py-4 border-t border-gray-100 bg-white flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) sendMessage(); }}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-800 bg-emerald-50"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default GeminiChat;
