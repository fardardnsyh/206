import supertest from 'supertest';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import db from '../utils/db';
import app from '../app';
import User from '../models/user.model';
import { omit } from 'lodash';

const api = supertest(app);

beforeAll(async () => {
  await db.testServer.start();
});

afterAll(async () => {
  await db.testServer.stop();
});

const userInput = {
  name: 'John Doe',
  email: 'john@doe.com',
  password: 'Qwerty1234',
  passwordConfirmation: 'Qwerty1234',
  address: {
    line1: '10 Fitzrovia',
    city: 'London',
    postcode: 'LN1 1LN',
  },
};

// TODO: delete user account?

describe('user', () => {
  describe('POST /api/users', () => {
    it('a new user can be created', async () => {
      const res = await api
        .post('/api/users')
        .send(userInput)
        .expect(201)
        .expect('content-type', /application\/json/);

      expect(await User.find({ email: 'john@doe.com' })).toHaveLength(1);

      expect(res.body).toEqual({
        name: 'John Doe',
        email: 'john@doe.com',
        address: {
          line1: '10 Fitzrovia',
          city: 'London',
          postcode: 'LN1 1LN',
        },
        id: expect.stringMatching(/^[0-9a-f]{24}$/),
        invoices: [],
        customers: [],
        invoiceCounter: 0,
      });
    });

    it('validates: unique email', async () => {
      const res = await api
        .post('/api/users')
        .send(userInput)
        .expect(400)
        .expect('content-type', /application\/json/);

      expect(res.body).toBeDefined();
    });

    it('validates: missing email', async () => {
      const res = await api
        .post('/api/users')
        .send(omit(userInput, 'email'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: invalid email', async () => {
      const res = await api
        .post('/api/users')
        .send({
          ...userInput,
          email: 'not.com.email-address@',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_string');
    });

    it('validates: missing password', async () => {
      const res = await api
        .post('/api/users')
        .send(omit(userInput, 'password'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: password too short', async () => {
      const res = await api
        .post('/api/users')
        .send({
          ...userInput,
          password: 'cookies',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('too_small');
    });

    it('validates: password too long', async () => {
      const res = await api
        .post('/api/users')
        .send({
          ...userInput,
          password: 'Password__IsThirtyThreeCharacters',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('too_big');
    });

    it('validates: missing passwordConfirmation', async () => {
      const res = await api
        .post('/api/users')
        .send(omit(userInput, 'passwordConfirmation'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: password regex', async () => {
      const res = await api
        .post('/api/users')
        .send({
          ...userInput,
          password: 'qwertyuiop',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_string');
    });

    it('validates: unmatched passwords', async () => {
      const res = await api
        .post('/api/users')
        .send({
          ...userInput,
          passwordConfirmation: 'Unmatched_Password',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('custom');
    });
  });
});

