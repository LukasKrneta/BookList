import express from "express";
import pg from "pg";
import path from "path";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "123",
    port: 5432,
});

db.connect();

app.use('/', async (req, res) => {
    res.sendFile("index.html");
});