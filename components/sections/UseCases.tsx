import React from 'react';

export default function UseCases() {
  const useCases = [
    {
      icon: 'fas fa-id-card',
      title: 'Digital Business Cards',
      description: 'Share contact details instantly with vCard QR codes printed on your physical business cards.',
    },
    {
      icon: 'fas fa-share-alt',
      title: 'Social Hub Redirects',
      description: 'Connect all your media profiles (Instagram, LinkedIn, X) to grow your social audience.',
    },
    {
      icon: 'fas fa-wifi',
      title: 'Seamless WiFi Sharing',
      description: 'Share secure local internet access with guests without typing or exposing network passwords.',
    },
    {
      icon: 'fas fa-bullhorn',
      title: 'Marketing Flyers',
      description: 'Print static QR layouts on menus, flyers, and stands and track scans dynamically.',
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Event Invitations',
      description: 'Link ticket registries, maps, schedules, and reminders directly to your paper flyers.',
    },
    {
      icon: 'fas fa-file-pdf',
      title: 'PDF Documentation',
      description: 'Give users immediate mobile access to catalogs, instruction manuals, or restaurant menus.',
    },
  ];

  return (
    <section id="usecases" className="p-8 sm:p-12 md:p-16 bg-slate-900/20 border border-slate-900 rounded-3xl mt-16 relative overflow-hidden">
      {/* Background glow blob */}
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 blur-[100px] pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
          Scenarios
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-4">
          Built for Diverse Business Use Cases
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Bridge the gap between offline items and online conversions instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {useCases.map((useCase, index) => (
          <div
            key={index}
            className="text-center p-6 sm:p-8 bg-slate-950/40 border border-slate-850 hover:border-secondary/30 rounded-2xl hover:-translate-y-1 transition-all group shadow-md"
          >
            <div className="inline-flex p-4 bg-secondary/10 border border-secondary/20 text-secondary rounded-2xl text-3xl mb-5 group-hover:scale-105 transition-transform">
              <i className={useCase.icon}></i>
            </div>
            <h3 className="text-lg font-bold mb-2.5 text-white">
              {useCase.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
