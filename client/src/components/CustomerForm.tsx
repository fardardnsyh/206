import { useForm } from 'react-hook-form';
import { FormInput } from './ui/FormInput';
import { customerSchema } from '../schemas/customer.schema';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import toast from 'react-hot-toast';
import { Customer } from '../types/Customer';
import { useEditCustomer } from '../hooks/useEditCustomer';
import { DevTool } from '@hookform/devtools';

type Props = {
  type: 'NewCustomer' | 'EditCustomer';
  defaultValues: Customer;
};

export default function CustomerForm({ type, defaultValues }: Props) {
  const { mutate: createCustomer } = useCreateCustomer();
  const { mutate: editCustomer } = useEditCustomer();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });
  console.log('defaultValues:', defaultValues);

  const onSubmit = (data: Customer) => {
    console.log('onSubmit data:', data);
    if (type === 'NewCustomer') {
      createCustomer(data, {
        onSuccess: () => {
          reset();
          toast.success('Customer created');
          navigate('/customers');
        },
        onError: (err) => {
          console.error(err);
          toast.error('Could not create customer, try again');
        },
      });
    } else if (type === 'EditCustomer') {
      console.log('onSubmit editCustomer data:', data);
      editCustomer(
        { customerId: data.id, data: data },
        {
          onSuccess: () => {
            reset();
            toast.success('Changes saved');
            navigate('/customers');
          },
          onError: (err) => {
            toast.error('Could not save customer - try again');
            console.error(err);
          },
        }
      );
    }
  };

  const onCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    navigate('/customers');
  };

  return (
    <div className="w-full">
      <div className="bg-white px-6 py-8 rounded-xl">
        <form
          className="flex flex-col w-full"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(onSubmit)(event);
          }}
        >
          {/* looks like we don't need to register it as it stillget sent ? */}
          {/* <input type="text" hidden disabled {...register('id')} /> */}
          <FormInput {...register('name')} label="Name" error={errors.name} />
          <FormInput
            {...register('email')}
            label="Email"
            type="email"
            error={errors.email}
          />
          <FormInput
            {...register('address.line1')}
            label="Address line 1"
            error={errors.address?.line1}
          />
          <FormInput
            {...register('address.line2')}
            label="Address line 2 (optional)"
            error={errors.address?.line2}
          />
          <FormInput
            {...register('address.city')}
            label="City / Town"
            error={errors.address?.city}
          />
          <FormInput
            {...register('address.county')}
            label="County (optional)"
            error={errors.address?.county}
          />
          <FormInput
            {...register('address.postcode')}
            label="Postcode"
            error={errors.address?.postcode}
          />
          <div className="flex justify-between gap-4 mt-10">
            <Button label="Cancel" onClick={onCancel} variant="tertiary" />
            <Button
              label={type === 'NewCustomer' ? 'Add customer' : 'Save changes'}
              type="submit"
            />
          </div>
        </form>
      </div>
      {import.meta.env.DEV && <DevTool control={control} />}
    </div>
  );
}

