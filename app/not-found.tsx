"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    // Update: dark background and grid pattern
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#06080A] text-white overflow-hidden relative">
      
      {/* 1. Subtle Background Grid - Matched to Image */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#222 1px, transparent 1px), 
            linear-gradient(90deg, #222 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px', // Matches the grid density
        }}
      />

      {/* Main Content Area - higher z-index to sit above grid */}
      <div className="relative z-10 flex flex-col items-center justify-center">

        {/* 2. Brand Logo (Optional, but makes it consistent) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-[-100px] flex items-center gap-2"
        >
          {/* Mock logo, replace with actual SVG/Image if available */}
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-[#06080A] font-bold text-lg">H</div>
          <span className="font-semibold text-lg">StackAudit</span>
        </motion.div>

        {/* 3. Animated 404 Text - using same heavy font */}
        <motion.h1
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-[12rem] font-extrabold tracking-tighter leading-none"
        >
          404
        </motion.h1>

        {/* 4. Tilted Label - using brand orange/red accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 12 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 100 }}
          className="bg-[#FF6A3D] text-black px-4 py-1 text-sm font-bold rounded-sm absolute"
          style={{ top: '35%' }}
        >
          Page Not Found
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 text-gray-400 text-center max-w-sm text-lg"
        >
          Oops! The page you are looking for doesn't exist or has been moved to another digital dimension.
        </motion.p>

        {/* 5. Interactive Button - Matched style to the landing page primary button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mt-12"
        >
          <Link
            href="/"
            className="px-10 py-4 bg-white text-[#06080A] font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            Go back to main stack
          </Link>
        </motion.div>
        
      </div>
    </div>
  );
}