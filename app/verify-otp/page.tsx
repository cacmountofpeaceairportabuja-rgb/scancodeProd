'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.verifyOtp(email.trim(), otp.trim());
      setSuccess(res.message || 'Email verified successfully.');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setError('');
    setSuccess('');
    setResending(true);
    try {
      const res = await api.resendOtp(email.trim());
      setSuccess(res.message || 'A new code has been sent.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not resend code. Please try again.';
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-black mb-2">Enter verification code</h1>
          <p className="text-black">We sent a 6-digit code to your email. Enter it below to verify your account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl border border-green-200 bg-green-50 text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 text-black placeholder:text-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 text-black placeholder:text-gray-500 text-center text-2xl tracking-[0.5em] font-semibold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition-colors text-lg disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-green-600 hover:underline font-medium disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </p>

        <p className="text-center mt-6 text-black">
          <Link href="/login" className="text-green-600 font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
