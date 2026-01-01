export default function Features() {
  const features = [
    {
      icon: 'fas fa-bolt',
      title: 'Instant Generation',
      description: 'Generate QR codes instantly without any delays or waiting times.',
    },
    {
      icon: 'fas fa-shield-alt',
      title: '100% Private',
      description: 'All processing happens locally in your browser. Your data never leaves your device.',
    },
    {
      icon: 'fas fa-infinity',
      title: 'Unlimited QR Codes',
      description: 'Generate as many QR codes as you need without any restrictions or limits.',
    },
    {
      icon: 'fas fa-download',
      title: 'Easy Download',
      description: 'Download your QR codes in high-quality PNG format instantly.',
    },
    {
      icon: 'fas fa-palette',
      title: 'Multiple Sizes',
      description: 'Choose from various sizes to fit your specific needs and use cases.',
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices - desktop, tablet, and mobile phones.',
    },
  ];

  return (
    <section className="p-8 sm:p-12 md:p-16 bg-gradient-to-br from-slate-50 to-slate-200 rounded-lg shadow-2xl mt-8 sm:mt-10">
      <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-8 sm:mb-12">
        Key Features
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 sm:p-8 rounded-lg text-center shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 gradient-primary rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl">
              <i className={feature.icon}></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
              {feature.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

