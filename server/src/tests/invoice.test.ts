import supertest from 'supertest';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import Customer from '../models/customer.model';
import db from '../utils/db';
import app from '../app';
import Invoice from '../models/invoice.model';
import { omit } from 'lodash';

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

  const inv1 = await Invoice.create({
    date: new Date('01-01-2024'),
    paymentTerms: 28,
    status: 'pending',
    customer: cust1._id,
    user: user._id,
    items: [
      { quantity: 1, description: 'Item 1', amount: 9.99 },
      { quantity: 10, description: 'Item 2', amount: 0.99 },
    ],
  });

  const inv2 = await Invoice.create({
    date: new Date('01-01-2024'),
    paymentTerms: 30,
    status: 'paid',
    customer: cust2._id,
    user: user._id,
    items: [{ quantity: 10, description: 'Item 1', amount: 14.99 }],
  });

  const inv3 = await Invoice.create({
    date: new Date('01-01-2024'),
    paymentTerms: 31,
    status: 'draft',
    customer: cust2._id,
    user: user._id,
    items: [
      { quantity: 150, description: 'Item 1', amount: 2.99 },
      { quantity: 300, description: 'Item 2', amount: 12.49 },
      { quantity: 1, description: 'Item 3', amount: 24.49 },
    ],
  });

  user.customers = [cust1, cust2];
  user.invoices = [inv1, inv2, inv3];
  await user.save();

  // add extra user and customer and invoices - should not be accessible for test user

  const pwd2 = await bcrypt.hash('Password123', 10);
  const user2 = await User.create({
    name: 'User 2',
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

  const inv5 = await Invoice.create({
    date: new Date('01-01-2024'),
    paymentTerms: 28,
    status: 'pending',
    customer: cust4._id,
    user: user2._id,
    items: [{ quantity: 3, description: 'Item 1', amount: 120.45 }],
  });

  user2.customers = [cust4];
  user2.invoices = [inv5];
  await user2.save();

  // add another user with no invoices or customers to ensure requests return empty array
  const pwd3 = await bcrypt.hash('Password123', 10);
  await User.create({
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

describe('invoice', () => {
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

  describe('GET /api/invoices', () => {
    it('request without bearer token is unauthorized', async () => {
      await api.get('/api/invoices').expect(401);
    });

    it('logged-in user can get invoices belonging to their account', async () => {
      const res = await api
        .get('/api/invoices')
        .set('Authorization', accessToken)
        .expect(200)
        .expect('content-type', /application\/json/);

      expect(res.body).toHaveLength(3);
    });

    it('logged-in user with no invoices returns an empty array', async () => {
      const res = await api
        .get('/api/invoices')
        .set('Authorization', accessToken2)
        .expect(200)
        .expect('content-type', /application\/json/);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/invoices/:invoiceId', () => {
    it('logged-in user can get a specific invoice belonging to their account', async () => {
      const invoice = await Invoice.findOne({ status: 'draft' });
      const invoiceId = invoice!.id;

      const res = await api
        .get(`/api/invoices/${invoiceId}`)
        .set('Authorization', accessToken)
        .expect(200);

      expect(res.body).toEqual(expect.objectContaining({ status: 'draft' }));
    });

    it('requesting an invoice that is not found returns 404', async () => {
      const res = await api
        .get('/api/invoices/1234567890abcdef12345678')
        .set('Authorization', accessToken)
        .expect(404);

      // TODO: unify message responses, whether text or json etc
      // expect(res.text).toEqual('Not Found');
    });
  });

  describe('POST /api/invoices', () => {
    const invoice = {
      date: new Date('01-01-2024'),
      paymentTerms: 28,
      status: 'pending',
      customer: '',
      items: [
        { quantity: 10, description: 'Item 1', amount: 1.99 },
        { quantity: 2, description: 'Item 2', amount: 24.99 },
        { quantity: 100, description: 'Item 3', amount: 0.9 },
      ],
    };

    beforeAll(async () => {
      const customer = await Customer.findOne({ name: 'George Holloway' });
      invoice.customer = customer!.id;
    });

    it('logged in user can create invoices', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(invoice)
        .expect(201);

      // expect(res.body).toEqual({});
      expect(res.body).toEqual(expect.objectContaining({ status: 'pending' }));
    });

    it('returns calculated fields: invoiceNumber', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(invoice)
        .expect(201);

      expect(res.body).toEqual(expect.objectContaining({ invoiceNumber: 5 }));
    });

    it('returns calculated fields: populated customer', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(invoice)
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          customer: expect.objectContaining({ name: 'George Holloway' }),
        })
      );
    });

    it('returns calculated fields: [item].total', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(invoice)
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 10,
              description: 'Item 1',
              amount: 1.99,
              total: 19.9,
            }),
          ]),
        })
      );
    });

    it('returns calculated fields: [item].total', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(invoice)
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 10,
              description: 'Item 1',
              amount: 1.99,
              total: 19.9,
            }),
          ]),
        })
      );
    });

    it('returns calculated fields: total', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(invoice)
        .expect(201);

      expect(res.body).toEqual(expect.objectContaining({ total: 159.88 }));
    });

    it('returns calculated fields: due', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(invoice)
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({ due: '2024-01-29T00:00:00.000Z' })
      );
    });

    it('validates: missing date', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(omit(invoice, 'date'))
        .expect(400);

      console.log(res.body.error.issues);
      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: date type', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          date: 1,
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: date format', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          date: new Date('2024-13-01'),
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: missing paymentTerms', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(omit(invoice, 'paymentTerms'))
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: paymentTerms: whole number', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          paymentTerms: 1.2,
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toBe('invalid_type');
    });

    it('validates: paymentTerms: positive number', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          paymentTerms: -1,
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toBe('too_small');
    });

    it('validates: missing status', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(omit(invoice, 'status'))
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: status type', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          status: 1,
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: status enum', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          status: 'not-paid',
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_enum_value'
      );
    });

    it('validates: missing customer', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(omit(invoice, 'customer'))
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: customer type', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          customer: 1,
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: customer: ObjectId format', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          customer: 'abcdefghjklmno1234567890',
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toBe('invalid_string');
    });

    it('validates: missing items', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send(omit(invoice, 'items'))
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: empty item array', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [],
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toBe('too_small');
    });

    it('validates: missing item.quantity', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [omit(invoice.items[0], 'quantity')],
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: items.quantity: type', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [
            {
              ...invoice.items[0],
              quantity: true,
            },
          ],
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: items.quantity: whole number', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [
            {
              ...invoice.items[0],
              quantity: true,
            },
          ],
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: items.quantity: min: 1', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [
            {
              ...invoice.items[0],
              quantity: 0,
            },
          ],
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toBe('too_small');
    });

    it('validates: missing item.description', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [omit(invoice.items[0], 'description')],
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: items.description type', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [
            {
              ...invoice.items[0],
              description: 1,
            },
          ],
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: missing item.amount', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [omit(invoice.items[0], 'amount')],
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: items.amount type', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [
            {
              ...invoice.items[0],
              amount: true,
            },
          ],
        })
        .expect(400);

      expect(res.body.error.issues[0].unionErrors[0].issues[0].code).toBe(
        'invalid_type'
      );
    });

    it('validates: items.amount: non-negative', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          ...invoice,
          items: [
            {
              ...invoice.items[0],
              amount: -1,
            },
          ],
        })
        .expect(400);

      expect(res.body.error.issues[0].code).toBe('too_small');
    });

    it('draft invoice can be created with optional fields', async () => {
      const res = await api
        .post('/api/invoices')
        .set('Authorization', accessToken)
        .send({
          status: 'draft',
        })
        .expect(201);

      expect(res.body).toEqual({
        status: 'draft',
        due: null,
        id: expect.any(String),
        invoiceNumber: expect.any(Number),
        items: [],
        total: 0,
        user: {
          name: 'Sherlock Holmes',
          email: 'sherlock@baker-st.com',
          address: {
            line1: '22B Baker St',
            line2: 'Marylebone',
            city: 'London',
            postcode: 'NW1 6XE',
          },
          id: expect.any(String),
        },
      });
    });
  });

  describe('PUT /api/invoices', () => {
    const invoice = {
      date: new Date('01-01-2024'),
      paymentTerms: 28,
      status: 'pending',
      customer: '',
      items: [
        { quantity: 10, description: 'Item 1', amount: 1.99 },
        { quantity: 2, description: 'Item 2', amount: 24.99 },
        { quantity: 100, description: 'Item 3', amount: 0.9 },
      ],
      user: '',
      id: '',
    };

    beforeAll(async () => {
      const customer = await Customer.findOne({ name: 'George Holloway' });
      invoice.customer = customer!.id;

      const user = await User.findOne({ email: 'sherlock@baker-st.com' });
      invoice.user = user!.id;

      const inv = await Invoice.create(invoice);
      invoice.id = inv.id;

      user!.invoices = [inv];
      await user!.save();
    });

    it('an invoice can be updated', async () => {
      const res = await api
        .put(`/api/invoices/${invoice.id}`)
        .set('Authorization', accessToken)
        .send({
          date: new Date('02-02-2024'),
          paymentTerms: 1,
          status: 'draft',
          customer: null,
          items: [{ quantity: 1, description: 'Item 1', amount: 0.9 }],
          user: invoice.user,
          id: invoice.id,
        })
        .expect(200);

      expect(res.body).toEqual({
        date: '2024-02-02T00:00:00.000Z',
        due: '2024-02-03T00:00:00.000Z',
        customer: null,
        status: 'draft',
        paymentTerms: 1,
        invoiceNumber: expect.any(Number),
        items: [
          {
            quantity: 1,
            description: 'Item 1',
            amount: 0.9,
            total: 0.9,
            id: expect.any(String),
          },
        ],
        total: 0.9,
        user: {
          name: 'Sherlock Holmes',
          email: 'sherlock@baker-st.com',
          address: {
            line1: '22B Baker St',
            line2: 'Marylebone',
            city: 'London',
            postcode: 'NW1 6XE',
          },
          id: expect.any(String),
        },
        id: invoice.id,
      });
    });
  });
});

