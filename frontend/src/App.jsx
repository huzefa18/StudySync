import { useState } from 'react';

export default function App() {
  // Plain JS: just initialize with an empty array
  const [files, setFiles] = useState([]);

  // Simple handler to mock a file upload
  const handleUpload = () => {
    const mockFile = { name: `lecture_notes_${files.length + 1}.pdf`, size: '2.4 MB' };
    setFiles([...files, mockFile]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          StudySyncAI
        </h1>
        <span className="text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
          v1.0.0
        </span>
      </nav>

      {/* 2. Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Upload Panel */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-white">Upload Materials</h2>
          
          <div 
            onClick={handleUpload}
            className="flex-1 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/30 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition duration-200 ease-in-out group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📁</span>
            <p className="text-sm font-medium text-slate-300">Drop your PDFs here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1">Supports PDF up to 20MB</p>
          </div>

          {/* List of uploaded files */}
          <div className="mt-6 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Files</h3>
            {files.length === 0 ? (
              <p className="text-sm text-slate-600 italic">No files uploaded yet.</p>
            ) : (
              files.map((file, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-800/50 border border-slate-800 px-3 py-2 rounded-lg text-sm">
                  <span className="text-slate-200 truncate max-w-[180px]">{file.name}</span>
                  <span className="text-xs text-slate-500">{file.size}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Side: RAG / Chat Preview Box */}
        <section className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[500px]">
          <h2 className="text-lg font-semibold mb-4 text-white">Interactive AI Assistant</h2>
          
          <div className="flex-1 bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 overflow-y-auto mb-4 text-sm flex flex-col justify-end">
            <p className="text-slate-500 italic text-center mb-auto">
              Upload a document to start extracting core concepts and generating quizzes.
            </p>
            <div className="bg-slate-800/80 border border-slate-700/50 self-start p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl max-w-[80%] mb-3">
              <span className="text-xs text-emerald-400 font-bold block mb-1">AI Assistant</span>
              Hello! Upload any course document, and I can generate a structured knowledge graph or build a quiz from it.
            </div>
          </div>

          {/* Prompt input field */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask a question about your files..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 transition"
            />
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm transition">
              Send
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}