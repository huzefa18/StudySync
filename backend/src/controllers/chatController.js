const {findRelevantChunks} = require('../../services/search');
const {generateAnswer } = require('../../services/geminiQA');

const askQuestion= async (req,res)=>
{
    const {question}=req.body;

    if(!question || question.trim() ==='')
    {
        console.log('Received empty question');
        return res.status(400).json({
            success:false,
            message:'question is required'
        });
    }

    try{
        console.log(`Received question: "${question}"`);
        const relevantChunks= await findRelevantChunks(question,5);
        
        if(relevantChunks.length === 0)
        {
            console.log(`no relevant chunks found for your answer`);
            return re.status(200).json({
                success:true,
                answer:'i found no relevant chunks of information for the question u asked',
                sources:[]
            });
        }

        console.log(`Found ${relevantChunks.length} relevant chunks for question: "${question}"`);
        const answerr=await generateAnswer(question,relevantChunks);

        res.status(200).json({
            success:true,
            answer:answerr,
            sources: relevantChunks.map(chunk=>(
                {
                    document:chunk.metadata.documentName,
                    chunkIndex:chunk.metadata.chunkIndex,
                    relevance:(1-chunk.distance).toFixed(2)
                }
            ))

        });
        

    }
    catch(err)
    {
            console.error('Chat error:', err);
        res.status(500).json({
            success:false,
            message:'failed to generate ans',
            error:err.message

        });
    }
};

module.exports={askQuestion}
