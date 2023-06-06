const domains = require('./src/domains.json')

console.log(`
app.yellowdev.fun {

    reverse_proxy 127.0.0.1:3000

}
`)

Object.entries(domains).forEach(([port, subdomain])=>{
    console.log(
`${subdomain}.yellowdev.fun  {

    reverse_proxy 127.0.0.1:${port}
        
}        
`)
})

