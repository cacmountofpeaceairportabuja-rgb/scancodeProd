import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-white pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Turn Every Scan into a <span className="text-green-600">Smart Experience</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Create QR codes for Menus, Business cards, Payments and More... all in a second
          </p>
        </div>

        {/* Hero Image  */}
        <div className="flex justify-center">
          <div className="relative max-w-5xl w-full">
            <Image
              src="/image45.png"
              alt="Turn Every Scan into a Smart Experience"
              width={1200}
              height={700}
              className="object-contain mx-auto drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
          <Link
            href="/templates"
            className="px-8 py-4 text-base font-medium text-gray-700 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
          >
            View Template
          </Link>
          
          <Link
            href="/create"
            className="px-8 py-4 text-base font-semibold bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all active:scale-95 shadow-sm"
          >
            Create QR Code
          </Link>
        </div>
      </div>
    </section>
  );
}