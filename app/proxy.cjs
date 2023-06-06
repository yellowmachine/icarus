const _domains = require('./src/domains.json')

const flip = (data) => Object.fromEntries(
  Object
    .entries(data)
    .map(([key, value]) => [value, key])
  );

const domains = flip(_domains)

const customResolver1 = function(host, url, req) {
  const subdomain = host.split('.')[0]
  const port = domains[subdomain]

  return `http://127.0.0.1:${port}`
};

customResolver1.priority = 100;

const proxy = new require('redbird')({
   port: 3001,
   resolvers: [
    customResolver1,
   ]
})
