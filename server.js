'use strict';

// App dependecies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// App Setup
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

//app middleware

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

app.post('/searches', searchResults);
app.get('/', getBook);
app.get('/books/:id', getOneBook);
app.post('/books', addBook);
app.put('/update/:book_id', updateBook)
app.delete('/delete/:book_id', deleteBook)

app.get('/searches/new', bookSearch);


// app.post('/books/show', )

// function addDatabase(req, res)

// app.post('/tasks/', (req, res) => {
//   res.send('created task')
// });

// app.put('/task/:id', (req, res) => {
//   res.send('updated')
// });

// app.delete('/task/:id', (req, res) => {
//   res.send('Deleete')
// });

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.get('/search', (req, res) => {
  res.status(200).send('You did a GET!');
});
function addBook(req, res) {
  console.log(req.body)
  let {title, description, authors,ISBN, bookshelf, image_url} = req.body;

  let SQL = 'INSERT INTO books(title, description, authors, ISBN, bookshelf, image_url) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [title, description, authors, ISBN, bookshelf, image_url];

  return client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(err => handleError(err, res));
}

//.....................Book Search function ........................//
function bookSearch(req, res) {
  res.status(200).render('./pages/searches/new');
}

//Add book

//..................Update Book..................//
function updateBook(req, res) {
  let values = req.params.book_id;
  let { title, description, authors, ISBN, bookshelf, image_url } = request.body;
  let SQL = `UPDATE bookApp SET title=$1, description=$2, authors=$3, ISBN=$4, bookshelf=$5 WHERE id=$6;`;
  let safeValue = [title, description, authors, ISBN, bookshelf, image_url];

  return client.query(SQL, safeValue)
    .then(res.redirect(`/books/${values}`))
    .catch(err => errorHandler(err, res));
}

//.....................Delete Book .............................//
function deleteBook(req, res) {
  let SQL = 'DELETE FROM bookApp where id=$1;';
  let values = [req.params.book_id];
  return client.query(SQL,values)
    .then(res.redirect('/'))
}


function getOneBook(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1';
  let values = [req.params.id];

// console.log('values', req.params.id);
   client.query(SQL, values)
  .then(results => {
    console.log('results', results.rows);
    res.render('pages/books/detail.ejs' , {book: results.rows[0]});
    
  })
  .catch(err => handleError(err, res));
}


//Constructor Function

function handleError(error, res) {
  res.render('pages/error', {error: 'You are Wrong'})
}


// .replace('http://', 'https://') || placeHolderImage
//constructor helper function

function Book(data){
  this.title = data.title || 'null title';
  this.authors = data.authors || 'null potato';
  this.description = data.description || 'no description';
  this.smallThumbnail = data.imageLinks.smallThumbnail.replace('http://', 'https://') || 'Jordan says there is no image for you.';
}
//Get Book function
function getBook(req , res) {
  console.log('start function');
  let SQL = 'SELECT * FROM books';
  client.query(SQL)
    .then(results => {
      console.log('results', results);
      res.render('pages/index.ejs', { books: results.rows});
    });
}


function searchResults(request, response) {
  console.log('in search results function');
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log(request.body);
  console.log(request.body.search);
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log(url);
  try{
    superagent.get(url)
      .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
      .then(results => response.render('pages/searches/show', { searchResults: results }));
  } catch(err) {
    response.render('pages/error', {err: err});
  }
  // how will we handle errors?
}


app.get('*', (request, response) => response.status(404).send('This route does not exist'));

client.connect()
  .then(() => {
    app.listen(process.env.PORT, () => console.log(process.env.PORT));
  });

