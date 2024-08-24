import { DevTool } from '@hookform/devtools';
import { useCustomers } from '../hooks/useCustomers';

import { FormInput } from './ui/FormInput';
import Button from './ui/Button';
import {
  InvoiceInput,
  invoiceSchema,
  draftInvoiceSchema,
} from '../schemas/invoice.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateInvoice } from '../hooks/useCreateInvoice';
import { useNavigate } from 'react-router-dom';
import { useEditInvoice } from '../hooks/useEditInvoice';
import { InvoiceFormValues } from '../types/Invoice';
import toast from 'react-hot-toast';
import DeleteIcon from './icons/DeleteIcon';
import formatCurrency from '../utils/formatCurrency';
import PlusIcon from './icons/PlusIcon';
import { Customer } from '../types/Customer';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import { customerSchema } from '../schemas/customer.schema';

import { Select } from './ui/Select';
import { useFieldArray, useForm } from 'react-hook-form';
import React, { useState } from 'react';

// TODO: check form schema for name, that it matches input length of server schema

// TODO: note on react-hook-form void returns for attributes:
/**
 * see here: https://github.com/orgs/react-hook-form/discussions/8622
 *
 * when trying to use <form onSubmit={handleSubmit(onSubmit)}> ...
 * this doesn't work as the handleSubmit function from reacthookform returns a Promise<void>
 * I thought adding void handleSubmit(onSubmit) would work however it does not e.preventDefault() and refreshes page
 * either add a eslint rule for void returns for attributes,
 * or change to onSubmit={(event) => void handleSubmit(onSubmit)(event)}
 * I'm unsure which is best to use in this situation
 *
 * can also inline the event.preventDefault() which means I dont have to have typed in the onSubmit function:
 * onSubmit={(event) => { event.preventDefault(); void handleSubmit(onSubmit)(event)}
 * You still need to pass event to onSubmit even though preventDefault() is handled before onSubmit,
 * however you then don't need the optional e?: React.BaseSyntheticEvent in the onSubmit function
 *
 * also note that another rule I added in eslint for children render prop may not be needed now, as I'm not using TanStack Form
 */

type Props = {
  type: 'NewInvoice' | 'EditInvoice';
  defaultValues: InvoiceFormValues;
};

