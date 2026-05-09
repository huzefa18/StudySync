// src/components/ChatPanel.jsx

export default function ChatPanel({ selected }) {

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

  // Document selected state
  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm">

      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm text-gray-400">Chatting with</p>
        <p className="font-semibold text-gray-700 truncate">{selected.fileName}</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center text-gray-300">
          <p className="text-sm">AI chat coming in Phase 3</p>
          <p className="text-xs mt-1">Document parsing and embeddings not set up yet</p>
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            disabled
            placeholder="AI not connected yet..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <button
            disabled
            className="bg-indigo-300 text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}