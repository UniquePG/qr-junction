'use client';

import type { FAQ } from '@/data/faqs';
import { useFAQ } from '@/hooks/useFAQ';
import { trackFAQExpand } from '@/lib/analytics';

interface FAQListProps {
  faqs: FAQ[];
}

export default function FAQList({ faqs }: FAQListProps) {
  const { openIndex, toggleFAQ } = useFAQ();

  const handleToggle = (index: number, question: string) => {
    const isOpening = openIndex !== index;
    toggleFAQ(index);
    
    // Track FAQ expansion (only when opening, not closing)
    if (isOpening) {
      trackFAQExpand(question, index);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
        >
          <button
            onClick={() => handleToggle(index, faq.question)}
            className="w-full p-4 sm:p-6 bg-slate-50 text-left border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
          >
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary flex items-center gap-2 sm:gap-3 pr-2">
              <i className="fas fa-question-circle text-secondary"></i>
              <span className="text-left">{faq.question}</span>
            </h3>
            <i
              className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'} text-primary transition-transform shrink-0`}
            ></i>
          </button>
          {openIndex === index && (
            <div className="p-4 sm:p-6 animate-fade-in">
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

