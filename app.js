import express from "express";
import dotenv from 'dotenv';
import connectDB from "./src/config/db.js";
import { notFoud, errHandler } from "./src/middleware/errMiddleware.js";
import languageRoute from "./src/routes/languageRoute.js";
import catagoryRoute from "./src/routes/categoryRoute.js";
import userRoute from "./src/routes/userRoute.js";


dotenv.config();
connectDB();


const Port = 5000;

const app = express()


app.get('/', (req, res) => {
   
        res.send("Hello World")
    
    
});


app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use('/api/languages', languageRoute)
app.use('/api/catagories', catagoryRoute)
app.use('/api/users', userRoute)


app.use(notFoud)
app.use(errHandler)

app.listen(Port, console.log(`Server started on Port ${Port}`))

