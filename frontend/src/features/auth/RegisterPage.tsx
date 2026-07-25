import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../../api/auth.api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '../../stores/toastStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null);
    try {
      await authApi.register(data);
      toast.success('Account created successfully! Please sign in.', 'Registration Complete');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration failed', error);
      const errMsg = error.response?.data?.message || 'Registration failed. An account with this email may already exist.';
      setApiError(errMsg);
      toast.error(errMsg, 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-md p-8 bg-surface-900 rounded-xl shadow-lg border border-surface-800">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">Create Account</h2>

        {apiError && (
          <div className="mb-5 p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-red-100 mb-0.5">Registration Error</p>
              <p className="text-xs text-red-300/90">{apiError}</p>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-red-400 hover:text-red-200 p-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2 bg-surface-950 border border-surface-800 rounded-lg focus:ring-2 focus:ring-brand-500 text-white"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 bg-surface-950 border border-surface-800 rounded-lg focus:ring-2 focus:ring-brand-500 text-white"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-2 bg-surface-950 border border-surface-800 rounded-lg focus:ring-2 focus:ring-brand-500 text-white"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-brand-500/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-500 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
