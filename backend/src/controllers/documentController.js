const Document = require('../models/Document');
const fs =require('fs');
const { model } = require('mongoose');
const path=require('path');

const getDocuments=async(req,res)=>
{
    try{
        const documents=await Document.find().sort({createdAt:-1});
        res.status(200).json({
            success:true,
            data:documents,
            count:documents.length
        })
    }
    catch(err){
        console.log("error fetching documents",err);
        res.status(500).json({
            success:false,
            message:"error fetching documents",
            error:err.message
        })
    }
}

const uploadDocument=async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:'no file uploaded',
            });
        }
        const document=await Document.create({
            fileName:req.file.originalname,
            filePath:req.file.path,
            fileType:req.file.mimetype,
            fileSize:req.file.size
        });
        res.status(201).json({
            success:true,
            data:document,
            message:'file uploaded successfully'
        })
    }
    catch(err)
    {
        console.log("error uploading document",err);
        res.status(500).json({
            success:false,
            message:'eror uploading file to server',
            error:err.message
        })
    }
}

const deleteDocument=async(req,res)=>
{
    try{
        const document=await Document.findById(req.params.id);
        if(!document){
            return res.status(404).json({
                success:false,
                message:"doc not found"
            });

        }
        fs.unlinkSync(path.resolve(document.filePath));
         
        await Document.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success:true,
            message:"doc deleted successfully"
        });
    }
    catch(err){
        console.log("error deleting document",err);
        res.status(500).json({
            success:false,
            message:"error deleting document",
            error:err.message   
        })
    }
}
module.exports={getDocuments,uploadDocument,deleteDocument}