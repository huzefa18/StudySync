import {useRef} from 'react'

export default function FileUpload({onUpload,uploading})
{
    const inputRef=useRef(null);
    const handleFileChange=(e)=>
    {
        const file=e.target.files[0];
        if(file) onUpload(file);
    };

    const handleDrop=(e)=>
    {
        e.preventDefault();
        const file=e.dataTransfer.files[0];
        if(file) onUpload(file);
    };

    const handleDragOver=(e)=>
    {
        e.preventDefault();
    }
    return(
         <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !uploading && inputRef.current.click()}
      className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center cursor-pointer hover:bg-indigo-50 transition-colors"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading ? (
        <div className="text-indigo-500">
          <p className="text-sm font-medium">Uploading...</p>
          <p className="text-xs text-gray-400 mt-1">Please wait</p>
        </div>
      ) : (
        <div className="text-gray-400">
          <p className="text-sm font-medium">Drop PDF here</p>
          <p className="text-xs mt-1">or click to browse</p>
        </div>
      )}
    </div>
    )
}