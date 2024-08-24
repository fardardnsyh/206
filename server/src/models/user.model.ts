import mongoose, { Document, PopulatedDoc, Schema, Types } from 'mongoose';
import { InvoiceDocument } from './invoice.model';
import { CustomerDocument } from './customer.model';

// TODO: work out typescript / mongoose interaction properly - from reading docs:

// IUser is a document interface, it represents the raw object structure that IUser objects look like in MongoDB.
// User() constructor returns an instance of HydratedDocument<IUser>
// HydratedDocument<IUser> represents a hydrated Mongoose document,
// with methods, virtuals, and other Mongoose-specific features.

// ObjectId's: use Types.ObjectId in Document Interfaces,
// and ObjectId or Schema.Types.ObjectId for Schemas

/**
 * extend Document interface so Typescript knows that UserDocument.populate() exists,
 * -- used in functions after authUser middleware adds UserDocument to request
 */
export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
  };
  // bank details?
  invoices: Array<PopulatedDoc<InvoiceDocument>>;
  customers: Array<PopulatedDoc<CustomerDocument>>;
  // totalInvoices: number;
  invoiceCounter: number;
  refreshToken: Array<string>;
  id: string; // mongoose virtual: string version of ObjectId
  _id: Types.ObjectId; // ObjectId used for attaching user ID to req.user for auth middleware
}

// TODO: this is also in customer so should probably have this in a separate file?
// technically there should also be bank details too though
// NOTE: may not wis to save a users address - as it would be populated in an invoice,
// this would mean that if an address is changed it would than affect pre-existing invoices which would not be desired.
// either save address version histories?
// or save the address directly in the invoice: but could keep a user address as a 'last used address' for pre-populating invoice fields?
const addressSchema = new Schema(
  {
    line1: {
      type: String,
      required: true,
    },
    line2: String,
    city: {
      type: String,
      required: true,
    },
    county: String,
    postcode: {
      type: String,
      required: true,
      uppercase: true,
    },
  },
  {
    _id: false,
  }
);

// TODO: where do I put the password / confirm password, or is that only in the zod schema (as that is input not returned mongoose document)

export const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // need to add mongoose-unique-validator
    },
    passwordHash: {
      type: String,
      required: true,
    },
    address: addressSchema,
    invoices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
      },
    ],
    customers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
      },
    ],
    refreshToken: [String],
    invoiceCounter: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_document, returned) => {
        delete returned._id;
        delete returned.__v;
        delete returned.passwordHash;
        delete returned.refreshToken;
      },
    },
  }
);

// TODO: hash the password on pre save

const User = mongoose.model('User', userSchema);

export default User;

