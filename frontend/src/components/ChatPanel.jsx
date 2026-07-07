import { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../services/api';

export default function ChatPanel({ selected }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([]);
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Document Selected</h2>
        <p className="text-sm mt-1 max-w-xs">
          Upload and click a PDF document from the sidebar list to start asking questions.
        </p>
      </div>
    );
  }

  const handleSend = async (textToSend = input) => {
    const textVal = textToSend.trim();
    if (!textVal || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textVal }]);
    setLoading(true);

    try {
      const res = await askQuestion(textVal);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: res.answer,
        sources: res.sources 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'I could not process your question. Please verify the document is properly indexed.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const samplePrompts = [
    "What is the main topic of this document?",
    "Summarize the key points in bullet format.",
    "Explain any important terms or findings."
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Document</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{selected.fileName}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Ready to sync
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/20 dark:bg-slate-950/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
              Ask any question about {selected.fileName}
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all cursor-pointer font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] rounded-2xl px-4.5 py-3 text-sm shadow-sm ${
                  isUser 
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                        Sources
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                            title={s.document}
                          >
                            <span className="truncate max-w-[120px] font-medium">{s.document}</span>
                            <span className="opacity-40">|</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              {(parseFloat(s.relevance) * 100).toFixed(0)}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl rounded-bl-none px-4.5 py-3 text-sm text-slate-400 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 px-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question about ${selected.fileName}...`}
            className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md ${
              loading || !input.trim()
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed border border-slate-200/40 dark:border-slate-800/40'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}