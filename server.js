'use strict';

// App dependecies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

const methodOverride = require('method-override');

// App Setup
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

//app middleware

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('./public'));

app.get('/', getBook);
app.post('/books', addBook);
app.get('/books/:id', getOneBook);
app.delete('/delete/:book_id', deleteBook);
app.post('/searches', searchResults);
app.get('/searches/new', bookSearch);
// app.put('/update/:book_id', updateBook);


//.....................Initial Book Search function ........................//
function searchResults(request, response) {
  console.log('in search results function');
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log(request.body);
  console.log(request.body.search);
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthors:${request.body.search[0]}`; }
  console.log(url);
  try{
    superagent.get(url)
      .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
      .then(results => response.render('pages/searches/show', { searchResults: results }));
  } catch(err) {
    response.render('pages/error', {err: err});
  }
}

//.....................Book Search function ........................//
function bookSearch(req, res) {
  res.status(200).render('pages/searches/new');
}


//.....................Add Book function ........................//
function addBook(req, res) {
  console.log(req.body);
  let {title, description, authors, isbn, bookshelf, image_url} = req.body;
  let values = [title, description, authors, isbn, bookshelf, image_url];
  let SQL = 'INSERT INTO books(title, description, authors, isbn, bookshelf, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';

  return client.query(SQL, values)
    .then((results) => {
      console.log(results.rows);
      res.redirect('/');
    })
    .catch(err => handleError(err, res));
}


//.....................Select Book From Database function ........................//
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


//.....................Get Book function.........................//
function getBook(req , res) {
  console.log('start function');
  let SQL = 'SELECT * FROM books';
  client.query(SQL)
    .then(results => {
      console.log('results', results);
      res.render('pages/index.ejs', { books: results.rows});
    });
}



//..................Update Book..................//
// function updateBook(req, res) {
//   let values = req.params.book_id;
//   let { title, description, authors, isbn, bookshelf, image_url } = req.body;
//   let SQL = `UPDATE bookApp SET title=$1, description=$2, authors=$3, isbn=$4, bookshelf=$5 WHERE id=$6;`;
//   let safeValue = [title, description, authors, isbn, bookshelf, image_url];

//   return client.query(SQL, safeValue)
//     .then(() => res.redirect(`/books/${values}`))
//     .catch(err => handleError(err, res));
// }


//.....................Delete Book .............................//
function deleteBook(req, res) {
  let SQL = 'DELETE FROM books where id=$1;';
  let values = [req.params.book_id];
  return client.query(SQL,values)
    .then(res.redirect('/'));
}


//.....................Constructor Function .............................//
function Book(data){
  this.authors = data.authors || 'no author listed';
  this.title = data.title || 'no title listed';
  this.isbn = data.industryIdentifiers ? `${data.industryIdentifiers[0].type}: ${data.industryIdentifiers[0].identifier} ` : 'no ISBN available';
  this.image_url = data.imageLinks.smallThumbnail.replace('http://', 'https://') || 'Jordan says there is no image for you.';
  this.description = data.description || 'no description';
}


//.....................Error Handler .............................//
function handleError(error, res) {
  res.render('pages/error', {error: error});
}

app.get('*', (request, response) => response.status(404).send('This route does not exist'));


//.....................Connection to Client .............................//
client.connect()
  .then(() => {
    app.listen(process.env.PORT, () => console.log(process.env.PORT));
  });

