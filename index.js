require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns').promises;
const urlparser = require('url');
const { url } = require('inspector');

MONGO_URI='mongodb+srv://jesujimenezochoa:8fZgYpiFRu1N9OZW@cluster0.tymqd.mongodb.net/urls?retryWrites=true&w=majority&appName=Cluster0'
console.log('Mongo URI archivo:', MONGO_URI)


const client = new MongoClient(MONGO_URI);
const database = client.db('urlshortener');
const urls = database.collection('urls');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

//My app
/* app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  const fullurl = req.body.url;
  const dnslookup = dns.lookup(urlparser.(url.parse()).hostname, {
    async (err, address) => {
      if (!address) {
        res.json({error: 'invalid URL'})
      } else {
        const cuentaURL = await urls.countDocuments({})
        const urlDoc = {
          fullurl,
          short_url: cuentaURL
        }

        const result = await urls.insertOne(urlDoc)
        console.log(result);
        res.json({original_url: fullurl, short_url: cuentaURL})
      }
    }
  })
  res.json({greeting: 'post response'});
}) */

app.post('/api/shorturl', async function(req, res) {
  try {
    console.log(req.body);
    const fullurl = req.body.url;
    if (!fullurl) {
      return res.json({ error: 'No URL provided' });
    }

    const hostname = urlparser.parse(fullurl).hostname;
    if (!hostname) {
      return res.json({ error: 'invalid URL' });
    }

    // Lookup con promises
    const { address } = await dns.lookup(hostname);
    if (!address) {
      return res.json({ error: 'invalid URL' });
    }

    // URL "válida" (según DNS) => Insertar en DB
    const cuentaURL = await urls.countDocuments({});
    const urlDoc = {
      fullurl,
      short_url: cuentaURL
    };

    const result = await urls.insertOne(urlDoc);
    console.log('Insert result:', result);

    return res.json({
      original_url: fullurl,
      short_url: cuentaURL
    });
  } catch (err) {
    // Si dns.lookup falla, capturamos error
    console.error(err);
    return res.json({ error: 'invalid URL' });
  }
});

app.get('/api/shorturl/:shortUrl', function(req, res) {
  try {
    const shortUrl = parseInt(req.params.shortUrl, 10);
    const formula = async () => {
      const doc = await urls.findOne({short_url: shortUrl});
      if (!doc) {
        return res.json({error: 'No short url found'});
      }

      return res.redirect(doc.fullurl);
    }

    formula();
  } catch (err) {
    return res.json({error: 'Error fetching fullurl'})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
