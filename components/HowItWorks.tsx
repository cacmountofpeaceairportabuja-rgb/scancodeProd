export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">How it works</h2>
          <div className="h-1 w-16 bg-green-600 mx-auto mt-3 rounded"></div>
        </div>

        {/* Steps - Card Layout */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Step 1 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl font-semibold flex-shrink-0">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                Create your QR Code
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-right md:text-justify">
              Select your QR code type, enter your information, and customize the design to match your brand.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl font-semibold flex-shrink-0">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                Share your QR Code
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-right md:text-justify">
              Download or print your QR code and share it on business cards, menus, flyers and posters.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl font-semibold flex-shrink-0">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                Track & Manage
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-right md:text-justify">
              Monitor scans and get real-time analytics, manage and edit your QR codes anytime from your dashboard.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}