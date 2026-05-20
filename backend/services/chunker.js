
const chunkText=(text,maxLength=1000,overlap=200)=>{
     if (!text || typeof text !== 'string') {
        console.error('chunkText received invalid input:', typeof text, text);
        return [];
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return [];
    }

    if (trimmed.length <= maxLength) {
        return [trimmed];
    }


    const chunks=[];
    let start=0;
    while(start < trimmed.length)
    {
        let end=start+maxLength;

        if(end < trimmed.length)
        {
            const nearPoint=trimmed.lastIndexOf('.',end);
            const nearLine=trimmed.lastIndexOf('\n',end);

            const breakPoint=Math.max(nearLine,nearPoint);
            if(breakPoint > start)
            {
                end=breakPoint+1;
            }
        }
        let chunkText = trimmed.slice(start, end).trim();
        if (chunkText.length > 0) {  
            chunks.push(chunkText);
        }
        const nextStart = end - overlap;
if (nextStart <= start) {
    start = end;  // Force forward movement
} else {
    start = nextStart;
}
    }
    return chunks;
}
module.exports={chunkText};