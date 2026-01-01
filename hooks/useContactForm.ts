'use client';

import { useState } from 'react';
import { trackContactFormSubmit } from '@/lib/analytics';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormMessage {
  type: 'success' | 'error' | '';
  text: string;
}

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formMessage, setFormMessage] = useState<FormMessage>({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, email, subject, message } = formData;
    
    // Track contact form submission
    trackContactFormSubmit(subject);
    
    // Create mailto link
    const mailtoLink = `mailto:uniquetechexplorer7@gmail.com?subject=${encodeURIComponent(subject)} - ${encodeURIComponent(name)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    setFormMessage({
      type: 'success',
      text: 'Your email client should open. If not, please email us directly at uniquetechexplorer7@gmail.com',
    });
    
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return {
    formData,
    formMessage,
    handleChange,
    handleSubmit,
  };
}

