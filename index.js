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

// napravi error handling i te pm

const API_address = "https://openlibrary.org/search.json?q="
const API_address_covers = "https://covers.openlibrary.org/b/isbn/"

app.get('/', async (req, res) => {
  try{
    const selectQuery = await db.query('SELECT * FROM books');
    res.render('index.ejs', {
      pastList: selectQuery.rows
  });
  } catch(err) {
    console.error('Database error:', err.message);
    res.status(500).send('Server error while fetching books');
  }
});

app.post('/sort', async (req, res) => {
  const sortColumn = req.body.sort;
  if(sortColumn !== 'rating' && sortColumn !== 'date_read'){
    return res.status(400).send('Invalid column names');
  }
  try{
    const sortQuery = await db.query(`SELECT * FROM books ORDER BY ${sortColumn} DESC`);
  res.render('index.ejs', {
    pastList: sortQuery.rows
  });
  } catch(err) {
    console.error('Database error:', err.message);
    res.status(500).send('Server error while fetching sorted books');
  }
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

  if (!input.title) {
    return res.status(400).send('Missing required field: title');
  }
  if (!input.notes) {
    return res.status(400).send('Missing required field: notes');
  }
  if (!input.rating) {
    return res.status(400).send('Missing required field: rating');
  }
  if (!input.date) {
    return res.status(400).send('Missing required field: date');
  }
    try{
      const result = await fetch(API_address + input.title);

      if(!result.ok){
        return res.status(500).send('Internal server error');
      }

      const data = await result.json();

      if (!data.docs || data.docs.length === 0) {
      return res.status(404).send('No book data found for that title');
      }

      const match = findFirstIsbn(data.docs);

      if (!match) {
        return res.status(404).send('No ISBN found for the book');
      }
      
      let isbn = match.replace('isbn_', '');
      const cover = API_address_covers + isbn + '.jpg';

      await db.query('INSERT INTO books(title, notes, rating, author, date_read, cover) VALUES ($1, $2, $3, $4, $5, $6)', 
        [input.title, input.notes, input.rating, data.docs[0].author_name[0], input.date, cover]);

      res.redirect('/');
  } catch(err) {
    console.error('Database error:', err.message);
    res.status(500).send('Internal server error');
  }
});

app.get('/edit/:id', async (req, res) => {
  const item = req.params.id;
  try{
      const selectQuery = await db.query('SELECT * FROM books WHERE id = $1', 
    [item]);

  res.render('edit.ejs', {
    list: selectQuery.rows[0]
  });
  } catch(err) {
    console.error('Database error:', err.message);
    res.status(500).send('Server error while fetching book info');
  }
  });

app.post('/edit/:id', async (req, res) => {
  const input = req.body;
    try{
      await db.query('UPDATE books SET notes = $1, rating = $2, date_read = $3 WHERE id = $4', [input.notes, input.rating, input.date, req.params.id]);

      res.redirect('/');
  } catch(err) {
    console.error('Database error:', err.message);
    res.status(500).send('Server error while updating the book');
  }
  });

app.get('/delete/:id', async (req, res) => {
  const input = req.params.id;
    try{
      await db.query('DELETE FROM books WHERE id = $1', 
    [input]);

  res.redirect('/');
  } catch(err) {
    console.error('Database error:', err.message);
    res.status(500).send('Server error while deleting book');
  }
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});