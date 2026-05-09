const {getDocuments,uploadDocument,deleteDocument}=require('../controllers/documentController');
const express=require('express');
const router=express.Router();
const upload=require('../middleware/upload');

router.get('/',getDocuments);
router.post('/upload',upload.single('file'),uploadDocument);
router.delete('/:id',deleteDocument);

module.exports=router;
