
const path = require('path');
const express = require("express");
const mysql = require("mysql");
// loads env variables from a .env file into process.env
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// require('./.env').config(); 
dotenv.config({path:'./.env'});

const app = express();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Parse URL-encoded bodies (as sent by HTML forms)
// Makes sure you can grab the from any forms
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// Initializing cookieParser so we can setup cookies on our browser
app.use(cookieParser());

app.set('view engine', 'hbs');

db.connect((error)=>{
    if(error){
        console.log(error);
    } else {
        console.log("MYSQL Connected...")
    }
});

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(3000, () =>{
    console.log("Listeing on port 3000.")
});