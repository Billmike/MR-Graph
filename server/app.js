import express from 'express';
import graphQLHTTP from 'express-graphql'
import schema from './schema';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config()

const app = express();

mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ds119161.mlab.com:19161/mrgql`);
mongoose.connection.once('open', () => {
  console.log('Connected to Database')
})

app.use('/mrgraphql', graphQLHTTP({
  schema,
  graphiql: true
}))

app.listen(5000, () => {
  console.log('Connected to the Server');
})