export default function InvoiceForm({ type, defaultValues }: Props) {
  const navigate = useNavigate();
  const { data: customers } = useCustomers();
  const { mutate: createInvoiceMutation, isPending: isPendingCreateInvoice } =
    useCreateInvoice();
  const { mutate: editInvoiceMutation, isPending: isPendingEditInvoice } =
    useEditInvoice();
  const { mutate: createCustomer, isPending: isPendingCreateCustomer } =
    useCreateCustomer();

  if (!defaultValues.customer) {
    defaultValues.customer = 'null';
  }

  // TODO: fix loading state of buttons, and reorder them for Enter submition

  const customerForm = useForm<Customer>({
    resolver: zodResolver(customerSchema),
  });

  const methods = useForm<InvoiceFormValues>({
    resolver: (values, context, options) => {
      const schema =
        values.status === 'draft' ? draftInvoiceSchema : invoiceSchema;
      return zodResolver(schema)(values, context, options);
    },
    defaultValues,
  });

  const { errors } = methods.formState;

  // capture loading state for ui button feedback --
  // cannot use mutation isPending, as both Draft and NewInvoice use the Create mutation
  const [buttonLoading, setButtonLoading] = useState<string>('');

  // populate Customer Select options
  const customerOptions: [string, string][] | undefined = customers?.map(
    (cust) => [cust.id, cust.name]
  );
  customerOptions?.unshift(['null', '-select customer-']);
  customerOptions?.push(['new', '-new customer-']);

  // watch customer to toggle newCustomer form inputs
  const selectedCustomer = methods.watch('customer') ?? 'null';

  // base isDraftInvoice on the default values to conditionally render Create Invoice button,
  // otherwise when clicking, the button will disappear as the status has been set to pending!
  const isDraftInvoice = defaultValues.status === 'draft';
  console.log('isDraftInvoice', isDraftInvoice, defaultValues.status);

  // setup items array
  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: methods.control,
  });

  // watch items to calculate and show item totals
  const invoiceItems = methods.watch('items');

  const onCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    navigate(-1);
  };

  const onCancelNewCustomer = (e: React.SyntheticEvent) => {
    console.log('onCancelNewCustomer');
    e.preventDefault();
    methods.setValue('customer', 'null');
    customerForm.reset();
  };

  const onDeleteItem = (e: React.SyntheticEvent, index: number) => {
    e.preventDefault();
    if (fields.length === 1 && index === 0) {
      methods.reset({
        items: [
          { quantity: '', description: '', amount: '' },
        ] as unknown as InvoiceInput['items'],
      });
    } else {
      remove(index);
    }
  };

  const customerSubmit = (data: Customer) => {
    console.log('customerSubmit');
    createCustomer(data, {
      onSuccess: (customer: Customer) => {
        customerForm.reset();
        toast.success('Customer added');
        console.log('created customer with id:', customer.id);
        setTimeout(() => methods.setValue('customer', customer.id), 0);
        void methods.trigger('customer');
      },
      onError: (err) => {
        toast.error('Could not create customer - try again');
        console.error(err);
      },
    });
  };

  const createInvoice = (data: InvoiceFormValues) => {
    if (data.customer === 'null') {
      data.customer = null;
    }

    console.log('newInvoice - data is:', data);

    createInvoiceMutation(data, {
      onSuccess: () => {
        methods.reset();
        toast.success('Invoice created!');
        navigate('/invoices');
      },
      onError: (error) => {
        toast.error('Error, try again');
        console.error(error);
      },
    });
  };

  const saveInvoice = (data: InvoiceFormValues) => {
    if (data.customer === 'null') {
      data.customer = null;
    }

    console.log('saveInvoice - data is:', data);

    editInvoiceMutation(
      { invoiceId: data.id!, data: data },
      {
        onSuccess: () => {
          methods.reset();
          toast.success('Invoice updated');
          navigate('/invoices');
        },
        onError: (error) => {
          toast.error('Error, try again');
          console.log(error);
        },
      }
    );
  };

  const onSubmit = (
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // event type - value attribute on the button element used to submit the form
    const eventType = event.nativeEvent.submitter?.getAttribute('value');
    console.log('handlePresubmit:', eventType);

    if (eventType === 'newInvoice') {
      methods.setValue('status', 'pending');
      setButtonLoading('newInvoice');
      void methods.handleSubmit(createInvoice)(event);
    } else if (eventType === 'draftInvoice') {
      methods.setValue('status', 'draft');
      setButtonLoading('draftInvoice');
      void methods.handleSubmit(createInvoice)(event);
    } else if (eventType === 'editInvoice') {
      methods.setValue('status', defaultValues.status);
      setButtonLoading('editInvoice');
      void methods.handleSubmit(saveInvoice)(event);
    } else if (eventType === 'draftToNewInvoice') {
      methods.setValue('status', 'pending');
      setButtonLoading('draftToNewInvoice');
      void methods.handleSubmit(saveInvoice)(event);
    } else {
      console.error('unandled form event');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white px-6 py-8 rounded-xl">
        {/* Main form */}
        {selectedCustomer !== 'new' && (
          <form
            id="invoice-form"
            className="flex flex-col w-full"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="flex w-full gap-8">
              <FormInput
                label="Invoice date"
                type="date"
                {...methods.register('date')}
                defaultValue={
                  defaultValues.date ??
                  new Date().toISOString().substring(0, 10)
                }
                error={errors.date}
              />
              <FormInput
                label="Payment terms (days)"
                type="number"
                error={errors.paymentTerms}
                {...methods.register('paymentTerms')}
              />
            </div>
            <Select
              options={customerOptions}
              label="Customer"
              error={errors.customer}
              {...methods.register('customer')}
            />

            {/* Item field array */}
            <div className="w-full">
              <div className="flex gap-4 text-sm font-bold">
                <label id="labelQuantity" className="w-1/5 mb-1">
                  Quantity
                </label>
                <label id="labelDescription" className="w-3/5 mb-1">
                  Item description
                </label>
                <label id="labelAmount" className="w-1/5 mb-1">
                  Unit Price
                </label>
                <label id="labelTotal" className="w-1/5 mb-1">
                  Total
                </label>
                <label id="labelDelete" className="text-transparent">
                  <DeleteIcon />
                </label>
              </div>
              <div>
                {fields.map((field, index) => {
                  return (
                    <div key={field.id} className="flex gap-4">
                      <FormInput
                        className="w-1/5"
                        type="number"
                        {...methods.register(
                          `items.${index}.quantity` as const
                        )}
                        aria-describedby="labelQuantity"
                        placeholder="1"
                        error={errors.items && errors.items[index]?.quantity}
                      />
                      <FormInput
                        className="w-3/5"
                        {...methods.register(
                          `items.${index}.description` as const
                        )}
                        aria-describedby="labelDescription"
                        placeholder="Item"
                        error={errors.items && errors.items[index]?.description}
                      />
                      <FormInput
                        className="w-1/5"
                        type="number"
                        step="0.01"
                        {...methods.register(`items.${index}.amount` as const)}
                        placeholder="100"
                        aria-describedby="labelAmount"
                        error={errors.items && errors.items[index]?.amount}
                      />
                      <div className="w-1/5">
                        <div className="flex w-full border-2 h-10 px-4 py-2 rounded-md text-sm">
                          {(
                            invoiceItems![index].amount! *
                            invoiceItems![index].quantity!
                          ).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flex h-10 items-center text-slate-400 hover:text-black"
                        aria-label="Delete item"
                        onClick={(e) => onDeleteItem(e, index)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  );
                })}
                <div className="flex w-full justify-end items-center gap-4">
                  <button
                    type="button"
                    className="flex py-2 h-10 gap-1 text-sm items-center mr-auto text-green-600 font-extrabold hover:text-black"
                    onClick={(e) => {
                      e.preventDefault();
                      append({
                        quantity: '',
                        description: '',
                        amount: '',
                      } as unknown as InvoiceInput['items']);
                    }}
                  >
                    <PlusIcon /> Add item
                  </button>
                  <label className="flex px-3 py-2 font-bold text-sm mb-1">
                    Invoice total
                  </label>
                  <div className="w-1/5 font-bold flex h-10 rounded-md bg-background px-3 py-2 text-sm ring-offset-background medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    {formatCurrency(
                      invoiceItems?.reduce((acc, curr) => {
                        return acc + curr.amount! * curr.quantity!;
                      }, 0) || 0
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* End Item field array */}

            {/* Form submit buttons */}
            <div className="flex gap-4 mt-10">
              {type === 'NewInvoice' ? (
                <>
                  <div className="mr-auto">
                    <Button
                      onClick={onCancel}
                      variant="tertiary"
                      label="Cancel"
                    />
                  </div>
                  <Button
                    className="order-1"
                    type="submit"
                    label="Create invoice"
                    value="newInvoice"
                    loading={
                      buttonLoading === 'newInvoice' && isPendingCreateInvoice
                    }
                    disabled={isPendingCreateInvoice}
                  />
                  <Button
                    variant="secondary"
                    type="submit"
                    label="Save as draft"
                    value="draftInvoice"
                    loading={
                      buttonLoading === 'draftInvoice' && isPendingCreateInvoice
                    }
                    disabled={isPendingCreateInvoice}
                  />
                </>
              ) : null}
              {type === 'EditInvoice' && isDraftInvoice ? (
                <>
                  <Button
                    onClick={onCancel}
                    variant="tertiary"
                    label="Cancel"
                  />
                  <Button
                    className="order-1"
                    type="submit"
                    label="Create invoice"
                    value="draftToNewInvoice"
                    loading={
                      buttonLoading === 'draftToNewInvoice' &&
                      isPendingEditInvoice
                    }
                    disabled={isPendingEditInvoice}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    label="Save changes"
                    value="editInvoice"
                    loading={
                      buttonLoading === 'editInvoice' && isPendingEditInvoice
                    }
                    disabled={isPendingEditInvoice}
                  />
                </>
              ) : null}
              {type === 'EditInvoice' && !isDraftInvoice ? (
                <>
                  <Button
                    onClick={onCancel}
                    variant="tertiary"
                    label="Cancel"
                  />
                  <Button
                    type="submit"
                    label="Save changes"
                    value="editInvoice"
                    loading={
                      buttonLoading === 'editInvoice' && isPendingEditInvoice
                    }
                    disabled={isPendingEditInvoice}
                  />
                </>
              ) : null}
            </div>
            {/* End form submit buttons */}
          </form>
        )}
        {/* End main form */}

        {/* New customer form */}
        {selectedCustomer === 'new' && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void customerForm.handleSubmit(customerSubmit)(event);
            }}
          >
            <h2 className="font-bold mb-4">Add new customer</h2>
            <FormInput
              {...customerForm.register('name')}
              label="Name"
              error={customerForm.formState.errors.name}
            />
            <FormInput
              {...customerForm.register('email')}
              label="Email"
              type="email"
              error={customerForm.formState.errors.email}
            />
            <FormInput
              {...customerForm.register('address.line1')}
              label="Address line 1"
              error={customerForm.formState.errors.address?.line1}
            />
            <FormInput
              {...customerForm.register('address.line2')}
              label="Address line 2 (optional)"
              error={customerForm.formState.errors.address?.line2}
            />
            <FormInput
              {...customerForm.register('address.city')}
              label="City / Town"
              error={customerForm.formState.errors.address?.city}
            />
            <FormInput
              {...customerForm.register('address.county')}
              label="County (optional)"
              error={customerForm.formState.errors.address?.county}
            />
            <FormInput
              {...customerForm.register('address.postcode')}
              label="Postcode"
              error={customerForm.formState.errors.address?.postcode}
            />
            <div className="flex gap-4 mt-8">
              <Button
                label="Cancel"
                onClick={onCancelNewCustomer}
                variant="tertiary"
              />
              <Button
                label="Add customer"
                type="submit"
                loading={isPendingCreateCustomer}
                disabled={isPendingCreateCustomer}
              />
            </div>
          </form>
        )}
        {/* End new customer form */}
      </div>

      {import.meta.env.DEV && <DevTool control={methods.control} />}
    </div>
  );
}

