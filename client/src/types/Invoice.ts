import { Customer } from './Customer';
import { Address } from './Address';
import { User } from './User';

export type Item = {
  quantity: number;
  description: string;
  amount: number;
  total: number;
  id: string;
};

export type Invoice = {
  invoiceNumber: number;
  // date: Date;
  date: string;
  paymentTerms: number;
  status: 'draft' | 'pending' | 'paid';
  customer: Customer;
  items: Array<Item>;
  total: number;
  due: string;
  id: string;
  user: User;
};

export interface PartialInvoice {
  invoiceNumber?: number;
  date: string;
  paymentTerms?: number;
  status: 'draft' | 'pending' | 'paid';
  customer?: string;
  items?: Array<Item>;
  total?: number;
  due?: string;
  id?: string;
}

// TODO:
/**
 * 1. createInvoice function needs to accept a partial type of invoice input
 * 2. for validation there must be a partial schema and a full schema for draft and full invoice creation, both of which will satisfy PartialInvoice type for createInvoice
 * 3. for editing an invoice a Invoice type from the API must be parsed into a PartialInputInvoice
 * 4. when editing, an id field must be present, but not in creation
 */

export type InvoiceStatus = 'draft' | 'pending' | 'paid';

// An invoice returned from the API
export interface ApiInvoice {
  invoiceNumber: number;
  date: Date;
  paymentTerms: number;
  due: Date;
  customer: Customer;
  status: InvoiceStatus;
  items: Array<Item>;
  total: number;
  user: string;
  id: string;
}

// generic invoice data for form, could be a draft invoice, new full invoice, or an edit of draft or full invoice
// this should cover both DraftInvoice and FullInvoice, and allow being sent to createInvoice or editInvoice
// NOTE: schema's should validate either draft or normal invoice before sending to API
export interface InvoiceFormValues {
  invoiceNumber?: number;
  date?: string;
  paymentTerms?: number;
  customer?: string | null;
  newCustomer?: {
    name?: string;
    email?: string;
    address?: Partial<Address>;
  };
  status?: InvoiceStatus;
  items?: Array<Partial<Item>>;
  // user?: string;
  id?: string;
}

// TODO: below not impletmented / needed?

// interface for a draft invoice - could be an edited invoice or a new draft invoice
export interface DraftInvoice {}

// interface for a full invoice - could be an edited full invoice or a new full invoce
export interface FullInvoice {}

// transformInvoiceToFormValues - probably put this somewhere else
export function transformInvoiceToFormValues(
  invoice: ApiInvoice
): InvoiceFormValues {
  return {
    ...invoice,
    customer: invoice.customer.id,
    date: invoice.date.toISOString(),
  };
}

