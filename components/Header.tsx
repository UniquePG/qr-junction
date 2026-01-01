import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="text-center mb-8 animate-fade-in">
      <div className="flex items-center justify-center gap-4 flex-col md:flex-row">
        <Link href="/" className="flex items-center gap-4 no-underline">
          <Image
            src="/assests/qrjunction-logo1.png"
            alt="QR Code Generator Logo"
            width={60}
            height={60}
            className="rounded-2xl mb-5 md:mb-0"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Ultimate QR Code Generator
          </h1>
        </Link>
      </div>
      <p className="text-lg md:text-xl text-gray-700 mt-4">
        Create custom QR codes for your business, social media, and more in seconds!
      </p>
    </header>
  );
}

