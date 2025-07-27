import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Capstone",
    password: "123",
    port: 5432,
});

db.connect();

const API_address = "https://openlibrary.org/search.json?q="

app.post('/new', async (req, res) => {
    const input = req.body.query;
    const result = await fetch(API_address + input);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});