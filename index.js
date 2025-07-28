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

function findFirstIsbn(docs) {
  for (const doc of docs) {
    if (doc.ia && Array.isArray(doc.ia)) {
      for (const item of doc.ia) {
        if (item.startsWith("isbn_")) {
          return item; // return the ISBN string when found
        }
      }
    }
  }
  return null; // no ISBN found
}

app.post('/new', async (req, res) => {
    const input = req.body;
    const result = await fetch(API_address + input.title);
    const data = await result.json();

    const match = findFirstIsbn(data.docs);
    
    // console.log(match);
    let isbn = match.replace('isbn_', '');
    const cover = API_address_covers + isbn + '.jpg';
    // console.log(cover);

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