import { useState, useRef, useEffect } from 'react';
import { askQuestion, clearChatHistory } from '../services/api';

export default function ChatPanel({ selected }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copied, setCopied] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setSessionId(null);
    setInput('');
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Document Selected</h2>
        <p className="text-sm mt-1 max-w-xs">Upload and select a PDF from the sidebar to start asking questions.</p>
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
      const res = await askQuestion(textVal, sessionId, selected._id, selected.fileName);
      if (res.sessionId && !sessionId) setSessionId(res.sessionId);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: res.answer,
        sources: res.sources
      }]);
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Could not process your question. Please try again.';
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (sessionId) await clearChatHistory(sessionId).catch(() => {});
    setMessages([]);
    setSessionId(null);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const samplePrompts = [
    "What is the main topic of this document?",
    "Summarize the key points in bullet format.",
    "Explain any important terms or findings.",
    "What conclusions does this document draw?"
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
        <div className="flex flex-col overflow-hidden min-w-0">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Document</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{selected.fileName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all cursor-pointer"
            >
              Clear chat
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {selected.processed ? 'Ready' : 'Processing...'}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/20 dark:bg-slate-950/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
              Ask any question about <span className="text-indigo-500">{selected.fileName}</span>
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 text-slate-600 dark:text-slate-400 transition-all cursor-pointer font-medium"
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
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy answer"
                    >
                      {copied === i ? (
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Sources</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600/50"
                            title={s.document}
                          >
                            <span className="truncate max-w-[110px] font-medium">{s.document}</span>
                            <span className="opacity-30">|</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              {(parseFloat(s.relevance) * 100).toFixed(0)}%
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
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]"></span>
              </span>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 px-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30">
        {sessionId && (
          <div className="text-[10px] text-slate-400 dark:text-slate-600 mb-2 font-mono truncate">
            session: {sessionId.slice(-12)}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${selected.fileName}...`}
            className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors resize-none"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md ${
              loading || !input.trim()
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}