import express from 'express';
import cors from 'cors';
import { adminRouter } from './Routes/AdminRoute.js';
import bodyParser from 'body-parser';
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin:["http://localhost:5173"],
    methods:['GET', 'POST', 'PUT', "DELETE"],
    credentials:true
}))
app.use('/',adminRouter)
// app.use(express.static('Public'))
app.use("/public", express.static("Public"))


app.listen(3000,() =>{
    console.log("server is running on port 3000")
})