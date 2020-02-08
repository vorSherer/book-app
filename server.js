'use strict';

// App dependecies
const express = require('express');
const superagent = require('superagent');

// App Setup
const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');

//app middleware

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.render('pages/index');
  // res.status(200).send('Home Page!');
});

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.post('/searches', searchResults);

app.get('/search', (req, res) => {
  res.status(200).send('You did a GET!');
});

//Constractor Function

function Book(data){
  this.title = data.title || 'null title';
  this.authors = data.authors || 'null potato';
  this.description = data.description || 'no description';
  this.smallThumbnail = data.imageLinks.smallThumbnail.replace('http://', 'https://') || 'Jordan says there is no image for you.';
}

// .replace('http://', 'https://') || placeHolderImage
//constructor helper function
function searchResults(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log(request.body);
  console.log(request.body.search);
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log(url);
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }));
  // how will we handle errors?
}

app.get('*', (request, response) => response.status(404).send('This route does not exist'));
app.listen(PORT, () => console.log('Jordan was HERE'));
