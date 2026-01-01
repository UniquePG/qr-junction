'use client';

import { useContactForm } from '@/hooks/useContactForm';
import { trackContactFormSubmit } from '@/lib/analytics';

export default function ContactForm() {
  const { formData, formMessage, handleChange, handleSubmit } = useContactForm();

  return (
    <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">
        Send Us a Message
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="name" className="block mb-2 font-semibold text-gray-900">
            Your Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 font-semibold text-gray-900">
            Your Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block mb-2 font-semibold text-gray-900">
            Subject <span className="text-red-600">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a subject</option>
            <option value="support">Technical Support</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Report a Bug</option>
            <option value="business">Business Inquiry</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block mb-2 font-semibold text-gray-900">
            Message <span className="text-red-600">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            placeholder="Please provide details about your inquiry..."
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 sm:py-4 gradient-primary text-white rounded-lg font-semibold text-base sm:text-lg shadow-primary hover:-translate-y-0.5 hover:shadow-primary-hover transition-all"
        >
          <i className="fas fa-paper-plane mr-2"></i>Send Message
        </button>

        {formMessage.text && (
          <div
            className={`p-4 rounded-lg ${
              formMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            <i className={`fas fa-${formMessage.type === 'success' ? 'check' : 'exclamation'}-circle mr-2`}></i>
            {formMessage.text}
          </div>
        )}
      </form>
    </div>
  );
}

