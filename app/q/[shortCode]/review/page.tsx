'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Star, Send, Loader2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReviewLandingPage() {
  const { shortCode } = useParams() as { shortCode: string };
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<any>(null);
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedReviewId, setSubmittedReviewId] = useState<number | null>(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await fetch(`/api/qrs/public/${shortCode}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setQrCode(data.qrCode);

        // Check local storage to see if user has already reviewed this QR code
        const alreadyReviewed = localStorage.getItem(`reviewed_${data.qrCode.id}`) === 'true';
        if (alreadyReviewed) {
          setSubmitted(true);
        }
      } catch (error) {
        console.error(error);
        toast.error('Unable to load review page.');
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading your experience...</p>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Page Not Found</h2>
          <p className="text-slate-400 text-sm">The review link you followed is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const dest = qrCode.destination || {};
  const businessName = dest.businessName || 'Us';
  const logoUrl = dest.logoUrl || qrCode.logoUrl;
  const primaryColor = qrCode.fgColor || '#3b82f6'; // Fallback to blue-500
  let publicReviewUrl = dest.publicReviewUrl || 'https://google.com';
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const activeHost = window.location.host;
    publicReviewUrl = publicReviewUrl.replace('localhost:3000', activeHost).replace('127.0.0.1:3000', activeHost);
  } else if (process.env.NODE_ENV === 'production') {
    publicReviewUrl = publicReviewUrl.replace('localhost:3000', 'qrjunction.in').replace('127.0.0.1:3000', 'qrjunction.in');
  }

  // Custom configurations
  const positiveThreshold = dest.positiveThreshold ?? 4;
  const welcomeMessage = dest.welcomeMessage || 'How was your experience?';
  const privateFeedbackMessage = dest.privateFeedbackMessage || "We are sorry to hear that your experience wasn't perfect. Please let us know how we can improve.";
  const thankYouMessage = dest.thankYouMessage || 'Your feedback has been submitted successfully. We appreciate your time and will use this to improve our service.';
  
  const handleRatingClick = async (rate: number) => {
    if (submitted || submitting) return;
    setRating(rate);

    if (rate >= positiveThreshold) {
      setSubmitting(true);
      try {
        const payload: any = {
          qrCodeId: qrCode.id,
          rating: rate,
          feedback: '',
          name: '',
          phone: '',
        };
        if (submittedReviewId) {
          payload.id = submittedReviewId;
        }

        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Submission failed');
        const json = await res.json();
        if (json.reviewResponse?.id) {
          setSubmittedReviewId(json.reviewResponse.id);
        }
      } catch (error) {
        console.error('Failed to submit positive rating:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePublicReviewClick = () => {
    if (qrCode) {
      localStorage.setItem(`reviewed_${qrCode.id}`, 'true');
    }
    setSubmitted(true);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        qrCodeId: qrCode.id,
        rating,
        feedback,
        name,
        phone
      };
      if (submittedReviewId) {
        payload.id = submittedReviewId;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Submission failed');
      
      localStorage.setItem(`reviewed_${qrCode.id}`, 'true');
      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-16 px-6 relative overflow-hidden font-sans select-none">
      
      {/* Decorative premium gradient blob meshes */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none transition-all duration-1000" 
        style={{ 
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` 
        }} 
      />
      <div className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full opacity-10 bg-blue-500 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full opacity-10 bg-indigo-500 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Branding Header with modern drop shadow */}
        <div className="text-center mb-8 transform transition-all duration-300 hover:scale-102">
          {logoUrl ? (
            <div className="relative inline-block mb-4">
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-30 animate-pulse" 
                style={{ backgroundColor: primaryColor }}
              />
              <img 
                src={logoUrl} 
                alt={businessName} 
                className="relative w-24 h-24 rounded-full object-cover border-4 border-slate-900 shadow-2xl bg-slate-900"
              />
            </div>
          ) : (
            <div 
              className="w-20 h-20 mx-auto rounded-full border-4 border-slate-900 shadow-2xl mb-4 flex items-center justify-center text-3xl font-extrabold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">{businessName}</h1>
        </div>

        {/* Premium Glassmorphic Card Container */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500">
          
          {/* Initial / Rating State */}
          {rating === 0 && (
            <div className="p-8 text-center space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">{welcomeMessage}</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                We'd love to hear about your experience! Tap a star below to rate us.
              </p>
              
              {/* Premium star inputs with micro-animations */}
              <div className="flex justify-center gap-2.5 pt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-all duration-200 transform hover:scale-125 hover:-translate-y-1 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating) 
                          ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                          : 'text-slate-700 hover:text-slate-650'
                      } transition-all duration-150`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Positive Review Route (Redirect Threshold met) */}
          {rating >= positiveThreshold && !submitted && (
            <div className="p-8 text-center space-y-6 animate-fade-in relative">
              <button 
                onClick={() => setRating(0)}
                disabled={submitting}
                className="absolute top-4 left-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change Rating"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                <Star className="w-8 h-8 fill-emerald-400 text-emerald-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-100">Thank you!</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                We are thrilled you had a positive experience! Would you mind sharing your review publicly? It helps us immensely.
              </p>
              <div className="pt-4">
                <a 
                  href={publicReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePublicReviewClick}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 text-white font-bold rounded-2xl shadow-xl hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] transition-all transform active:scale-98 bg-[#001B50]"
                >
                  <span>Leave a Public Review</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Constructive / Private Review Route (Below threshold) */}
          {rating > 0 && rating < positiveThreshold && !submitted && (
            <div className="p-8 animate-fade-in relative">
              <button 
                onClick={() => setRating(0)}
                disabled={submitting}
                className="absolute top-4 left-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change Rating"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold text-slate-100 mb-2 text-center pt-2">We value your feedback</h2>
              <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
                {privateFeedbackMessage}
              </p>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <textarea 
                    required
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what went wrong and how we can improve..."
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-200 transition-all text-sm resize-none"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-200 transition-all text-sm"
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your Phone Number (Optional)"
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-200 transition-all text-sm"
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={submitting || !feedback.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-white font-bold rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer border-none bg-[#001B50]"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    <span>Submit Private Feedback</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Submission Success State */}
          {submitted && (
            <div className="p-10 text-center space-y-4 animate-scale-in">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">Thank You!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {thankYouMessage}
              </p>
            </div>
          )}

        </div>
        
        {/* Sleek brand footer */}
        <div className="mt-8 flex items-center gap-1.5 opacity-40 hover:opacity-75 transition-opacity duration-300">
          <span className="text-[10px] text-slate-400">Powered by</span>
          <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">QR Junction</span>
        </div>

      </div>
    </div>
  );
}
