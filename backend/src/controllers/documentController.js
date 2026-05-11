const Document = require('../models/Document');
const fs =require('fs');
const { model } = require('mongoose');
const path=require('path');
const {pdfProcessor}=require('../../services/pdfProcessorr')

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

        if(req.file.mimetype!=='application/pdf'){
            await fs.unlink(req.file.path).catch(()=>{})
            return res.status(400).json({
                success:false,
                message:'only pdf file is allowed',
            });
        }
        const document=await Document.create({
            fileName:req.file.originalname,
            filePath:req.file.path,
            fileType:req.file.mimetype,
            fileSize:req.file.size
        });
        console.log(`file ${document.fileName} uploaded successfully, starting text extraction`);
        pdfProcessor(req.file.path)
        .then(async(text)=>
        {
            await Document.findByIdAndUpdate(document._id,{
                extractedText:text,
                processed:true,
                pages:text.pages,
                hasDiagrams:text.hasDiagrams
            });
            console.log('text extracted and document updated successfully');
        })
        .catch(async (err)=>{
            console.log(`error extracting text for document ${document._id}`,err);
            Document.findByIdAndUpdate(document._id,{
                processed:false,
                extractionError:err.message});
        });
        
        res.status(201).json({
            success:true,
            data:document,
            message:'file uploaded successfully'
        })
    }

    catch(err)
    {
        if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
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

        if(document.pages?.length>0)
        {
            for(const page of document.pages)
            {
                if(page.imagePath)
                {
                    fs.unlinkSync(path.resolve(page.imagePath).catch(()=>{}));
                }
            }
            const imgDir=path.join('uploads','images',document._id.toString());
           await  fs.rm(imgDir,{recursive:true,force:true}.catch(()=>{}));
        }
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