import axios from "axios";

const API_URL='http://localhost:5000/api';
const api=axios.create({
    baseURL:API_URL
})

export const getDocuments=async()=>
{
        const response=await api.get('/documents');
        return response.data;

}

export const uploadDocument=async(file)=>
{
    const formData=new FormData();
    formData.append('file',file);
    const response=await api.post('/documents/upload',formData,{
        headers:{
            'Content-Type':'multipart/form-data'
        }
    })
    return response.data;
}

export const deleteDocument=async(id)=>
{
    const response=await api.delete(`/documents/${id}`);
    return response.data;
}
export const askQuestion = async (question) => {
    const response = await api.post('/chat/ask', { question });
    return response.data;
};