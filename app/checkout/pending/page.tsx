'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutOrder, getCheckoutOrder, saveCheckoutOrder } from '@/lib/storeData';

export default function CheckoutPendingRoom() {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [order, setOrder] = useState<CheckoutOrder | null>(() => getCheckoutOrder());

  const handleNotifyMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Checkbox State Validation
    if (!userChecked) {
      setFeedback('You must confirm that you have initiated the manual bank transfer request before updating status flags.');
      return;
    }

    setNotifying(true);

    // Simulate database update callback validation
    setTimeout(() => {
      setNotifying(false);
      setIsConfirmed(true);
      if (order) {
        const updatedOrder: CheckoutOrder = { ...order, status: 'customer_notified' };
        setOrder(updatedOrder);
        saveCheckoutOrder(updatedOrder);
      }
    }, 2000);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6 text-black">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold">No Pending Checkout</h1>
          <p className="text-sm text-gray-500">Start from the store page so your order details can be prepared.</p>
          <button
            type="button"
            onClick={() => router.push('/store/newBusiness')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            Go to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6 text-black">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center space-y-6">
        
        {!isConfirmed ? (
          <>
            {/* WAITING LOCK STATE */}
            <div className="mx-auto w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
            <div>
              <h1 className="text-2xl font-semibold">Pending Payment Verification</h1>
              <p className="text-gray-500 text-sm mt-2">Please perform your manual settlement to the bank account listed below</p>
            </div>

            {feedback && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-2xl text-left">
                {feedback}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400 block tracking-wider">Settlement Target Amount</span>
                <span className="text-2xl font-bold text-green-600">₦{order.total.toLocaleString()}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="text-sm space-y-1">
                <p><span className="text-gray-500">Receiving Bank:</span> {order.bankName}</p>
                <p><span className="text-gray-500">Account Number:</span> {order.accountNumber}</p>
                <p><span className="text-gray-500">Account Name:</span> {order.accountName}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-left text-sm space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <span>{item.name} x{item.qty}</span>
                  <span className="whitespace-nowrap">₦{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between text-gray-500">
                <span>VAT</span>
                <span>₦{order.vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>₦{order.delivery.toLocaleString()}</span>
              </div>
            </div>

            {/* Validation Check Trigger */}
            <form onSubmit={handleNotifyMerchant} className="space-y-4 text-left">
              <label className="flex items-start gap-3 cursor-pointer text-sm text-black select-none">
                <input 
                  type="checkbox" 
                  checked={userChecked}
                  onChange={(e) => { setUserChecked(e.target.checked); setFeedback(null); }}
                  className="w-5 h-5 accent-green-600 rounded border-gray-300 mt-0.5 flex-shrink-0 cursor-pointer" 
                />
                <span>I confirm that I have transferred exactly ₦{order.total.toLocaleString()} from my banking app into the target account detailed above.</span>
              </label>

              <button type="submit" disabled={notifying} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition-colors text-center text-md">
                {notifying ? 'Notifying Merchant Streams...' : 'I Have Transferred Payment'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* COMPLETED SUCCESS STATE */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl font-bold">
              ✓
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-black">Payment Confirmed</h1>
              <p className="text-gray-500 text-sm mt-2">Your manual transfer receipt has been verified and processed successfully.</p>
            </div>
            <div className="bg-green-50/50 border border-green-200 rounded-2xl p-4 text-sm text-green-800 text-left">
              Receipt reference token generated. Your products are packing for shipment fulfillment updates.
            </div>
            <button 
              type="button" 
              onClick={() => router.push('/')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl transition-colors"
            >
              Return to Landing Channel
            </button>
          </>
        )}

      </div>
    </div>
  );
}
