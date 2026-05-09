import { useEffect,useState } from "react";
import {getDocuments,uploadDocument,deleteDocument} from "./services/api";
import FileUpload from "./components/FIleUpload";
import FileList from "./components/FIleList";
import ChatPanel from "./components/ChatPanel";
export default function App(){
  const [documents,setDocuments]=useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,setLodaing]=useState(true);
  const [uploading,setUploading]=useState(false);


  const fetchDocuments=async()=>
  {
    try{
      setLodaing(true);
      const response=await getDocuments();
      setDocuments(response.data);
    }
    catch(err)
    {
      console.log('error loading files fro server',err);

    }
    finally{
      setLodaing(false);
    }
  };

    useEffect(()=>
  {
    fetchDocuments();
  },[]);

  const handleUpload=async(file)=>
  {
    try{
      setLodaing(true);
      await uploadDocument(file);
      fetchDocuments();
    }
    catch(err)
    {
      console.log('error uploading file to server',err);

    }
    finally{
      setLodaing(false);
    }
  };



  const handleDelete=async(id)=>
  {console.log('Deleting ID:', id);
    try{
      await deleteDocument(id);
      await fetchDocuments();
      console.log('Deleted ID:', id);
      if(selected?.id === id){
        console.log('Deleted selected document, clearing selection');
        setSelected(null);
      }
    }
    catch(err)
    {
      console.log('error deleting file from server',err);

    }
  }
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Left Panel */}
      <div className="w-80 bg-white shadow-md flex flex-col p-4 gap-4">
        <h1 className="text-xl font-bold text-indigo-600">StudySyncAI</h1>
        <FileUpload onUpload={handleUpload} uploading={uploading} />
        <FileList
          documents={documents}
          loading={loading}
          selected={selected}
          onSelect={setSelected}
          onDelete={handleDelete}
        />
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6">
        <ChatPanel selected={selected} />
      </div>

    </div>
  );
}