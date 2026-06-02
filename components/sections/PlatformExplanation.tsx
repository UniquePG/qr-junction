import React from 'react';
import Image from 'next/image';

export default function PlatformExplanation() {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-30 -z-10"></div>

      <div className="max-w-7xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
          <span className="bg-gradient-to-r from-primary via-slate-100 to-accent bg-clip-text text-transparent">
            Why Choose QR Junction?
          </span>
        </h2>

        <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mb-16">
          A powerful, modern, and flexible dynamic QR platform designed to give you complete control with real-time scan metrics, conversion attribution, and zero design friction.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <Image
                  src="/assests/versetile-qrcode.png"
                  alt="Versatile QR Codes"
                  fill
                  className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4 text-white">
              Dynamic &amp; Static Routing
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed">
              Generate QR codes for text, contacts, phone calls, WiFi, and social channels, and upgrade static elements to dynamic redirect links that you can edit anytime after printing.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-lg hover:shadow-secondary/5 hover:border-secondary/30 transition-all duration-300 hover:-translate-y-2">
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <Image
                  src="/assests/customization.png"
                  alt="Flexible Customization"
                  fill
                  className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4 text-white">
              Premium Styling Controls
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed">
              Personalize corner squares, dot scales, backgrounds, and margin scales. Embed business brand logos inside the QR pattern with auto-calculated error-correction.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <Image
                  src="/assests/userfriendly-reliable.png"
                  alt="User-Friendly & Reliable"
                  fill
                  className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4 text-white">
              Advanced Scan Analytics
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed">
              Understand visitor technology trends, OS systems, geo-location scan heatmaps, referrers, unique visitor indexes, lead generation forms, and ROI conversion rates.
            </p>
          </div>
        </div>

        {/* Bottom Description */}
        <div className="mt-16 max-w-4xl mx-auto border-t border-slate-900/80 pt-10">
          <p className="text-slate-400 text-sm leading-relaxed">
            QR Junction helps you create professional QR codes instantly. Whether you are running print marketing campaigns, collecting subscriber leads, managing office WiFi, or sharing digital portfolio cards, our platform provides complete flexibility, campaign security, and vector quality downloads.
          </p>
        </div>
      </div>
    </section>
  );
}
