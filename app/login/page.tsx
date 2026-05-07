"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Zap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Auth (Replace with real client/Supabase) ---


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAction = async (type: 'login' | 'signup') => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { error } = type === 'login' 
                ? await supabase.auth.signInWithPassword({
            email,
            password,
        })
        : await supabase.auth.signUp({
            email,
            password,
        });

      if (error) {
        setErrorMessage(String(error));
        setLoading(false);
        return;
      }

      if (type === 'login') {
        console.log("Logged in successfully");
        router.push("/dashboard"); 
      } else {
        alert("Signup successful! Please check your email.");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 font-sans text-zinc-200 selection:bg-white/10">
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(50,50,50,0.4)_0%,transparent_50%)]" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23fff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      {/* --- Header / Logo --- */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-8 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black shadow-lg shadow-white/10 ring-1 ring-white/20">
            <TrendingUp size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StackSpend</span>
        </div>
        <div className="hidden items-center gap-6 text-sm font-medium text-zinc-500 md:flex">
          <a href="#" className="transition-colors hover:text-white">Product</a>
          <a href="#" className="transition-colors hover:text-white">Pricing</a>
          <a href="#" className="transition-colors hover:text-white">Docs</a>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
          
          {/* --- Left Column: Value Prop --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden space-y-8 lg:block"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400 backdrop-blur-md"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                New: AI Forecast Engines 2.0
              </motion.div>
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
                Smart Stack <br />
                <span className="bg-linear-to-r from-zinc-200 to-zinc-500 bg-clip-text text-transparent">Optimization.</span>
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-zinc-400">
                Stop leaking revenue on unused SaaS seats. StackSpend uses machine learning to identify redundancies and automate savings.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <FeatureItem 
                icon={<Zap size={18} />} 
                title="Real-time Analytics" 
                description="Instant visibility into your entire software ecosystem."
              />
              <FeatureItem 
                icon={<ShieldCheck size={18} />} 
                title="Enterprise Security" 
                description="SOC2 compliant data processing and encryption."
              />
            </div>
          </motion.div>

          {/* --- Right Column: Auth Card --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-linear-to-b from-zinc-800 to-transparent opacity-50 blur-xl transition-all duration-500 group-hover:opacity-75" />
              
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/40 p-8 backdrop-blur-2xl sm:p-10">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <motion.div variants={itemVariants} className="space-y-2 text-center lg:text-left">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {isLogin ? "Welcome back" : "Get started"}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {isLogin 
                        ? "Enter your credentials to access your dashboard" 
                        : "Create an account to start optimizing your spend"}
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-hidden transition-all focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Password</label>
                        {isLogin && <a href="#" className="text-xs text-zinc-400 hover:text-white">Forgot?</a>}
                      </div>
                      <div className="relative">
                        <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-hidden transition-all focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5"
                        />
                      </div>
                    </div>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {errorMessage && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
                      >
                        {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <button
                      onClick={() => handleAction(isLogin ? 'login' : 'signup')}
                      disabled={loading}
                      className="relative h-12 w-full overflow-hidden rounded-xl bg-white text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Create Free Account")}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                      </div>
                    </button>

                    

                  
                  </motion.div>

                  <motion.p variants={itemVariants} className="text-center text-xs text-zinc-500">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button 
                      onClick={() => setIsLogin(!isLogin)}
                      className="font-medium text-white hover:underline underline-offset-4"
                    >
                      {isLogin ? "Sign up for free" : "Login here"}
                    </button>
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="absolute bottom-6 left-0 right-0 z-20 flex justify-center px-6 text-[10px] uppercase tracking-widest text-zinc-600">
        <div className="flex gap-8">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Security</a>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
