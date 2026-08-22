// app/payment/success/page.tsx
'use client'
import { ArrowLeft, Heart, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function SuccessPage() {
  const router = useRouter()
  return (
    <div className='flex items-center justify-center  bg-gray-100 flex-col min-h-screen'>
    <div className="flex items-center justify-center pt-9 bg-gray-100">
      <div className="pop">
        <svg width="120" height="120" viewBox="0 0 52 52">
          {/* circle */}
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            className="circle"
          />

          {/* check */}
          <path
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cross"
            d="M16 16 L36 36 M36 16 L16 36"
          />
        </svg>
      </div>

      {/* styles */}
      <style jsx>{`
        .circle {
          stroke-dasharray: 188;
          stroke-dashoffset: 188;
          animation: drawCircle 0.6s ease-out forwards;
        }

        .check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.4s ease-out forwards;
          animation-delay: 0.6s;
        }

        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        .pop {
          animation: pop 0.35s ease-out;
        }

        @keyframes pop {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>


    </div>
<h2 className="text-2xl font-bold text-red-600 mt-4">Payment Declined!</h2>
        <p className="text-gray-500 mt-2">Your Payment has been Declined.</p>
       <div className='flex gap-2 mt-2'>
       <button
            onClick={() => router.push("/user/cart")}
            className=" flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition-all px-6"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <button
            onClick={() => router.back()}
            className=" flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all px-6"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
       </div>
        <Link href="/" className="mt-6 inline-block bg-red-600 text-white px-6 py-2 rounded-full">
          Go To Home
        </Link>
        <p className="text-gray-500 mt-6 flex">Note: This website has been made by Muhammad Muzammil With Heart<Heart className='text-red-700'/></p>
    </div>
  );
  }