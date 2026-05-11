const mongoose = require('mongoose');
const PageSchema=new mongoose.Schema({
    pageNumber:{type:Number,required:true},
    text:{type:String ,required:true
    },
    hasDiagram:{type:Boolean,required:true},
    imagePath:{type:String,default:null},
    llmDescription:{type:String,default:''}
},{_id:false});  
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

    },
    extractionError:{
        type:String,
        default:null,
    },
     pages: [PageSchema],
     hasDiagrams: { type: Boolean, default: false }

},
{
    timestamps:true,
})
module.exports=mongoose.model('Document',DocumentSchema);