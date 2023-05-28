# Test your dgraph schema

See full repo at [dgraph schema testing auth rules](https://github.com/yellowmachine/ika-example-dgraph.git)

# sveltekit app with dgraph backend

`npm run dev` to start sveltekit server and code your frontend. Let's see the testing side in dgraph folder:

`./dgraph/index.js`

```js
// a pipeline that whatches to changes in folder tests and schema, then executes test task
const {compile} = require("ypipe")
const { w } = require("ypipe-watch");
const npm = require('npm-commands')
const {dgraph} = require('ypipe-dgraph')
const config = require("./config")

/* config.js
module.exports = {
    schema: __dirname + "/schema/schema.js",
    url: "http://db",
    port: "8080",
    claims: "https://my.app.io/jwt/claims",
    secret: "secret",
    schemaFooter: (c) => `# Dgraph.Authorization {"VerificationKey":"${c.secret}","Header":"Authorization","Namespace":"${c.claims}","Algo":"HS256","Audience":["aud1","aud5"]}`
}
*/

function test(){
    npm().run('tap');
}

const dql = dgraph(config) // just send a schema to database

async function main() {
    const t = `w'[ dql? | test ]`; // pipeline expression, see ypipe
    const f = compile(t, {
                            namespace: {dql, test}, 
                            plugins: {w: w(["./tests/*.js", "./schema/*.*"])}
        });
    await f();
}

main()
```

The pipeline is based on [ypipe](https://github.com/yellowmachine/ypipe)
(Disclaimer, I'm the author of [ypipe](https://github.com/yellowmachine/ypipe))

```json
"scripts": {
    "print": "node print.js",
    "test": "node index.js",
    "tap": "tap --no-coverage-report --no-check-coverage ./tests/*.test.js"
  },
```

`./dgraph/schema/schema.js`

```js
const { quote, gql } = require('ypipe-dgraph')

const ADMIN = quote("ADMIN")

// it's js so you can do whatever you want and return a gql expression in module.exports. Soon typescript
module.exports = gql`
type Job @auth(
    query: {
        rule:  "{$ROLE: { eq: ${ADMIN} } }" 
    }
){
    id: ID!
    title: String!
    completed: Boolean!
    command: String!
}
`
```

`./dgraph/test/1.test.js`

```js
const tap = require('tap')
const { dropData, client, gql} = require('ypipe-dgraph')
const config = require("../config")

SETUP = gql`
mutation MyMutation {
  addJob(input: {title: "send mails", completed: false, command: "mail ..."}){
    job{
      id
    }
  }
}
`
QUERY = gql`
query MyQuery {
  queryJob {
    id
    title
    completed
  }
}
`

tap.beforeEach(async () => {
  await dropData(config)
});

tap.test('wow!', async (t) => {
    await client({ROLE: 'ADMIN'}, config).request(SETUP)
    let response = await client({ROLE: 'NONO'}, config).request(QUERY)
    t.equal(response.queryJob.length, 0)
});
```

```bash
cd dgraph
npm run test
```

The test is very simple, just adding data with the Role ADMIN and then query with other role, and there's a rule about role ADMIN so we get 0 rows of result.

You can change either test files in test or schema folder, and tests are run automatically. If there're errors in either schema syntax or js test files, it's shown in the console. Just fix the code and tests are run automatically.

Result in console:

```bash
root@0eb5d7e51726:/project/dgraph# npm run test

> test@1.0.0 test
> node index.js


type Job @auth(
    query: {
        rule:  "{$ROLE: { eq: \"ADMIN\" } }" 
    }
){
    id: ID!
    title: String!
    completed: Boolean!
    command: String!
}
# Dgraph.Authorization {"VerificationKey":"secret","Header":"Authorization","Namespace":"https://my.app.io/jwt/claims","Algo":"HS256","Audience":["aud1","aud5"]}

> test@1.0.0 tap
> tap --no-coverage-report --no-check-coverage ./tests/*.test.js

​ PASS ​ ./tests/1.test.js 1 OK 152.562ms


                         
  🌈 SUMMARY RESULTS 🌈  
                         

Suites:   ​1 passed​, ​1 of 1 completed​
Asserts:  ​​​1 passed​, ​of 1​
​Time:​   ​513.885ms​
Press q to quit!

```

If you want to use plain graphql:

`schema.graphql` // you can do simple splitting, see #include some graphql file

```graphql
#include enum.graphql

type Job @auth(
    query: {
        rule:  "{$ROLE: { eq: \"ADMIN\" } }" 
    }
){
    id: ID!
    title: String!
    completed: Boolean!
    command: String!
}
```

`enum.graphql` 

```graphql
enum Role {
  ADMIN
  DEVELOPER
}
```

You have to set this in `config.js`:

```js
module.exports = {
    schema: __dirname + "/schema/schema.js", // js or graphql
    url: "http://db",  // where is database 
    port: "8080",      // port database is listening to
    claims: "https://my.app.io/jwt/claims",
    secret: "secret",
    schemaFooter: (c) => `# Dgraph.Authorization {"VerificationKey":"${c.secret}","Header":"Authorization","Namespace":"${c.claims}","Algo":"HS256","Audience":["aud1","aud5"]}`
}
```

`npm run print` will print to console full schema.

Result: 

```bash
root@0eb5d7e51726:/project/dgraph# npm run print

> test@1.0.0 print
> node print.js


type Job @auth(
    query: {
        rule:  "{$ROLE: { eq: \"ADMIN\" } }" 
    }
){
    id: ID!
    title: String!
    completed: Boolean!
    command: String!
}
```