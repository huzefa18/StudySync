require('dotenv').config()
const express=require('express')
const connectDB=require('./config/db')
const cors=require('cors')
const app=express();
const documentRoutes=require('./src/routes/documnetRoutes')
const chatRoutes=require('./src/routes/chatRoutes')
const PORT=process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api/documents', documentRoutes);
app.use('/api/chat',chatRoutes);
app.get('/',(req,res)=>{
    res.send('API is running');
})

const start =async ()=>
{
    await connectDB();
    app.listen(PORT, ()=>{
        console.log(`server listening on port ${PORT}`)
    })
}
start();