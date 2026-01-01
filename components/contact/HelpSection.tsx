export default function HelpSection() {
  const helpItems = [
    {
      icon: 'fas fa-tools',
      title: 'Technical Support',
      description: 'Having issues with the QR code generator? We\'re here to help troubleshoot and resolve any technical problems.',
    },
    {
      icon: 'fas fa-lightbulb',
      title: 'Feature Requests',
      description: 'Have an idea for a new feature? We\'d love to hear your suggestions to make QR Junction even better.',
    },
    {
      icon: 'fas fa-bug',
      title: 'Report Bugs',
      description: 'Found a bug? Please let us know so we can fix it and improve the service for everyone.',
    },
    {
      icon: 'fas fa-handshake',
      title: 'Business Inquiries',
      description: 'Interested in partnerships, collaborations, or business opportunities? Get in touch with us.',
    },
  ];

  return (
    <div className="mt-12 sm:mt-16 p-6 sm:p-10 bg-slate-50 rounded-lg">
      <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-8 sm:mb-12">
        How Can We Help?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {helpItems.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center hover:-translate-y-1 transition-all"
          >
            <i className={`${item.icon} text-3xl sm:text-4xl text-primary mb-3 sm:mb-4`}></i>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

