import Customer, {
  CustomerDocument,
  CustomerInput,
} from '../models/customer.model';
import { UserDocument } from '../models/user.model';
import logger from '../utils/logger';

export const getCustomers = async (user: UserDocument | undefined) => {
  // const customers = await Customer.find<CustomerDocument>({ user });
  // return customers;
  // const user = await User.findById(id).populate('customers');
  const populated = await user?.populate('customers');

  return populated?.customers;
};

export const getSingleCustomer = async (
  user: UserDocument | undefined,
  customerId: string
) => {
  // const customer = await Customer.findById<CustomerDocument>({id});
  // return customer;

  const populated = await user?.populate({
    path: 'customers',
    match: { _id: customerId },
  });

  return populated?.customers[0];
};

// TODO: work out best method of returning the objects
// using Customer.find<CustomerDocument>() works and tells typescript it's the interface only
// (although the mongoose Document methods and properties are actually on the object)
// however I can't seem to do this for the create function as it still returns it as a Document type with the Interface
// but perhaps I don't need to type these and just use the inferred values, now that I am typing the Models correctly with the interface
export const createCustomer = async (
  user: UserDocument,
  data: CustomerInput
) => {
  // const customer = new Customer(data);
  // await customer.save();
  // return customer;
  const customer = await Customer.create<CustomerInput>(data);
  user.customers = user.customers.concat(customer._id);
  await user.save();

  return customer;
};

export const deleteCustomerById = async (user: UserDocument, id: string) => {
  const foundCustomer = user.customers.find((c) => c?.toString() === id);
  if (!foundCustomer) {
    return null;
  }

  const deleted = await Customer.findOneAndDelete<CustomerDocument>({
    _id: id,
  });

  // remove customer from user.customers
  user.customers = user.customers.filter((c) => c?.toString() !== id);
  await user.save();

  return deleted;
};

export const editCustomerById = async (
  user: UserDocument,
  id: string,
  data: CustomerInput
) => {
  // const customer = await Customer.findOne({ _id: id });

  // logger.info(`editCustomerById: ${JSON.stringify(customer)}`);

  // if (!customer || customer.user.toString() !== user.id) {
  //   return null;
  // }

  // customer.overwrite({
  //   ...data,
  //   user: user._id
  // });
  // await customer.save();
  logger.info(`editCustomerById: user: ${JSON.stringify(user)}`);
  // TODO: c is actually of type Types.ObjectId as user.customers is NOT populated - see if mongoose can create a type for this
  const foundCustomer = user.customers.find((c) => c?.toString() === id);
  if (!foundCustomer) {
    return null;
  }

  const customer = await Customer.findOneAndUpdate({ _id: id }, data, {
    returnDocument: 'after',
  });

  logger.info(`editCustomerById: after overwrite: ${JSON.stringify(customer)}`);
  // const edited = await Customer.findOneAndReplace({ _id: id }, data, {
  //   returnDocument: 'after',
  // });
  return customer;
};

