import Image from "next/image";

export default function PlatformExplanation() {
  return (
    <section className="relative py-20 px-6  overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>

      <div className="max-w-7xl mx-auto text-center">
        
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Why Choose Ultimate QR Code Generator?
          </span>
        </h2>

        <p className="text-gray-600 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mb-16">
          A powerful, modern, and flexible QR platform designed to give you complete control with
          simplicity and premium experience.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="group bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <Image
                  src="/assests/versetile-qrcode.png"
                  alt="Versatile QR Codes"
                  fill
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Versatile QR Codes
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Generate QR codes for text, contacts, phone numbers, WiFi, and
              social platforms like Instagram, Facebook, WhatsApp, Telegram,
              SMS, email and more — all in one place.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <Image
                  src="/assests/customization.png"
                  alt="Flexible Customization"
                  fill
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Flexible Customization
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Personalize your QR codes with custom sizes, styling, and layout
              adjustments to perfectly match digital or printed use cases.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <Image
                  src="/assests/userfriendly-reliable.png"
                  alt="User-Friendly & Reliable"
                  fill
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              User-Friendly & Reliable
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Experience a smooth, secure and dependable QR generation process
              designed for speed, simplicity and confidence.
            </p>
          </div>
        </div>

        {/* Bottom Description */}
        <div className="mt-16 max-w-4xl mx-auto">
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Ultimate QR Code Generator helps you create professional QR codes
            instantly. Whether {`it's for social media sharing, contact exchange,
            or secure WiFi access, our platform provides flexibility,
            reliability, and premium quality downloads.`}
          </p>
        </div>

      </div>
    </section>
  );
}
