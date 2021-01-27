/* eslint-disable import/first */
import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import session from 'express-session';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { graphqlUploadExpress } from 'graphql-upload';
import fs from 'fs';
import path from 'path';

dotenv.config();

import {
  COOKIE_NAME,
  __prod__,
  COOKIE_SECRET,
  COOKIE_AGE,
  PORT,
} from './constants';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { MyContext } from './types';
import { PostLikeResolver } from './resolvers/likes';
import { postcreatorLoader } from './Loaders/PostCreatorLoader';
import { userPostLikedLoader } from './Loaders/UserPostLikedLoader';
import { numberOfLikedLoader } from './Loaders/NumberOfLikesLoader';

const main = async () => {
  const publicPath = path.resolve(__dirname, '..', 'public');
  const imagePath = path.resolve(publicPath, 'images');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath);
  }
  const conn = await createConnection();
  conn.runMigrations();
  const app = express();
  app.use(express.static(publicPath));
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  app.use(session({
    name: COOKIE_NAME,
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: COOKIE_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: __prod__,
    },
  }));

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 4e+6, maxFiles: 1 }),
  );

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  const apolloServer = new ApolloServer({
    uploads: false,
    playground: false,
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        PostResolver,
        PostLikeResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }: MyContext) => ({
      req,
      res,
      userLoader: postcreatorLoader(),
      userLikedLoader: userPostLikedLoader(),
      numberOfLikedLoader: numberOfLikedLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server Started on Port ${PORT} 🚀`);
  });
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
