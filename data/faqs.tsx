import React from 'react';

export interface FAQ {
  question: string;
  answer: React.ReactNode;
}

export const faqs: FAQ[] = [
  {
    question: 'How do I create a QR code for free?',
    answer: (
      <>
        <p className="mb-3">Creating a QR code with QR Junction is simple and completely free. Just follow these steps:</p>
        <ol className="list-decimal list-inside mb-3 space-y-2 ml-4">
          <li>Select the type of QR code you want to create (URL, Text, Social Media, Contact, etc.)</li>
          <li>Enter the required information in the input fields</li>
          <li>Optionally customize the QR code size</li>
          <li>Click the &quot;Generate QR Code&quot; button</li>
          <li>Download your QR code instantly</li>
        </ol>
        <p>No registration or payment is required. You can generate unlimited QR codes for free.</p>
      </>
    ),
  },
  {
    question: 'What types of QR codes can I create?',
    answer: (
      <>
        <p className="mb-3">QR Junction supports a wide variety of QR code types:</p>
        <ul className="list-disc list-inside mb-3 space-y-2 ml-4">
          <li><strong>URL QR Codes:</strong> Link to websites and web pages</li>
          <li><strong>Text QR Codes:</strong> Store plain text information</li>
          <li><strong>Social Media:</strong> Instagram, Facebook, WhatsApp, LinkedIn, Telegram, Snapchat, Twitter</li>
          <li><strong>Contact (vCard):</strong> Store contact information including name, phone, email, address, and website</li>
          <li><strong>Phone:</strong> Quick dial phone numbers</li>
          <li><strong>SMS:</strong> Pre-filled text messages</li>
          <li><strong>Email:</strong> Pre-filled email messages with subject and body</li>
          <li><strong>WiFi:</strong> Share WiFi network credentials</li>
        </ul>
      </>
    ),
  },
  {
    question: 'Do I need to register to use QR Junction?',
    answer: (
      <p>No, QR Junction is completely free to use and requires no registration. You can generate unlimited QR codes without creating an account. All QR code generation happens locally in your browser, ensuring your privacy and data security.</p>
    ),
  },
  {
    question: 'Can I customize the size of my QR code?',
    answer: (
      <>
        <p className="mb-3">Yes, you have full control over the size of your QR codes. You can choose from four different sizes:</p>
        <ul className="list-disc list-inside mb-3 space-y-2 ml-4">
          <li><strong>Small (128x128):</strong> Perfect for digital use and small print materials</li>
          <li><strong>Medium (200x200):</strong> Ideal for most general purposes</li>
          <li><strong>Large (300x300):</strong> Great for posters and larger print materials</li>
          <li><strong>Extra Large (400x400):</strong> Best for billboards and large format printing</li>
        </ul>
        <p>Choose the size that best fits your intended use case.</p>
      </>
    ),
  },
  {
    question: 'Are the QR codes I generate stored on your servers?',
    answer: (
      <p>No, we prioritize your privacy and security. All QR code generation happens entirely in your browser using client-side JavaScript. We don&apos;t store any of your data, generated QR codes, or personal information on our servers. Your information never leaves your device.</p>
    ),
  },
  {
    question: 'What file format are the QR codes downloaded in?',
    answer: (
      <>
        <p className="mb-3">QR codes are downloaded as PNG (Portable Network Graphics) image files. PNG format is widely supported and can be used in:</p>
        <ul className="list-disc list-inside mb-3 space-y-2 ml-4">
          <li>Websites and digital platforms</li>
          <li>Print materials (business cards, flyers, posters)</li>
          <li>Social media posts</li>
          <li>Email signatures</li>
          <li>Any application that supports image files</li>
        </ul>
      </>
    ),
  },
  {
    question: 'Can I use QR codes for commercial purposes?',
    answer: (
      <>
        <p className="mb-3">Yes, absolutely! You can use the QR codes generated on QR Junction for any purpose, including:</p>
        <ul className="list-disc list-inside mb-3 space-y-2 ml-4">
          <li>Commercial and business use</li>
          <li>Marketing campaigns</li>
          <li>Product packaging</li>
          <li>Event promotions</li>
          <li>Personal projects</li>
        </ul>
        <p>There are no restrictions on how you use the QR codes you generate.</p>
      </>
    ),
  },
  {
    question: 'How do I scan a QR code?',
    answer: (
      <>
        <p className="mb-3">Scanning QR codes is easy and doesn&apos;t require any special apps on most modern devices:</p>
        <ul className="list-disc list-inside mb-3 space-y-2 ml-4">
          <li><strong>iPhone:</strong> Open the Camera app and point it at the QR code. A notification will appear at the top.</li>
          <li><strong>Android:</strong> Open the Camera app or Google Lens and point it at the QR code.</li>
          <li><strong>Alternative:</strong> Download a dedicated QR code scanner app from your device&apos;s app store.</li>
        </ul>
        <p>Most smartphones manufactured in the last few years have built-in QR code scanning capabilities.</p>
      </>
    ),
  },
  {
    question: 'Can I edit a QR code after generating it?',
    answer: (
      <p>QR codes cannot be edited after generation. If you need to change the content, simply generate a new QR code with the updated information. The process is quick and free, so you can create as many QR codes as you need.</p>
    ),
  },
  {
    question: 'Is there a limit to how many QR codes I can generate?',
    answer: (
      <p>No, there is no limit. You can generate unlimited QR codes for free. Whether you need one QR code or thousands, QR Junction is here to help without any restrictions or hidden fees.</p>
    ),
  },
];

