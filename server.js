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

app.post('/searches', (req, res) => {
  console.log(req.body);
  res.render('pages/searches/show');
  // res.status(200).send('New!');
});


app.get('/search', (req, res) => {
  res.status(200).send('You did a GET!');
});

app.listen(3000, () => console.log('Jordan was HERE'));
