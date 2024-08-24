import { useForm } from 'react-hook-form';
import { createUser } from '../api/users';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FormInput } from './ui/FormInput';
import { SignupInput, signupSchema } from '../schemas/signup.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from './ui/Button';
import ExclamationIcon from './icons/ExclamationIcon';

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: SignupInput) => {
    console.log('signup', data);
    try {
      await createUser(data);
      toast.success('Sign up successful!');
      navigate('/login');
    } catch (err) {
      if (
        err instanceof Error &&
        err.message &&
        err.message.indexOf('E11000')
      ) {
        setError('root', {
          type: 'api_error',
          message: 'Email address already registered',
        });
      } else {
        toast.error('An error ocurred, try again');
      }
    }
  };

  return (
    <div className="bg-gray-200 p-8 -mt-36">
      <h1 className="text-4xl font-bold text-gray-500 mb-10">Sign up</h1>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(onSubmit)(event);
        }}
      >
        {errors.root && (
          <div
            role="alert"
            className="flex gap-2 items-center bg-red-200 text-red-500 font-bold px-6 py-4 text-sm mb-4 rounded-md border border-red-300"
          >
            <ExclamationIcon />
            {errors.root.message}
          </div>
        )}
        <FormInput {...register('name')} label="Name" error={errors.name} />
        <FormInput
          {...register('email')}
          label="Email"
          type="email"
          error={errors.email}
        />
        <FormInput
          {...register('password')}
          label="Password"
          type="Password"
          error={errors.password}
        />
        <FormInput
          {...register('passwordConfirmation')}
          label="Confirm password"
          type="password"
          error={errors.passwordConfirmation}
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
        <Button label="Sign up" type="submit" />
      </form>
      <h2 className="mt-8 text-lg text-zinc-500">
        Already have an account?&nbsp;
        <Link
          to="/login"
          className="text-black font-medium hover:underline underline-offset-2"
        >
          Log in
        </Link>
        .
      </h2>
    </div>
  );
}

