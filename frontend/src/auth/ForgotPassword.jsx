import React, { useState } from 'react';
import { forgotPassword } from '../api/auth';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const res = await forgotPassword(email);
      if (res.message && res.message.includes('sent')) {
        toast.success('Password reset email sent! Check your inbox.');
        setEmail(''); // Clear the form
      } else {
        toast.error(res.message || 'Failed to send reset email.');
      }
    } catch (error) {
      toast.error('An error occurred while sending reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-10 text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Forgot Password</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 px-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            disabled={isLoading}
          />
          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
        <div className="mt-4 sm:mt-6 text-sm">
          <a href="/login" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}