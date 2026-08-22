"use client";
import React from 'react'

import Link from "next/link";
import { ShieldX } from "lucide-react";

function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6">
          
          <div className="max-w-md w-full text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 p-4 rounded-full">
                <ShieldX className="text-red-500 w-10 h-10" />
              </div>
            </div>
    
            {/* Title */}
            <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
            
            {/* Subtitle */}
            <p className="text-gray-300 mb-6">
              You are not authorized to view this page.
            </p>
    
            {/* Message */}
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6">
              Only <span className="font-semibold">Admin</span> can access this section.
            </div>
    
            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="w-full py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
              >
                Go Back Home
              </Link>
    
              <button
                onClick={() => window.history.back()}
                className="w-full py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
              >
                Go Back
              </button>
            </div>
    
            {/* Footer */}
            <p className="text-xs text-gray-400 mt-6">
              This website is made by <span className="text-white font-medium">Muzammil</span>
            </p>
    
          </div>
        </div>
      );
}

export default Unauthorized
