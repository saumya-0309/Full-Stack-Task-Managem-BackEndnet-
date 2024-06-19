import express from 'express';
import mysql from 'mysql';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret:'secret',// a secret key used to encrypt the session cookie
    resave : false,
    saveUninitialized:false,
    cookie:{
        secure: false,
        maxAge: 1000 * 60  *60 * 24 * 7
    }
}))

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'somu0309',
    database: 'taskmanager'
})

con.connect(function(err){
    if(err){
        console.log("connection error")
    } else{
        console.log("connection successful")
    }
})

export default con;