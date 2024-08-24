import supertest from 'supertest';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import db from '../utils/db';
import app from '../app';
import Customer from '../models/customer.model';
import jwt from 'jsonwebtoken';
import { omit } from 'lodash';
import config from '../config';

const api = supertest(app);

beforeAll(async () => {
  await db.testServer.start();

  // create test user
  const pwd = await bcrypt.hash('Password123', 10);
  const user = await User.create({
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

  const cust1 = await Customer.create({
    name: 'Chris Jenkins',
    email: 'chris@jenkins.com',
    address: {
      line1: '123 Bath St',
      city: 'Portsmouth',
      postcode: 'PM1 7AR',
    },
    user: user._id,
  });

  const cust2 = await Customer.create({
    name: 'George Holloway',
    email: 'george@holloway.com',
    address: {
      line1: '36A',
      line2: 'Hannover St.',
      city: 'Romsey',
      county: 'Hampshire',
      postcode: 'HM3 9RS',
    },
    user: user._id,
  });

  const cust3 = await Customer.create({
    name: 'Laura Brand',
    email: 'laura@brand.com',
    address: {
      line1: '14 Trafalgar Arch',
      line2: 'Churchill Avenue',
      city: 'Manchester',
      postcode: 'MN5 3XB',
    },
    user: user._id,
  });

  // add extra user and customer - customer should not be accessible for test user

  const pwd2 = await bcrypt.hash('Password123', 10);
  const user2 = await User.create({
    name: 'Test',
    email: 'user@test.com,',
    passwordHash: pwd2,
    address: {
      line1: '123 Test St',
      city: 'London',
      postcode: 'NW2 8BX',
    },
  });

  const cust4 = await Customer.create({
    name: 'Customer not belonging to user',
    email: 'john@doe.com',
    address: {
      line1: '124 Park St',
      city: 'London',
      postcode: 'LN1 8GB',
    },
    user: user2._id,
  });

  user2.customers = [cust4];
  await user2.save();

  user.customers = [cust1, cust2, cust3];
  await user.save();

  // add another user with no customers to ensure requests return empty array
  const pwd3 = await bcrypt.hash('Password123', 10);
  const user3 = await User.create({
    name: 'User 3',
    email: 'user3@test.com',
    passwordHash: pwd3,
    address: {
      line1: '123 Test St',
      city: 'London',
      postcode: 'NW2 8BX',
    },
  });
});

afterAll(async () => {
  await db.testServer.stop();
});

describe('customer', () => {
  let accessToken = '';
  let accessToken2 = '';

  beforeAll(async () => {
    // login test user and get access token
    const res = await api.post('/auth/login').send({
      email: 'sherlock@baker-st.com',
      password: 'Password123',
    });

    accessToken = `Bearer ${res.body.accessToken}`;

    const res2 = await api.post('/auth/login').send({
      email: 'user3@test.com',
      password: 'Password123',
    });

    accessToken2 = `Bearer ${res2.body.accessToken}`;
  });

  describe('GET /api/customers', () => {
    it('request with a signed but non-existant user token unauthorized', async () => {
      const wrongUserToken = jwt.sign(
        {
          email: 'wrong@user.com',
          id: '123456',
          sum: '123456',
        },
        config.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      await api
        .get('/api/customers')
        .set('Authorization', `Bearer ${wrongUserToken}`)
        .expect(401);
    });

    it('request without bearer token is unauthorized', async () => {
      await api.get('/api/customers').expect(401);
    });

    it('logged-in user can get customers belonging to their account', async () => {
      const res = await api
        .get('/api/customers')
        .set('Authorization', accessToken)
        .expect(200)
        .expect('content-type', /application\/json/);

      expect(res.body).toHaveLength(3);
    });

    it('logged-in user with no customers returns an empty array', async () => {
      const res = await api
        .get('/api/customers')
        .set('Authorization', accessToken2)
        .expect(200)
        .expect('content-type', /application\/json/);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/customers/:customerId', () => {
    it('logged-in user can get a specific customer belonging to their account', async () => {
      const customer = await Customer.findOne({ name: 'George Holloway' });
      const customerId = customer!.toJSON().id;

      const res = await api
        .get(`/api/customers/${customerId}`)
        .set('Authorization', accessToken)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({ name: 'George Holloway' })
      );
    });

    it('requesting a customer that is not found returns 404', async () => {
      const res = await api
        .get('/api/customers/1234567890abcdef12345678')
        .set('Authorization', accessToken)
        .expect(404);

      expect(res.text).toEqual('Not Found');
    });
  });

  describe('POST /api/customers', () => {
    const customer = {
      name: 'Harry Kingsley',
      email: 'harry@kingsley.com',
      address: {
        line1: '42 Landsdown Rd',
        city: 'Bristol',
        postcode: 'BS10 6RS',
      },
    };

    it('logged in user can create customers', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send(customer)
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({ name: 'Harry Kingsley' })
      );

      const createdCustomer = await Customer.findOne({
        name: 'Harry Kingsley',
      });
      expect(createdCustomer).toBeDefined();
    });

    it('validates: missing name', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send(omit(customer, 'name'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: name too short', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send({
          ...customer,
          name: 'A',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('too_small');
    });

    it('validates: name too long', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send({
          ...customer,
          name: 'Name is thirty six characters long !',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('too_big');
    });

    it('validates: missing email', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send(omit(customer, 'email'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: invalid email', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send({
          ...customer,
          email: 'invalid.email@com',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_string');
    });

    it('validates: missing address', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send(omit(customer, 'address'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: missing address.line1', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send(omit(customer, 'address.line1'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: missing address.city', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send(omit(customer, 'address.city'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: missing address.postcode', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send(omit(customer, 'address.postcode'))
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_type');
    });

    it('validates: regex for address.postcode', async () => {
      const res = await api
        .post('/api/customers')
        .set('Authorization', accessToken)
        .send({
          ...customer,
          address: {
            ...customer.address,
            postcode: 'PX104',
          },
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toEqual('invalid_string');
    });
  });

  describe('PUT /api/customers/:customerId', () => {
    it('logged-in user can edit a customer', async () => {
      const user = await User.findOne({ email: 'sherlock@baker-st.com' });
      await user!.populate('customers');

      const customerId = user!.customers[1]!.id;
      const res = await api
        .put(`/api/customers/${customerId}`)
        .set('Authorization', accessToken)
        .send({
          name: 'Gordon Holloway',
          email: 'gordon@holloway.com',
          address: {
            line1: '36B',
            line2: 'Hannover St.',
            city: 'Romsey',
            county: 'Hampshire',
            postcode: 'HM3 9RS',
          },
        })
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({ name: 'Gordon Holloway' })
      );
    });

    it('logged-in user cannot edit a customer belonging to another user: (404)', async () => {
      const customer = await Customer.findOne({
        name: 'Customer not belonging to user',
      });

      await api
        .put(`/api/customers/${customer!.id}`)
        .set('Authorization', accessToken)
        .send({
          name: 'Terry Gibbs',
          email: 'terry@gibbs.com',
          address: {
            line1: '36B',
            line2: 'Hannover St.',
            city: 'Romsey',
            county: 'Hampshire',
            postcode: 'HM3 9RS',
          },
        })
        .expect(404);
    });
  });

  describe('DELETE /api/customers/:customerId', () => {
    it('logged-in user can delete a customer', async () => {
      const customer = await Customer.findOne({ name: 'Laura Brand' });

      await api
        .delete(`/api/customers/${customer!.id}`)
        .set('Authorization', accessToken)
        .expect(204);
    });

    it('logged-in cannot delete a customer belonging to another user: (404)', async () => {
      const customer = await Customer.findOne({
        name: 'Customer not belonging to user',
      });

      await api
        .delete(`/api/customers/${customer!.id}`)
        .set('Authorization', accessToken)
        .expect(404);
    });
  });
});

