// src/components/ChatPanel.jsx
import { useState } from 'react';
import { askQuestion } from '.././services/api';

export default function ChatPanel({ selected }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // No document selected state
  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
        <p className="text-lg font-medium">No document selected</p>
        <p className="text-sm mt-2">
          Upload a PDF and select it to start chatting
        </p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await askQuestion(userMsg);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: res.answer,
        sources: res.sources 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Sorry, I could not process your question. Make sure documents are indexed.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm">

      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm text-gray-400">Chatting with</p>
        <p className="font-semibold text-gray-700 truncate">{selected.fileName}</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-300 mt-10">
            <p className="text-sm">Ask a question about this document</p>
            <p className="text-xs mt-1">e.g. "What is the main topic?"</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sources && (
                  <p className="text-xs mt-2 opacity-70">
                    Sources: {msg.sources.map(s => s.documentName).join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this document..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 rounded-lg text-sm ${
              loading || !input.trim()
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600'
            } text-white`}
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}