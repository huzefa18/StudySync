const {getDocuments,uploadDocuments,deleteDocument}=require('../controllers/documentController');
const express=require('express');
const router=express.Router();
const upload=require('../middleware/upload');

router.get('/',getDocuments);
router.post('/upload',upload.single('file'),uploadDocuments);
router.delete('/:id',deleteDocument);

module.exports=router;
