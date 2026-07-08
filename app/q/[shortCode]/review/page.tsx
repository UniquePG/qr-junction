'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Star, Send, Loader2, CheckCircle, ArrowRight, ArrowLeft, Check, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

// Tag selections depending on business review category
const categoryTagsData: Record<string, { positive: string[]; negative: string[] }> = {
  'Food & Dining': {
    positive: ['Food Quality', 'Service Speed', 'Staff Behaviour', 'Cleanliness', 'Atmosphere', 'Value for Money'],
    negative: ['Slow service', 'Staff behavior', 'Food quality', 'Pricing', 'Hygiene', 'Other']
  },
  'Retail & Shopping': {
    positive: ['Product Quality', 'Customer Service', 'Store Ambience', 'Collection Variety', 'Pricing'],
    negative: ['Slow checkout', 'Staff behavior', 'Low stock/variety', 'Product issue', 'Pricing', 'Other']
  },
  'Hotels & Accommodation': {
    positive: ['Room Comfort', 'Amenities', 'Service Quality', 'Location', 'Hygiene Standards'],
    negative: ['Dirty room', 'Slow check-in', 'Bad service', 'Overpriced', 'Noise', 'Other']
  },
  'Spa & Salons': {
    positive: ['Treatment Quality', 'Staff Expertise', 'Hygiene Standards', 'Relaxing Ambience', 'Value'],
    negative: ['Poor service', 'Long wait time', 'Unclean facilities', 'Rude staff', 'Overpriced', 'Other']
  },
  'Healthcare & Clinics': {
    positive: ['Doctor Competence', 'Short Wait Time', 'Staff Behaviour', 'Clinic Cleanliness', 'Value'],
    negative: ['Long wait time', 'Staff behavior', 'Unclean clinic', 'High consultation fee', 'Poor care', 'Other']
  },
  'E-commerce & Delivery': {
    positive: ['Delivery Speed', 'Packaging Quality', 'Product Quality', 'Support Helpfulness', 'Value'],
    negative: ['Delayed delivery', 'Damaged package', 'Poor product quality', 'Support issue', 'Overpriced', 'Other']
  },
  'Professional Services': {
    positive: ['Response Time', 'Technical Expertise', 'Work Quality', 'Clear Communication', 'Professionalism'],
    negative: ['Delayed response', 'Lack of expertise', 'Poor work quality', 'Bad communication', 'Unprofessional', 'Other']
  },
  'Others': {
    positive: ['Quality', 'Service', 'Cleanliness', 'Price', 'Overall Experience'],
    negative: ['Slow service', 'Staff behavior', 'Product quality', 'Delivery issue', 'Pricing', 'Other']
  }
};

