import mongoose, { Schema, Types } from 'mongoose';
import dayjs from 'dayjs';
import { UserDocument } from './user.model';
// import User, { UserDocument } from './user.model';

// TODO: add user name, address and bank details,
// originally thought these could come from User, but if bank / address details change,
// then it would affect all previous invoices!

/**
 * ITEM document
 */
// this did have extends Document
export interface ItemDocument {
  quantity: number;
  description: string;
  amount: number;
  total: number;
  // id: string; // mongoose virtual: string version of ObjectId
}

export type ItemInput = Omit<ItemDocument, 'id' | 'total'>;

const item = new Schema<ItemDocument>(
  {
    quantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_document, returned) => {
        delete returned._id;
        delete returned.__v;
      },
    },
  }
);

// calculate item total
item.virtual('total').get(function () {
  return this.amount * this.quantity;
});

/**
 * INVOICE document
 */
export type InvoiceStatus = 'draft' | 'pending' | 'paid';

export interface InvoiceDocument {
  invoiceNumber: number;
  date: Date;
  paymentTerms: number;
  status: InvoiceStatus;
  // customer: PopulatedDoc<CustomerDocument>;
  // customer: Types.ObjectId,
  customer: Types.ObjectId; // use Types.ObjectId in interfaces TODO: should this just be a string?
  items: Array<ItemDocument>; // use Types.DocumentArray<> in interfaces
  // items: ItemDocument[]; // use Types.DocumentArray<> in interfaces
  total: number;
  due: Date;
  id: string; // mongoose virtual: string version of ObjectId
  // TODO: add user to invoice document and invoices to user document
  user: Types.ObjectId;
}

// TODO: investigate InvoiceInput type, as I'm not sure where this is now used - and there's also an InvoiceInput in the Zod schema file!

export type InvoiceInput = Pick<
  InvoiceDocument,
  'date' | 'paymentTerms' | 'status'
> & {
  user: string;
  customer: string;
  items: Array<ItemInput>;
};

const invoice = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    paymentTerms: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId, // use Schema.Types.ObjectId in Schemas
      ref: 'Customer',
      required: true,
    },
    items: {
      type: [item],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_document, returned) => {
        delete returned._id;
        delete returned.__v;
      },
    },
  }
);

// calculate total
invoice.virtual('total').get(function () {
  return this.items.reduce((sum, item) => sum + item.total, 0);
});

// calculate due date
invoice.virtual('due').get(function () {
  const date: Date = this.date;
  const days = this.paymentTerms;
  return dayjs(date).add(days, 'days').toDate();
});

// Increment invoice counter
invoice.pre('save', async function (next) {
  const user = await this.model('User').findByIdAndUpdate<UserDocument>(
    this.user,
    { $inc: { invoiceCounter: 1 } },
    { returnDocument: 'after' }
  );
  this.invoiceNumber = user?.invoiceCounter ?? 0;

  next();
});

const Invoice = mongoose.model('Invoice', invoice);

export default Invoice;

