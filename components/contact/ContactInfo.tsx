import Link from 'next/link';

export default function ContactInfo() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 gradient-primary rounded-full flex items-center justify-center text-white text-xl sm:text-2xl">
          <i className="fas fa-envelope"></i>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Email Us</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 leading-relaxed">
          Send us an email and we&apos;ll respond as soon as possible.
        </p>
        <a
          href="mailto:uniquetechexplorer7@gmail.com"
          className="text-primary hover:text-accent font-semibold transition-colors text-sm sm:text-base"
        >
          uniquetechexplorer7@gmail.com
        </a>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 gradient-primary rounded-full flex items-center justify-center text-white text-xl sm:text-2xl">
          <i className="fas fa-clock"></i>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Response Time</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          We typically respond within 24-48 hours during business days.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 gradient-primary rounded-full flex items-center justify-center text-white text-xl sm:text-2xl">
          <i className="fas fa-question-circle"></i>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Before You Contact</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Check out our{' '}
          <Link href="/faq" className="text-primary hover:underline font-semibold">
            FAQ page
          </Link>{' '}
          - you might find the answer you&apos;re looking for!
        </p>
      </div>
    </div>
  );
}

