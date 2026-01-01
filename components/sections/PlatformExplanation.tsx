import Image from 'next/image';

export default function PlatformExplanation() {
  return (
    <section className="text-center p-6 sm:p-8 md:p-10 bg-slate-50 rounded-lg shadow-2xl mt-12 sm:mt-16 md:mt-20 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8">
        Why Choose Ultimate QR Code Generator?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-lg hover:-translate-y-1 transition-all">
          <Image
            src="/assests/versetile1.png"
            alt="Versatile QR Codes"
            width={185}
            height={185}
            className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4"
            priority
          />
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
            Versatile QR Codes
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Create QR codes for a variety of purposes—whether it&apos;s text, contacts, phone numbers, or social media platforms like Instagram, Facebook, Telegram, WhatsApp, SMS, email, WiFi, and more.
          </p>
        </div>
        <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-lg hover:-translate-y-1 transition-all">
          <Image
            src="/assests/flexible1.png"
            alt="Flexible Customization"
            width={185}
            height={185}
            className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4"
            priority
          />
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
            Flexible Customization
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Tailor your QR code to suit your needs. Choose from multiple sizes to ensure your QR code fits perfectly in any context, from digital sharing to printed media.
          </p>
        </div>
        <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-lg hover:-translate-y-1 transition-all">
          <Image
            src="/assests/reliable1.png"
            alt="User-Friendly & Reliable"
            width={185}
            height={185}
            className="w-32 sm:w-40 md:w-48 h-auto mx-auto mb-4"
            priority
          />
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
            User-Friendly & Reliable
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Enjoy a straightforward and secure experience. Our platform is built with simplicity and dependability in mind, so you can generate QR codes with confidence.
          </p>
        </div>
      </div>
      <p className="mt-8 sm:mt-10 text-sm sm:text-base text-gray-600 leading-relaxed max-w-4xl mx-auto px-4">
        Ultimate QR Code Generator is your go-to tool for creating professional QR codes quickly and easily. Whether you need codes for social media, contact sharing, or secure WiFi access, our platform offers versatile options and flexible downloads in various sizes to meet your specific requirements.
      </p>
    </section>
  );
}

