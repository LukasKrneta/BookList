import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Capstone",
    password: "123",
    port: 5432,
});

db.connect();

const API_address = "https://openlibrary.org/search.json?q="
const API_address_covers = "https://covers.openlibrary.org/b/isbn/"

// covers ne radi

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/new', async (req, res) => {
    const input = req.body;
    const result = await fetch(API_address + input.title);
    const data = await result.json();
    const docs = data.docs;
    let isbn = null;
    data.docs.forEach(doc => {
      if (doc.ia) {
        doc.ia.forEach(item => {
          if (item.startsWith("isbn_")) {
            isbn = item.replace('isbn_', '');
          }
        });
      }
    });
    const cover = API_address_covers + isbn + '.jpg';

    res.render('index', {
      title: input.title,
      author: data.docs[0].author_name[0],
      notes: input.notes,
      date: input.date,
      cover: cover
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});