import React from 'react';

export default function Features() {
  const features = [
    {
      icon: 'fas fa-bolt',
      title: 'Instant Generation',
      description: 'Generate dynamic QR codes instantly without any delays or wait times.',
    },
    {
      icon: 'fas fa-shield-alt',
      title: '100% Secure',
      description: 'Enterprise-grade encryption and Firebase security keep your data protected.',
    },
    {
      icon: 'fas fa-infinity',
      title: 'Unlimited QR Tracking',
      description: 'Create and monitor as many dynamic campaigns as your growth requires.',
    },
    {
      icon: 'fas fa-download',
      title: 'Vector Downloads',
      description: 'Download QR codes in high-resolution PNG or SVG vector formats instantly.',
    },
    {
      icon: 'fas fa-palette',
      title: 'Fully Customizable',
      description: 'Adjust corner dots, eye framing shapes, preset colors, and embed logos.',
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Dynamic Redirection',
      description: 'Scan on mobile, update routing destinations instantly from your dashboard.',
    },
  ];

  return (
    <section id="features" className="p-8 sm:p-12 md:p-16 bg-slate-900/20 border border-slate-900 rounded-3xl mt-16 relative overflow-hidden">
      {/* Glow highlight blob */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/15 px-3 py-1 rounded-full border border-secondary/20">
          Core Capabilities
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-4">
          Everything You Need to Power Offline Campaigns
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          From high-fidelity designer elements to dynamic geo-tracking redirection systems.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-slate-950/40 border border-slate-850 hover:border-primary/30 p-6 sm:p-8 rounded-2xl text-center shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
              <i className={feature.icon}></i>
            </div>
            <h3 className="text-lg font-bold mb-2.5 text-white">
              {feature.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
