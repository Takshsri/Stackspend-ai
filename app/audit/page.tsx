"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Layers, 
  ArrowLeft,
  Sparkles,
  ChevronRight,
  PieChart,
  Loader2
} from "lucide-react";

type AuditData = {
  companyName: string;
  teamSize: string;
  monthlySpend: string;
  tools: string;
};

const STEPS = [
  { id: "company", title: "Identity", description: "Your organization details.", icon: <Building2 className="h-6 w-6" /> },
  { id: "team", title: "Scale", description: "Workforce size.", icon: <Users className="h-6 w-6" /> },
  { id: "spend", title: "Budget", description: "Monthly investment.", icon: <DollarSign className="h-6 w-6" /> },
  { id: "tools", title: "Stack", description: "Software inventory.", icon: <Layers className="h-6 w-6" /> },
];

export default function AuditPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<AuditData>({ companyName: "", teamSize: "", monthlySpend: "", tools: "" });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalize();
    }
  };

const handleFinalize = async () => {
  setLoading(true);

  await new Promise(resolve => setTimeout(resolve, 2000));

  setLoading(false);

  router.push("/results");
};

  const isStepValid = () => {
    const step = STEPS[currentStep].id;
    if (step === "company") return data.companyName.length > 2;
    if (step === "team") return data.teamSize !== "";
    if (step === "spend") return data.monthlySpend !== "";
    if (step === "tools") return data.tools.length > 5;
    return false;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-zinc-900 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-8 md:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg">
              <PieChart size={20} />
            </div>
            <span className="text-white font-bold">StackAudit</span>
          </div>
          <div className="text-xs font-mono text-zinc-500">0{currentStep + 1} / 0{STEPS.length}</div>
        </header>

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-12 md:grid-cols-[1fr_2fr]"
              >
                <div className="space-y-6">
                  <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white">
                    {STEPS[currentStep].icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{STEPS[currentStep].title}</h2>
                    <p className="text-zinc-500">{STEPS[currentStep].description}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                  {currentStep === 0 && (
                    <input autoFocus type="text" placeholder="Company Name" value={data.companyName} onChange={e => setData({...data, companyName: e.target.value})} className="w-full bg-transparent text-2xl text-white outline-none border-b border-zinc-800 focus:border-white py-4" />
                  )}
                  {currentStep === 1 && (
                    <div className="grid gap-3">
                      {["1-50", "51-200", "201-1000", "1000+"].map(size => (
                        <button key={size} onClick={() => setData({...data, teamSize: size})} className={`p-4 rounded-xl border transition-all ${data.teamSize === size ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-white hover:bg-white/10"}`}>{size} Employees</button>
                      ))}
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="flex items-center gap-4 border-b border-zinc-800 focus-within:border-white transition-colors">
                      <DollarSign className="text-zinc-500" />
                      <input autoFocus type="number" placeholder="Monthly Spend" value={data.monthlySpend} onChange={e => setData({...data, monthlySpend: e.target.value})} className="w-full bg-transparent text-4xl text-white outline-none py-4" />
                    </div>
                  )}
                  {currentStep === 3 && (
                    <textarea autoFocus placeholder="Tools (e.g., Slack, AWS, Zoom)" value={data.tools} onChange={e => setData({...data, tools: e.target.value})} className="w-full bg-transparent text-xl text-white outline-none border-b border-zinc-800 focus:border-white min-h-[200px]" />
                  )}

                  <div className="mt-12 flex justify-between">
                    <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0} className="text-zinc-500 hover:text-white disabled:opacity-0 flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                    <button onClick={handleNext} disabled={!isStepValid() || loading} className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" /> : (currentStep === STEPS.length - 1 ? "Complete" : "Next")}
                      {!loading && <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
