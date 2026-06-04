export default function UseCases() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Templates</h2>
          <div className="h-1 w-16 bg-green-600 mx-auto mt-3 rounded"></div>
        </div>
        
        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="relative h-56">
              <img 
                src="/image16.png" 
                alt="Restaurant Menu QR Code"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Restaurant Menu
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Let customers access your menu instantly with their phones. No more printing costs.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-2xl transition-colors">
                Select
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="relative h-56">
              <img 
                src="/image59.jpg" 
                alt="Business Card QR Code"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Business Card
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Share your contact information instantly without handing out physical cards.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-2xl transition-colors">
                Select
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="relative h-56">
              <img 
                src="/image9.png" 
                alt="Event Access QR Code"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Access Page
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Create event pages, guest check-in, or exclusive content with one scan.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-2xl transition-colors">
                Select
              </button>
            </div>
          </div>

        </div>

        {/* View More Button  */}
        <div className="mt-12 flex justify-center md:justify-end">
          <button className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-300">
            View More
          </button>
        </div>

      </div>
    </section>
  );
}