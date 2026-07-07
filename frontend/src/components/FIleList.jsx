export default function FileList({ documents, loading, selected, onSelect, onDelete }) {
  const formatSize = (byte) => {
    if (byte < 1024) return byte + " B";
    if (byte < 1024 * 1024) return (byte / 1024).toFixed(1) + " KB";
    return (byte / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center text-slate-400 dark:text-slate-500 py-10 flex flex-col items-center gap-2">
        <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div>
          <p className="text-sm font-semibold">No documents uploaded</p>
          <p className="text-xs mt-1">Upload your study materials to start Q&A</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
        Documents ({documents.length})
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        {documents.map((doc) => {
          const isSelected = selected?._id === doc._id;
          return (
            <div
              key={doc._id}
              onClick={() => onSelect(doc)}
              className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer border transition-all duration-200 ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/60 shadow-sm'
                  : 'bg-white border-slate-200/60 hover:bg-slate-50/50 dark:bg-slate-900/40 dark:border-slate-800/80 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* PDF icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0112 2.586L15.414 6A1 1 0 0116 6.586V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {doc.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      doc.processed ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                    }`} title={doc.processed ? 'Processed and ready' : 'Processing...'} />
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc._id);
                }}
                className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
                title="Delete document"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}