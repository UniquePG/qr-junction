export default function UseCases() {
  const useCases = [
    {
      icon: 'fas fa-store',
      title: 'Business Cards',
      description: 'Share your contact information instantly with QR code-enabled business cards.',
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Social Media',
      description: 'Connect your social media profiles and grow your online presence with QR codes.',
    },
    {
      icon: 'fas fa-wifi',
      title: 'WiFi Sharing',
      description: 'Share WiFi credentials easily with guests without revealing passwords.',
    },
    {
      icon: 'fas fa-shopping-cart',
      title: 'Marketing',
      description: 'Enhance your marketing campaigns with QR codes linking to promotions and products.',
    },
    {
      icon: 'fas fa-calendar-alt',
      title: 'Events',
      description: 'Share event details, tickets, and registration links with QR codes.',
    },
    {
      icon: 'fas fa-file-alt',
      title: 'Documentation',
      description: 'Link to manuals, guides, and documentation for easy access.',
    },
  ];

  return (
    <section className="p-8 sm:p-12 md:p-16 bg-white rounded-lg shadow-2xl mt-8 sm:mt-10">
      <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-8 sm:mb-12">
        Popular Use Cases for QR Codes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {useCases.map((useCase, index) => (
          <div
            key={index}
            className="text-center p-6 sm:p-8 bg-slate-50 rounded-lg hover:-translate-y-1 transition-all"
          >
            <i className={`${useCase.icon} text-4xl sm:text-5xl text-primary mb-4 sm:mb-5`}></i>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
              {useCase.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

