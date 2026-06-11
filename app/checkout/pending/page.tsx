'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCheckoutOrder, saveCheckoutOrder, CheckoutOrder } from '@/lib/storeData';

export default function CheckoutPendingPage() {
  const router = useRouter();
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync and monitor live transaction status updates from the admin pane
  useEffect(() => {
    setOrder(getCheckoutOrder());

    const handleStorageSync = (e: StorageEvent) => {
      // Re-hydrate order tracking data when mutations hit local storage pools
      if (e.key === 'scancode.checkoutOrder' && e.newValue) {
        try {
          setOrder(JSON.parse(e.newValue) as CheckoutOrder);
        } catch (err) {
          console.error("Failed to parse incoming checkout sync state", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const handleCopyAccount = async () => {
    if (!order?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(order.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy account number data', err);
    }
  };

  const handleIHavePaid = () => {
    if (!order) return;
    
    const updatedOrder: CheckoutOrder = {
      ...order,
      status: 'customer_notified',
    };

    setOrder(updatedOrder);
    saveCheckoutOrder(updatedOrder);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
          <p className="text-gray-500 text-sm">No active session invoice found.</p>
          <button 
            type="button"
            onClick={() => router.push('/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Dynamic milestone generation state mapping
  const currentStatus = order.status;
  const isPaidConfirmed = currentStatus === 'confirmed';
  const isNotified = currentStatus === 'customer_notified' || isPaidConfirmed;

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col items-center justify-start py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Progress Tracker Widget Block */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold">Secure Checkout Invoice</h1>
            <p className="text-xs text-gray-500 mt-1">Order Ref: {order.id}</p>
          </div>

          {/* Stepper Node Tree Line */}
          <div className="relative flex justify-between items-center max-w-xs mx-auto pt-2">
            {/* Background connecting bar tracking */}
            <div className="absolute top-3.5 left-0 right-0 h-1 bg-gray-200 z-0 rounded-full" />
            <div 
              className="absolute top-3.5 left-0 h-1 bg-green-600 z-0 rounded-full transition-all duration-500" 
              style={{ width: isPaidConfirmed ? '100%' : isNotified ? '50%' : '0%' }}
            />

            {/* Step 1: Base Allocation initialized */}
            <div className="relative z-10 flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">✓</div>
              <span className="text-[11px] font-medium text-gray-600">Generated</span>
            </div>

            {/* Step 2: Customer Flags Funds Dispatched */}
            <div className="relative z-10 flex flex-col items-center space-y-1">
              <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-300 shadow-sm ${isNotified ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {isPaidConfirmed ? '✓' : '2'}
              </div>
              <span className={`text-[11px] font-medium ${isNotified ? 'text-gray-600' : 'text-gray-400'}`}>Transfer Sent</span>
            </div>

            {/* Step 3: Vendor Signs Off Ledger Clearance */}
            <div className="relative z-10 flex flex-col items-center space-y-1">
              <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-300 shadow-sm ${isPaidConfirmed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {isPaidConfirmed ? '✓' : '3'}
              </div>
              <span className={`text-[11px] font-medium ${isPaidConfirmed ? 'text-gray-600' : 'text-gray-400'}`}>Confirmed</span>
            </div>
          </div>
        </div>

        {/* Banking Node Route Parameters Breakdown */}
        {!isPaidConfirmed && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
            <h3 className="font-semibold text-sm sm:text-base border-b border-gray-100 pb-2">Manual Bank Settlement Instructions</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Please complete a direct bank transfer for the exact amount below to the vendor account credentials listed here:
            </p>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Bank Institution:</span><span className="font-semibold">{order.bankName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Beneficiary Name:</span><span className="font-semibold">{order.accountName}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold tracking-wider">{order.accountNumber}</span>
                  <button 
                    type="button" 
                    onClick={handleCopyAccount}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {currentStatus === 'pending' ? (
              <button
                type="button"
                onClick={handleIHavePaid}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base"
              >
                I Have Made This Transfer
              </button>
            ) : (
              <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-medium p-4 rounded-xl sm:rounded-2xl text-center">
                ⏳ Merchant has been notified. Awaiting validation loop confirmation...
              </div>
            )}
          </div>
        )}

        {/* Invoice Item Breakdown Manifest */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
          <h3 className="font-semibold text-sm sm:text-base border-b border-gray-100 pb-2">Order Summary</h3>
          
          <div className="space-y-3 text-xs sm:text-sm max-h-40 overflow-y-auto pr-1">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-black truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Qty: {item.qty} units</p>
                </div>
                <span className="font-medium text-gray-700 flex-shrink-0">₦{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 border border-gray-100 pt-3">
            <div className="flex justify-between text-gray-500"><span>Items Subtotal</span><span>₦{order.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500"><span>VAT Settlement</span><span>+ ₦{order.vat.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500"><span>Logistics Fee</span><span>+ ₦{order.delivery.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 text-black">
              <span>Grand Total</span>
              <span className="text-green-600">₦{order.total.toLocaleString()}</span>
            </div>
          </div>

          {isPaidConfirmed && (
            <div className="space-y-3 pt-2">
              <div className="bg-green-50 border border-green-200 text-green-800 font-medium p-4 rounded-xl sm:rounded-2xl text-center text-sm">
                ✓ Payment Verified! Your storefront order has cleared processing successfully.
              </div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-4 rounded-xl sm:rounded-2xl transition-colors text-sm"
              >
                Return to Storefront Home
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}