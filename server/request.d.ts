/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import * as express from 'express';
import { UserDocument } from './src/models/user.model';

declare module 'express' {
  interface Request {
    cookies?: { [key: string]: string };
    user?: UserDocument;
  }
}

