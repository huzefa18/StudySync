import { useEffect, useState } from "react";
import { getDocuments, uploadDocument, deleteDocument } from "./services/api";
import FileUpload from "./components/FIleUpload";
import FileList from "./components/FIleList";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      setDocuments(response.data || []);
    } catch (err) {
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      await uploadDocument(file);
      fetchDocuments();
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      await fetchDocuments();
      if (selected?._id === id) {
        setSelected(null);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Sidebar Panel */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-5 gap-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              S
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-300">
              StudySyncAI
            </span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm"
            aria-label="Toggle Theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <FileUpload onUpload={handleUpload} uploading={uploading} />
        
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <FileList
            documents={documents}
            loading={loading}
            selected={selected}
            onSelect={setSelected}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 p-6 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
        <ChatPanel selected={selected} />
      </div>
    </div>
  );
}