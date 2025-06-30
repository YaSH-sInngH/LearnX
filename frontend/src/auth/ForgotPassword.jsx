import React, { useState } from 'react';
import { forgotPassword } from '../api/auth';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="w-full mb-2 p-2 border rounded" 
          required 
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div className="mt-2 text-sm">
        <a href="/login" className="text-blue-600">Back to Login</a>
      </div>
    </div>
  );
} 