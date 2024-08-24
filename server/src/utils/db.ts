import mongoose from 'mongoose';
import config from '../config';
import logger from './logger';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connect = async () => {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const conn = await mongoose.connect(config.MONGODB_URI);

      logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (err: unknown) {
      logger.error('Could not connect to MongoDB');
      process.exit(1);
    }
  }
};

// NOTE: this function does not need to be awaited on in the main server file
// e.g. server.listen() does not need to wait for mongoose
// however, as it is async it must be awaited (with the await) keyword in the server file.
// This triggers the ts-no-floating-promises error as it is not handled in the server file.
// Therefore it is called with the void keyword in the server file,
// telling typescript to ignore the return type of the promise and continue executing the rest of the server file.
// Alternatively I could use a standard .then().catch() in the connectDB function.
// I'm unsure which is the correct / best approach.

let mongoServer: MongoMemoryServer;

const testServer = {
  start: async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw Error('Mongo memory server should be used in api testing only');
    }
    // start mongo memory server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    logger.info(`Connected to Mongo memory server: ${uri}`);
  },

  stop: async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw Error('Mongo memory server should be used in api testing only');
    }
    // stop mongo memeory server
    if (mongoServer) {
      await mongoServer.stop();

      // close all connections in parallel
      await mongoose.disconnect();
      logger.info('Mongo memory server disconnected');
    }
  },
};

export default {
  connect,
  testServer,
};

// from https://fadamakis.com/express-mongo-application-architecture-and-folder-structure-1f95274c28fe
// NOTE: in this example the connectDB function is NOT async, but it uses a try/catch to ONLY connect,
// and in .error() log the error and process.exit(1)
// the messages are then displayed using mongoose.connection.on('open', () => console.log('connected'))
// and .on('error) etc.