export default function ReviewLandingPage() {
  const { shortCode } = useParams() as { shortCode: string };
  
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<any>(null);
  
  // Review flow states
  const [step, setStep] = useState<number>(0); // 0: Rating, 1: Tags, 2: Review text / Suggestions, 3: Success
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Feedback input
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // AI Suggestions states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  // DB tracking
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
          setStep(3);
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
  const primaryColor = qrCode.fgColor || '#3b82f6'; 
  const reviewCategory = dest.reviewCategory || 'Others';
  const selectedLanguage = dest.language || 'English';

  let publicReviewUrl = dest.publicReviewUrl || 'https://google.com';
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const activeHost = window.location.host;
    publicReviewUrl = publicReviewUrl.replace('localhost:3000', activeHost).replace('127.0.0.1:3000', activeHost);
  } else if (process.env.NODE_ENV === 'production') {
    publicReviewUrl = publicReviewUrl.replace('localhost:3000', 'qrjunction.in').replace('127.0.0.1:3000', 'qrjunction.in');
  }

  const positiveThreshold = dest.positiveThreshold ?? 4;
  const welcomeMessage = dest.welcomeMessage || 'How was your experience?';
  const privateFeedbackMessage = dest.privateFeedbackMessage || "We are sorry to hear that. Please let us know what went wrong so we can improve.";
  const thankYouMessage = dest.thankYouMessage || 'Thank you for your feedback! Your review helps us grow.';

  const isPositive = rating >= positiveThreshold;
  const tagsData = categoryTagsData[reviewCategory] || categoryTagsData['Others'];
  const availableTags = isPositive ? tagsData.positive : tagsData.negative;

  const handleRatingSelect = async (rate: number) => {
    if (submitted || submitting) return;
    setRating(rate);
    setSelectedTags([]);
    setFeedback('');
    setSelectedSuggestionIndex(null);
    setSuggestions([]);
    
    // Save rating score immediately in database
    setSubmitting(true);
    try {
      const payload: any = {
        qrCodeId: qrCode.id,
        rating: rate,
      };
      if (submittedReviewId) {
        payload.id = submittedReviewId;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.reviewResponse?.id) {
          setSubmittedReviewId(json.reviewResponse.id);
        }
      }
    } catch (error) {
      console.error('Failed to pre-save rating:', error);
    } finally {
      setSubmitting(false);
      setStep(1); // Advance to tags step
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleTagsNext = async () => {
    if (isPositive) {
      setStep(2);
      // Fetch AI generated review suggestions
      setSuggestionsLoading(true);
      try {
        const res = await fetch('/api/reviews/generate-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            selectedTags,
            businessName,
            reviewCategory,
            language: selectedLanguage
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setSuggestions(json.suggestions || []);
        } else {
          throw new Error('Failed to generate suggestions');
        }
      } catch (err) {
        console.error('AI suggestion failed:', err);
        setSuggestions([
          selectedLanguage === 'Hindi' ? "बहुत बढ़िया अनुभव रहा। सेवा और गुणवत्ता बहुत अच्छी थी।" : "Excellent service and high quality. Highly recommended!",
          selectedLanguage === 'Hindi' ? "स्टाफ बहुत मददगार था और सब कुछ साफ-सुथरा था।" : "Staff was very helpful and everything was neat and clean.",
          selectedLanguage === 'Hindi' ? "मुझे यहाँ का वातावरण और व्यवहार बहुत पसंद आया।" : "I really liked the atmosphere and professionalism."
        ]);
      } finally {
        setSuggestionsLoading(false);
      }
    } else {
      setStep(2); // Go to negative private feedback details
    }
  };

  const handleSelectSuggestion = (index: number) => {
    setSelectedSuggestionIndex(index);
    setFeedback(suggestions[index]);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        qrCodeId: qrCode.id,
        rating,
        feedback,
        name: name || undefined,
        phone: phone || undefined,
        selectedTags,
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
      
      if (isPositive) {
        // Redirect positive reviews to public review platforms after submission
        window.location.href = publicReviewUrl;
      } else {
        setStep(3); // Show private feedback thank you note
      }
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-16 px-6 relative overflow-hidden font-sans select-none">
      
      {/* Glow Blobs */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none transition-all duration-1000" 
        style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }} 
      />
      <div className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full opacity-10 bg-blue-500 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full opacity-10 bg-indigo-500 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Header branding */}
        <div className="text-center mb-6 transition-all duration-300">
          {logoUrl ? (
            <div className="relative inline-block mb-3">
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-30 animate-pulse" 
                style={{ backgroundColor: primaryColor }}
              />
              <img 
                src={logoUrl} 
                alt={businessName} 
                className="relative w-20 h-20 rounded-full object-cover border-4 border-slate-900 shadow-2xl bg-slate-900"
              />
            </div>
          ) : (
            <div 
              className="w-16 h-16 mx-auto rounded-full border-4 border-slate-900 shadow-2xl mb-3 flex items-center justify-center text-2xl font-extrabold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">{businessName}</h1>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{reviewCategory}</span>
        </div>

        {/* Card Body */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500">
          
          {/* STEP 0: Star Rating */}
          {step === 0 && (
            <div className="p-8 text-center space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">{welcomeMessage}</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                We'd love to hear about your experience! Tap a star below to rate us.
              </p>
              
              <div className="flex justify-center gap-2.5 pt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleRatingSelect(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-all duration-150 transform hover:scale-120 hover:-translate-y-1 active:scale-95 focus:outline-none"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating) 
                          ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                          : 'text-slate-700'
                      } transition-all`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Tag choices ("What did you like most?" / "What went wrong?") */}
          {step === 1 && (
            <div className="p-6 md:p-8 animate-fade-in relative space-y-6">
              <button 
                onClick={() => setStep(0)}
                className="absolute top-4 left-4 p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border-none cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <h2 className="text-md font-bold text-slate-100">
                  {isPositive ? 'What did you like most? 👍' : 'What went wrong? 👎'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">Select all that apply to help us understand.</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center py-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all transform active:scale-95 border cursor-pointer ${
                        isSelected
                          ? isPositive 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                            : 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleTagsNext}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 text-white font-bold rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer border-none"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Suggestions (Positive) or Feedback writing (Negative) */}
          {step === 2 && isPositive && (
            <div className="p-6 md:p-8 animate-fade-in relative space-y-5">
              <button 
                onClick={() => setStep(1)}
                className="absolute top-4 left-4 p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border-none cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <h2 className="text-md font-bold text-slate-100 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Review Suggestions</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Click a suggestion to select it, or write your own.</p>
              </div>

              {suggestionsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Generating review recommendations...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {suggestions.map((sug, idx) => {
                    const isSelected = selectedSuggestionIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer block ${
                          isSelected
                            ? 'bg-blue-500/10 border-blue-500 text-blue-200 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-slate-350 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <p className="font-sans">{sug}</p>
                        {isSelected && (
                          <span className="text-[9px] font-bold text-blue-400 mt-1.5 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected Suggestion
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Edit or Write Review
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => {
                      setFeedback(e.target.value);
                      setSelectedSuggestionIndex(null); // Deselect chip if user edits text
                    }}
                    placeholder="Write your review experience here..."
                    className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 transition-all text-xs resize-none font-sans"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !feedback.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-white font-bold rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer border-none bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Go to Public Platform</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Private Feedback Writing (Negative) */}
          {step === 2 && !isPositive && (
            <div className="p-6 md:p-8 animate-fade-in relative space-y-5">
              <button 
                onClick={() => setStep(1)}
                className="absolute top-4 left-4 p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border-none cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <h2 className="text-md font-bold text-slate-100">Private Feedback</h2>
                <p className="text-[11px] text-slate-400 mt-1">{privateFeedbackMessage}</p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <textarea 
                  required
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what went wrong in detail so we can fix it for you..."
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 transition-all text-xs resize-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 transition-all text-xs"
                  />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (Optional)"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 transition-all text-xs"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting || !feedback.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-white font-bold rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer border-none bg-red-600 hover:bg-red-700"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Private Feedback</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Submission Success */}
          {(step === 3 || submitted) && (
            <div className="p-10 text-center space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Thank You!</h2>
              <p className="text-slate-450 text-xs leading-relaxed max-w-xs mx-auto">
                {thankYouMessage}
              </p>
            </div>
          )}

        </div>
        
        {/* brand footer */}
        <div className="mt-8 flex items-center gap-1.5 opacity-30">
          <span className="text-[10px] text-slate-400">Powered by</span>
          <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">QR Junction</span>
        </div>

      </div>
    </div>
  );
}
