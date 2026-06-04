'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center">
        
       
        <div className="mx-auto mb-8 w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center">
          <div className="relative w-16 h-16">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 64 64" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              
              <rect 
                x="12" 
                y="28" 
                width="40" 
                height="32" 
                rx="6" 
                fill="#10B981" 
              />
              
              <path 
                d="M20 28 V18 C20 10 28 6 32 6 C36 6 44 10 44 18 V28" 
                stroke="#10B981" 
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="none" 
              />
              
              <text 
                x="32" 
                y="47" 
                textAnchor="middle" 
                fill="white" 
                fontSize="26" 
                fontWeight="bold"
              >
                ?
              </text>
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-black mb-3">Forgot Password?</h1>
        <p className="text-black mb-10 text-[15px]">
          Enter your email below and we will send you<br />
          a link to reset your password.
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div className="text-left">
              <label className="block text-sm font-medium text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 transition-colors text-black placeholder:text-gray-500"
                required
              />
            </div>

            {/* Send Request Link Button */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors text-lg"
            >
              Send Request Link
            </button>
          </form>
        ) : (
          /* Success State */
          <div className="py-8">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-black mb-3">Link Sent!</h2>
            <p className="text-black text-[15px]">
              If an account exists with that email, you will receive a password reset link shortly.
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-10">
          <Link 
            href="/login" 
            className="text-green-600 font-medium hover:underline text-sm flex items-center justify-center gap-1"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}