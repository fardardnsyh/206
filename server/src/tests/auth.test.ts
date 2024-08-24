// TODO: unify error handler messages, e.g. so that all bring back an object with { error: 'message' },
// and possibly also { code: 'invalid_type' } etc ?
// TODO: refactor tests, with util functions for setups ?

import supertest from 'supertest';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import db from '../utils/db';
import app from '../app';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import config from '../config';

const api = supertest(app);

beforeAll(async () => {
  await db.testServer.start();

  // create test user
  const pwd = await bcrypt.hash('Password123', 10);
  await User.create({
    name: 'Sherlock Holmes',
    email: 'sherlock@baker-st.com',
    passwordHash: pwd,
    address: {
      line1: '22B Baker St',
      line2: 'Marylebone',
      city: 'London',
      postcode: 'NW1 6XE',
    },
  });
});

afterAll(async () => {
  await db.testServer.stop();
});

describe('auth', () => {
  let refreshCookie: Array<string> = [];
  let accessToken = '';
  let userData = {};

  beforeAll(async () => {
    const user = await User.findOne({ email: 'sherlock@baker-st.com' });
    userData = {
      email: user?.email,
      id: user?.id,
      sub: user?.id,
    };
  });

  describe('POST /auth/login', () => {
    // TODO: payload error messages from zod -- working but not checking each individual case,
    // as if slips through it will just fail with unauthorized if credentials incorrect
    it('logging in with missing email errors: 400', async () => {
      const res = await api
        .post('/auth/login')
        .send({
          password: 'Password123',
        })
        .expect(400);

      expect(res.body.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'invalid_type' }),
        ])
      );
    });

    it('logging in with missing password errors: 400', async () => {
      const res = await api
        .post('/auth/login')
        .send({
          email: 'Sherlock@baker-st.com',
        })
        .expect(400);

      expect(res.body.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'invalid_type' }),
        ])
      );
    });

    it('logging in with incorrect credentials errors: 401 Unauthorized', async () => {
      const res = await api
        .post('/auth/login')
        .send({
          email: 'incorrect-email@email.com',
          password: 'incorrect_password',
        })
        .expect(401);

      expect(res.body).toEqual({ error: 'Invalid email or password' });
    });

    it('authenticated route cannot be accessed if user is not logged in: 401 Unauthorized', async () => {
      await api.get('/api/invoices').expect(401);
    });

    it('authenticated route cannot be accessed if access token has expired', async () => {
      const expiredAccessToken = jwt.sign(
        userData,
        config.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '0s',
        }
      );

      const res = await api
        .get('/api/invoices')
        .set('Authorization', `Bearer ${expiredAccessToken}`)
        .expect(403);

      expect(res.body).toEqual({ message: 'jwt expired' });
    });

    it('user can login with correct email and password', async () => {
      const res = await api
        .post('/auth/login')
        .send({
          email: 'sherlock@baker-st.com',
          password: 'Password123',
        })
        .expect(200)
        .expect('content-type', /application\/json/);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
      });

      // set refresh and access tokens for use in further tests
      // TODO: should this be done in beforeAll ?
      refreshCookie = res.get('Set-Cookie');
      console.log('login - refreshCookie', refreshCookie);
      accessToken = res.body.accessToken;

      expect(res.get('Set-Cookie')).toBeDefined();
    });

    it('user can access authenticated route once logged in', async () => {
      await api
        .get('/api/invoices')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('logging in with refresh cookie present issues a new refresh cookie', async () => {
      const res = await api
        .post('/auth/login')
        .set('Cookie', refreshCookie)
        .send({
          email: 'sherlock@baker-st.com',
          password: 'Password123',
        })
        .expect(200);

      expect(res.get('Set-Cookie')).toHaveLength(2);
      expect(res.get('Set-Cookie')).to.not.contain(refreshCookie);
    });

    it('request detects refresh cookie re-use and deletes all old refresh tokens from user record', async () => {
      const res = await api
        .post('/auth/login')
        .set('Cookie', refreshCookie)
        .send({
          email: 'sherlock@baker-st.com',
          password: 'Password123',
        })
        .expect(200);

      const user = await User.findOne({ email: 'sherlock@baker-st.com' });
      expect(res.get('Set-Cookie')).to.not.contain(refreshCookie);

      // get second jwt cookie, as first is a empty jwt cookie to delete last cookie
      const cookie = res.get('Set-Cookie')[1]!;

      // extract the jwt from the cookie string with regex
      const match = /jwt=([^;\s]+)/.exec(cookie);

      // get second index from match as first contains 'jwt='
      const currentValidRefreshToken = match![1];

      // test that user record only contains one refresh token,
      // that is the current (just-issued) token
      expect(user?.refreshToken).toHaveLength(1);
      expect(user?.refreshToken).toEqual([currentValidRefreshToken]);
    });
  });

  describe('GET /auth/refresh', () => {
    it('request without a refresh cookie errors: 401', async () => {
      const res = await api.get('/auth/refresh').expect(401);

      expect(res.get('Set-Cookie')).not.toBeDefined();
    });

    it('request with a valid refresh token can be issued a new one', async () => {
      // login again to get valid refreshCookie
      const newLogin = await api.post('/auth/login').send({
        email: 'sherlock@baker-st.com',
        password: 'Password123',
      });

      const newRefreshCookie = newLogin.get('Set-Cookie');

      const res = await api
        .get('/auth/refresh')
        .set('Cookie', newRefreshCookie)
        .expect(200);

      expect(res.get('Set-Cookie')).toBeDefined();
    });

    it('request with expired refresh cookie errors: 403', async () => {
      const expiredRefreshToken = jwt.sign(
        userData,
        config.REFRESH_TOKEN_SECRET,
        {
          expiresIn: '0s',
        }
      );
      const expiredRefreshCookie = `jwt=${expiredRefreshToken}; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None`;
      const res = await api
        .get('/auth/refresh')
        .set('Cookie', expiredRefreshCookie)
        .expect(403);

      expect(res.body).toEqual({ message: 'jwt expired' });
    });

    it('request detects token re-use and erases all refresh tokens from user record', async () => {
      await api.get('/auth/refresh').set('Cookie', refreshCookie).expect(403);

      const user = await User.findOne({ email: 'sherlock@baker-st.com' });
      expect(user?.refreshToken).toEqual([]);
    });
  });

  describe('GET /auth/logout', () => {
    beforeAll(async () => {
      const res = await api.post('/auth/login').send({
        email: 'sherlock@baker-st.com',
        password: 'Password123',
      });

      refreshCookie = res.get('Set-Cookie');
    });

    it('user can logout correctly', async () => {
      const res = await api
        .get('/auth/logout')
        .set('Cookie', refreshCookie)
        .expect(204);

      const user = await User.findOne({ email: 'sherlock@baker-st.com' });

      // get the cookie out of the refresh cookie array
      const cookie = refreshCookie[0];

      // extract the jwt from the cookie string with regex
      const match = /jwt=([^;\s]+)/.exec(cookie!);

      // get second index from match as first contains 'jwt='
      const extractedToken = match![1];
      const refreshTokenInDb = user?.refreshToken.includes(extractedToken!);

      // the refresh token should have been removed from user record
      expect(refreshTokenInDb).toBe(false);

      // set-cookie header should contain an 'empty jwt cookie' to delete the cookie
      expect(res.get('Set-Cookie')).toEqual([
        'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);
    });
  });
});

