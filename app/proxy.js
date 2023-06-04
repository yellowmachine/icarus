const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const _domains = require('./src/domains.json')

const app = express();

const flip = (data) => Object.fromEntries(
    Object
      .entries(data)
      .map(([key, value]) => [value, key])
    );


const domains = flip(_domains)

/** @type {import('http-proxy-middleware/dist/types').Options} */
const options = {
    target: 'http://localhost',
    changeOrigin: true, 
    ws: true,
    router: function(req) {
        const subdomain = req.subdomains[0]
        const port = domains[subdomain]
        return {
                protocol: 'http:',
                host: 'localhost',
                port: parseInt(port)
            };
        }  
  };

app.use('/', createProxyMiddleware(options));

//module.exports = app
app.listen(3001)