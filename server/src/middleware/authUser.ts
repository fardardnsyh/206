import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/user.model';
import logger from '../utils/logger';
import config from '../config';

export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  logger.info(authHeader);
  const token = authHeader.replace(/^Bearer\s/, '');
  const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

  logger.info(JSON.stringify(decoded));

  // TODO: get / access custom data: email, id etc. ?
  const user = await User.findOne<UserDocument>({ _id: decoded.sub });
  if (!user) {
    return res.sendStatus(401); // unsure of return code as jwt valid, but no matching user in db
  }

  // // if current user does not own requested users resource then return unautherized
  // if (req.params.userId && req.params.userId !== user.id) {
  //   return res.sendStatus(401);
  // }

  // add ObjectId to req.user object
  req.user = user;

  return next();
};

