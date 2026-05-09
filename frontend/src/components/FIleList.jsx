export default function FileList({documents,loading,selected,onSelect,onDelete})
{
    const formatSize=(byte)=>
    {
        if(byte<1024)
        {
            return byte+"B";
        }
        else if(byte<1024*1024){
            return (byte/1024).toFixed(1)+'KB';

        }
        return (byte/1024*1024).toFixed(1)+'MB';
    }

    if(loading)
    {
        return(
             <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
        );
    };
    if(documents.length===0)
    {
        return (
            <div className="text-center text-gray-400 py-8">
        <p className="text-sm">No documents yet</p>
        <p className="text-xs mt-1">Upload a PDF to get started</p>
      </div>
        );
    }
    return(
        <div className="flex flex-col gap-2 overflow-y-auto">
      {documents.map((doc) => (
        <div
          key={doc._id}
          onClick={() => onSelect(doc)}
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            selected?._id === doc._id
              ? 'bg-indigo-100 border border-indigo-300'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          {/* File info */}
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-medium text-gray-700 truncate">
              {doc.fileName}
            </p>
            <p className="text-xs text-gray-400">
              {formatSize(doc.fileSize)}
            </p>
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc._id);
            }}
            className="text-gray-300 hover:text-red-400 transition-colors ml-2 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
    );
};