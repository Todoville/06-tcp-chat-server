'use strict';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './logger';
import characterRouter from '../router/characterRouter';
import specialsRouter from '../router/specialsRouter';

import errorMiddleWare from '../lib/middleware/error-middleware';
import loggerMiddleWare from '../lib/middleware/logger-middleware';

const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(loggerMiddleWare);
app.use(characterRouter);
app.use(specialsRouter);
app.use(errorMiddleWare);

app.all('*', (request, response) => {
  console.log('Returning a 404 from the catch/all route');
  return response.sendStatus(404).send('ayo ya ding dong that route ain\'t registered');
});

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      server = app.listen(PORT, () => {
        console.log('yeet got that server', PORT);
      });
    })
    .catch((err) => {
      throw err;
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close(() => {
        logger.log(logger.INFO, 'Server is off my duderino');
      });
    })
    .catch((err) => {
      throw err;
    });
};

export { startServer, stopServer };
