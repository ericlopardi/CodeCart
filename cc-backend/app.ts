import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// delete this roy

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on Port ${port}`);
})