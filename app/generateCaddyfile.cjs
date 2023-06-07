const domains = require('./src/domains.json')
console.log(process.env)
const domain = process.env.npm_config_domain;

console.log(`
app.${domain} {

    reverse_proxy 127.0.0.1:3000

}
`)

Object.entries(domains).forEach(([port, subdomain])=>{
    console.log(
`${subdomain}.${domain}  {

    reverse_proxy 127.0.0.1:${port}
        
}        
`)
})

