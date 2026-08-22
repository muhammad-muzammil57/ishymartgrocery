import React from 'react';
import Link from 'next/link'; // Agar Next.js hai
// import { Link } from 'react-router-dom'; // Agar React Router hai to ise uncomment karein

export default function Navbar() {
  return (
    <nav className="mt-[42px] bg-[#e8f5e9] p-4 flex justify-between items-center shadow-sm">
      {/* Logo Section */}
      <div className="text-xl font-bold text-emerald-800">
        Logo
      </div>

      {/* Navigation Links */}
      <div className="flex gap-6">
        <Link href="/" className="text-emerald-700 hover:text-emerald-950 font-medium transition">
          Home
        </Link>
        <Link href="/about" className="text-emerald-700 hover:text-emerald-950 font-medium transition">
          About
        </Link>
        <Link href="/contact" className="text-emerald-700 hover:text-emerald-950 font-medium transition">
          Contact
        </Link>
      </div>
    </nav>
  );
}
