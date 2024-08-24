import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { FormInput } from './ui/FormInput';
import Button from './ui/Button';
import { LoginInput, loginSchema } from '../schemas/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import ExclamationIcon from './icons/ExclamationIcon';
import { useState } from 'react';
import PasswordHiddenIcon from './icons/PasswordHiddenIcon';
import PasswordVisibleIcon from './icons/PasswordVisibleIcon';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginInput) => {
    console.log('login', data);

    try {
      setLoading(true);
      await login(data.email, data.password);
    } catch (err) {
      setLoading(false);
      console.error(err);
      if (err instanceof AxiosError && err?.response?.status === 401) {
        setError('root', {
          type: 'api_error',
          message: 'Incorrect username or password',
        });
      } else {
        toast.error('An error occurred, try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 p-8 -mt-32">
      <h1 className="text-4xl font-bold text-gray-500 mb-10">Log in</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(onSubmit)(event);
        }}
      >
        {/* demo login details */}
        <div className="flex gap-2 items-center bg-blue-200 text-blue-500  px-6 py-4 text-sm mb-4 rounded-md border border-blue-300">
          <div className="self-start">
            <ExclamationIcon />
          </div>

          <details>
            <summary className="cursor-pointer hover:underline font-bold">
              Just want to try the demo?
            </summary>
            <div className="ml-4 mt-2">
              Email: <span className="font-bold">demo@mint.app</span>
              <br />
              Password: <span className="font-bold">Demo1234</span>
            </div>
          </details>
        </div>
        {/* end demo login details */}

        {errors.root && (
          <div
            role="alert"
            className="flex gap-2 items-center bg-red-200 text-red-500 font-bold px-6 py-4 text-sm mb-4 rounded-md border border-red-300"
          >
            <ExclamationIcon />
            {errors.root.message}
          </div>
        )}
        <FormInput {...register('email')} label="Email" error={errors.email} />
        <div className="relative">
          <FormInput
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            error={errors.password}
          />
          <div className="absolute right-4 top-[34px]">
            <input
              className="hidden"
              id="showPassword"
              type="checkbox"
              value={String(showPassword)}
              onChange={() => setShowPassword((prev) => !prev)}
            />
            <label
              htmlFor="showPassword"
              className="cursor-pointer text-gray-400"
            >
              <span className="sr-only">Toggle show password</span>
              {showPassword ? <PasswordVisibleIcon /> : <PasswordHiddenIcon />}
            </label>
          </div>
        </div>
        <Button
          label="Log in"
          type="submit"
          loading={loading}
          disabled={loading}
        />
      </form>
      <h2 className="mt-8 text-lg text-gray-500">
        Don&apos;t have an account?&nbsp;
        <Link
          to="/signup"
          className="text-black font-medium hover:underline underline-offset-2"
        >
          Sign up
        </Link>
        .
      </h2>
    </div>
  );
}

