const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const isAuth = require('./middlewares/is-Auth');

const app = express();

app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
      return res.sendStatus(200);
    }
    next();
  });

app.use(isAuth)

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if(!err.originalError){
        return err;
      }
  
      const data = err.originalError.data;
      const message = err.message || 'An error!'
      const code = err.originalError.statusCode || 500;
      return {message: message, data: data, status: code};
    }
}))

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb://localhost:27017/Mall', { useNewUrlParser: true }
  )
  .then(() => {
    const server = app.listen(8080);
  })
  .catch(err => console.log(err));