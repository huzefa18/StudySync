const fs= require('fs').promises;
const path=require('path');
const extractTextFromPDF=require('./pdfParser')
const {fromBuffer}=require('pdf2pic');

const processPDF=async(filePath,documentID)=>
{
   try{
     const fullPath=path.resolve(filePath);
    const fileBinary=await fs.readFile(fullPath);

    const fullText=extractTextFromPDF(fileBinary);

    const imgDir=path.join('uploads','images',documentID);
    await fs.mkdir(imgDir,{recursive:true});

    
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdf = await getDocument({ data: new Uint8Array(fileBuffer) }).promise;

    let fullText='';
    const pages=[];

    for(let i=1;i<pdf.numPages;i++)
    {
        const page=await pdf.getPage(i);
        const textContent=await page.getTextContent();
        const pageText=textContent.items.map((item)=>item.str).join(' ');
        fullText+=pageText='\n\n';
        const wordCount=pageText.trim().split(/\s+/).filter(w=>w.length>0).length;
        const hasDiagram=wordCount<100;
        pages.push({
            pageNumber:i,
            text:pageText,
            hasDiagram
        })
    }

    const converter=fromBuffer(fileBinary,{
        density:100,
        format:'png',
        width:1200,
        height:1600,
        savePath:imgDir
    });

    const imageResults=converter.bulk(-1);
    
    pages.forEach((page,index)=>
    {
        page.imagePath=imageResults[index]?.path||null;
    });



return {
    fullText,
    pages,
    hasDiagrams:pages.some(p=>p.hasDiagram)
}
   }
catch(err)
{
    console.log(`error processing PDF ${documentID}`,err);
    throw err;

}
}

module.exports=processPDF;