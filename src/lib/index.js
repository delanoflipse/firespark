const path = require('path');
const express = require('express');
const app = express();

const port = process.argv.length > 2 ? process.argv[2] : 80;
const DIR = process.env.NODE_PATH || __dirname;

app.use('/', express.static(path.join(DIR, 'frontend')));

app.listen(port, () => {
    console.log("server started on port", port);
});