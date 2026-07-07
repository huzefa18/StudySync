const multer=require('multer');
const path=require('path');
const fs=require('fs');

const UPLOADS_DIR = 'uploads/';
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage=multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,'uploads/');
    },
    filename:function(req,file,cb)
    {
        const uniqueName=Date.now()+"-"+file.originalname;
        cb(null,uniqueName);
    }
});

const fileFilter= function (req,file,cb){
    const allowedType=['application/pdf'];
    if(file.mimetype == allowedType[0]) {
        cb(null,true);
    }
    else{
        cb(new Error('only pdfs allowed '),false);
    }


};
const upload=multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize: 10*1024*1024}
})
module.exports=upload;
