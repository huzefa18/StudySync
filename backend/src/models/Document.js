const mongoose = require('mongoose');
const DocumentSchema= new mongoose.Schema({
    fileName:{
        type:String,
        required:true,
        trim:true
    },
    extractedText:{
        type:String,
        default:'',
        
    },
    fileType:{
        required:true,
        default:'application/pdf',
        type:String,
    },
    fileSize:{
        type:Number,
        required:true,
    },
    filePath:{
        type:String,
        required:true,
    }
    ,
    processed:{
        required:true,
        type:Boolean,
        default:false,

    }

},
{
    timestamps:true,
})
module.exports=mongoose.model('Document',DocumentSchema);