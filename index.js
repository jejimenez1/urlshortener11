require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

MONGO_URI:'mongodb+srv://jesujimenezochoa:8fZgYpiFRu1N9OZW@cluster0.tymqd.mongodb.net/urls?retryWrites=true&w=majority&appName=Cluster0'
console.log('Mongo URI archivo:', MONGO_URI)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/hallo', function(req, res) {
  res.json({ greeting: 'hallo API' });
});

console.log('mongo uri:', process.env.MONGO_URI);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
