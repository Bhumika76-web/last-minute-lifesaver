const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health',(req,res) => {
    res.json({status: 'Backend is running!'});
});

app.post('/api/prioritize',(req,res) =>{
    res.json({message: 'AI prioritization coming soon'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`Backend running on https://localhost:${PORT}`);
});