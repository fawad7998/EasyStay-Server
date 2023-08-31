const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');

const v1 = require('./apiVersions/v1');

const app = express();
app.use(express.json());
app.use(
  cors({
    exposedHeaders: [config.get('tokenVariable')],
  })
);
app.use(bodyParser.urlencoded({extended: true}));

v1.prepareV1Routes(app);

// All other GET requests not handled before will return simple HTML
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(
    '<html><body><h1>This is a server for <a href="https://simpler-dispatch.vercel.app/">Simpler Dispatch App</></a></h1></body></html>'
  );
});

module.exports = app;
