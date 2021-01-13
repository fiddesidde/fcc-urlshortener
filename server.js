require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dnsPromises = dns.promises;

let urlList = [];

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', async (req, res) => {
    const submittedUrl = req.body.url;
    const hostname = submittedUrl
        .replace(/[a-zA-Z]+\:\/\//, '')
        .replace(/\/(.+)?/, '');
    try {
        const real = await dnsPromises.lookup(hostname, 4);
        urlList.push(submittedUrl);
        const short = urlList.indexOf(submittedUrl);
        res.json({ original_url: submittedUrl, short_url: short });
    } catch (error) {
        console.error(error);
        return res.json({ error: 'invalid url' });
    }
});

app.get('/api/shorturl/:id', async (req, res) => {
    const { id } = req.params;
    const adress = urlList[id];
    res.status(301).redirect(adress);
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
