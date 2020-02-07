'use strict';

// App dependecies
const express = require('express');
const superagent = require('superagent');

// App Setup
const app = express();
const PORT = process.env.PORT || 3000;

//app middleware

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/search', (req, res) => {
  res.status(200).send('You did a GET!');
});

app.listen(3000, () => console.log('Jordan was HERE'));
