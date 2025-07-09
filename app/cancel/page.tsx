"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-4 text-center">
        <div className="text-yellow-400 text-6xl mb-4">⏸️</div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
        
        <p className="text-white/80 mb-6">
          No worries! Your payment was cancelled and you haven&apos;t been charged. 
          You can try again whenever you&apos;re ready.
        </p>

        <div className="bg-blue-500/20 rounded-lg p-4 mb-6">
          <p className="text-blue-200 text-sm">
            💡 Your story configuration is still saved! 
            Just click the generate button again to continue.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 block"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}