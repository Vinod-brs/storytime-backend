import express from "express";
import dotenv from 'dotenv';
import connectDB from "./src/config/db.js";
import { notFoud, errHandler } from "./src/middleware/errMiddleware.js";
import languageRoute from "./src/routes/languageRoute.js";
import categoryRoute from "./src/routes/categoryRoute.js";
import userRoute from "./src/routes/userRoute.js";
import cors from "cors";


dotenv.config();
connectDB();


const Port = 5000;

const app = express()
app.use(cors())

app.get('/', (req, res) => {
   
        res.send("Storytime Backend")
    
    
});


app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use('/api/languages', languageRoute)
app.use('/api/categories', categoryRoute)
app.use('/api/users', userRoute)


app.use(notFoud)
app.use(errHandler)

app.listen(Port, console.log(`Server started on Port ${Port}`))

