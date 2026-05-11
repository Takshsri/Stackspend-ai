"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#06080A] overflow-hidden relative">
      {/* 1. Background Grid (Consistent with your UI) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#222 1px, transparent 1px), 
            linear-gradient(90deg, #222 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. The Animated Loader Container */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-24 h-24">
          {/* Outer Glowing Ring */}
          <motion.div
            className="absolute inset-0 border-2 border-emerald-500/20 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Inner Spinning Gradient Orbit */}
          <motion.div
            className="absolute inset-0 border-t-2 border-l-2 border-emerald-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          {/* Central Pulse Dot */}
          <motion.div
            className="absolute inset-[35%] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* 3. Modern Loading Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <span className="text-white font-medium tracking-widest text-sm uppercase">
            Analyzing Stack
          </span>
          
          {/* Animated Progress Bar Placeholder */}
          <div className="w-32 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              animate={{ x: [-128, 128] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}