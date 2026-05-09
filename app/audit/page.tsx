"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Layers,
  ArrowLeft,
  ChevronRight,
  PieChart,
  Loader2,
  Plus,
  Trash2,
  Code2,
  PenLine,
  Database,
  Search,
  Shuffle,
} from "lucide-react";
import { runFullAudit, type AuditInput, type ToolId, type UseCase } from "@/app/services/audit-engine";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TOOL_OPTIONS: { id: ToolId; name: string; plans: { id: string; label: string }[] }[] = [
  {
    id: "cursor",
    name: "Cursor",
    plans: [
      { id: "hobby", label: "Hobby (Free)" },
      { id: "pro", label: "Pro ($20/seat)" },
      { id: "business", label: "Business ($40/seat)" },
      { id: "enterprise", label: "Enterprise ($100/seat)" },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    plans: [
      { id: "individual", label: "Individual ($10/seat)" },
      { id: "business", label: "Business ($19/seat)" },
      { id: "enterprise", label: "Enterprise ($39/seat)" },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    plans: [
      { id: "free", label: "Free" },
      { id: "pro", label: "Pro ($20/seat)" },
      { id: "max", label: "Max ($100/seat)" },
      { id: "team", label: "Team ($30/seat, min 5)" },
      { id: "enterprise", label: "Enterprise (~$60/seat)" },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    plans: [
      { id: "free", label: "Free" },
      { id: "plus", label: "Plus ($20/seat)" },
      { id: "team", label: "Team ($30/seat)" },
      { id: "enterprise", label: "Enterprise (~$60/seat)" },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    plans: [{ id: "direct", label: "Pay-as-you-go" }],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    plans: [{ id: "direct", label: "Pay-as-you-go" }],
  },
  {
    id: "gemini",
    name: "Gemini",
    plans: [
      { id: "free", label: "Free" },
      { id: "advanced", label: "Advanced ($19.99/seat)" },
      { id: "business", label: "Business ($30/seat)" },
    ],
  },
  {
    id: "gemini_api",
    name: "Gemini API",
    plans: [{ id: "direct", label: "Pay-as-you-go" }],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    plans: [
      { id: "free", label: "Free" },
      { id: "pro", label: "Pro ($15/seat)" },
      { id: "teams", label: "Teams ($30/seat)" },
    ],
  },
];

const USE_CASES: { id: UseCase; label: string; icon: React.ReactNode }[] = [
  { id: "coding", label: "Coding", icon: <Code2 size={16} /> },
  { id: "writing", label: "Writing", icon: <PenLine size={16} /> },
  { id: "data", label: "Data", icon: <Database size={16} /> },
  { id: "research", label: "Research", icon: <Search size={16} /> },
  { id: "mixed", label: "Mixed", icon: <Shuffle size={16} /> },
];

type ToolEntry = {
  toolId: ToolId | "";
  planId: string;
  monthlySpend: string;
  seats: string;
  useCase: UseCase | "";
};

type FormData = {
  companyName: string;
  teamSize: string;
  tools: ToolEntry[];
};

const EMPTY_TOOL: ToolEntry = {
  toolId: "",
  planId: "",
  monthlySpend: "",
  seats: "1",
  useCase: "",
};

const STEPS = [
  {
    id: "company",
    title: "Identity",
    description: "Your organization details.",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    id: "team",
    title: "Team Size",
    description: "How large is your team?",
    icon: <Users className="h-6 w-6" />,
  },
  {
    id: "tools",
    title: "AI Stack",
    description: "Add each AI tool you pay for.",
    icon: <Layers className="h-6 w-6" />,
  },
];

const STORAGE_KEY = "stackaudit_form_data";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>(() => {
    // Persist form state across page reloads
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      companyName: "",
      teamSize: "",
      tools: [{ ...EMPTY_TOOL }],
    };
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // ── Tool helpers ─────────────────────────────────────────────────────────────

  const updateTool = (index: number, field: keyof ToolEntry, value: string) => {
    setFormData((prev) => {
      const tools = [...prev.tools];
      tools[index] = { ...tools[index], [field]: value };
      // Reset planId when tool changes
      if (field === "toolId") tools[index].planId = "";
      return { ...prev, tools };
    });
  };

  const addTool = () => {
    setFormData((prev) => ({
      ...prev,
      tools: [...prev.tools, { ...EMPTY_TOOL }],
    }));
  };

  const removeTool = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  const getPlansForTool = (toolId: ToolId | "") => {
    if (!toolId) return [];
    return TOOL_OPTIONS.find((t) => t.id === toolId)?.plans ?? [];
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const isStepValid = () => {
    const step = STEPS[currentStep].id;
    if (step === "company") return formData.companyName.trim().length > 1;
    if (step === "team") return formData.teamSize !== "";
    if (step === "tools") {
      return (
        formData.tools.length > 0 &&
        formData.tools.every(
          (t) =>
            t.toolId !== "" &&
            t.planId !== "" &&
            t.useCase !== "" &&
            Number(t.monthlySpend) >= 0 &&
            Number(t.seats) >= 1
        )
      );
    }
    return false;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleFinalize = async () => {
    setLoading(true);
    try {
      // Build audit inputs for the engine
      const auditInputs: AuditInput[] = formData.tools.map((t) => ({
        toolId: t.toolId as ToolId,
        planId: t.planId,
        monthlySpend: Number(t.monthlySpend),
        seats: Number(t.seats),
        useCase: t.useCase as UseCase,
        teamSize: Number(formData.teamSize.split("-")[0]) || 10,
      }));

      // Run audit engine (pure, client-side)
      const auditResult = runFullAudit(auditInputs);

      // Generate unique shareable ID
      const shareId = crypto.randomUUID();

      // Save to Supabase (strip identifying info for public URL)
      const { error } = await supabase.from("audits").insert({
        share_id: shareId,
        company_name: formData.companyName,
        team_size: formData.teamSize,
        // Store full audit result as JSON
        audit_result: auditResult,
        // Public-safe version (no company name/email)
        public_result: {
          results: auditResult.results,
          totalMonthlySavings: auditResult.totalMonthlySavings,
          totalAnnualSavings: auditResult.totalAnnualSavings,
          overallSummary: auditResult.overallSummary,
        },
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error(error.message);
        // Don't block user — still navigate with result in sessionStorage
      }

      // Store result for results page
      sessionStorage.setItem("audit_result", JSON.stringify(auditResult));
      sessionStorage.setItem("audit_share_id", shareId);
      sessionStorage.setItem("audit_company", formData.companyName);

      // Clear form persistence after successful submit
      localStorage.removeItem(STORAGE_KEY);

      router.push(`/results?id=${shareId}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalize();
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-300">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-zinc-900 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-8 md:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg">
              <PieChart size={20} />
            </div>
            <span className="text-white font-bold">StackAudit</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= currentStep ? "bg-white w-6" : "bg-zinc-700 w-3"
                }`}
              />
            ))}
          </div>

          <div className="text-xs font-mono text-zinc-500">
            0{currentStep + 1} / 0{STEPS.length}
          </div>
        </header>

        {/* Main */}
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid gap-12 md:grid-cols-[1fr_2fr]"
              >
                {/* Left: Step info */}
                <div className="space-y-6">
                  <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white">
                    {STEPS[currentStep].icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {STEPS[currentStep].title}
                    </h2>
                    <p className="text-zinc-500">{STEPS[currentStep].description}</p>
                  </div>

                  {/* Step list */}
                  <div className="space-y-3 pt-4">
                    {STEPS.map((step, i) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 text-sm transition-colors ${
                          i === currentStep
                            ? "text-white"
                            : i < currentStep
                            ? "text-zinc-500 line-through"
                            : "text-zinc-700"
                        }`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            i <= currentStep ? "bg-white" : "bg-zinc-700"
                          }`}
                        />
                        {step.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Step content */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                  {/* STEP 1: Company name */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <label className="text-zinc-400 text-sm">Company or project name</label>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Acme Inc."
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                        }
                        className="w-full bg-transparent text-2xl text-white outline-none border-b border-zinc-800 focus:border-white py-4 transition-colors placeholder:text-zinc-700"
                      />
                      <p className="text-xs text-zinc-600">
                        Only shown in your private audit. Stripped from the public shareable link.
                      </p>
                    </div>
                  )}

                  {/* STEP 2: Team size */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <label className="text-zinc-400 text-sm">Total team size</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "1–10", value: "1-10" },
                          { label: "11–50", value: "11-50" },
                          { label: "51–200", value: "51-200" },
                          { label: "201–1000", value: "201-1000" },
                          { label: "1000+", value: "1000+" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, teamSize: option.value }))
                            }
                            className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                              formData.teamSize === option.value
                                ? "bg-white text-black border-white"
                                : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                            }`}
                          >
                            {option.label} people
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Tools */}
                  {currentStep === 2 && (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                      <label className="text-zinc-400 text-sm">
                        Add each AI tool you currently pay for
                      </label>

                      {formData.tools.map((tool, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative bg-zinc-800/50 border border-white/5 rounded-2xl p-5 space-y-4"
                        >
                          {/* Remove button */}
                          {formData.tools.length > 1 && (
                            <button
                              onClick={() => removeTool(index)}
                              className="absolute top-4 right-4 text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                          <div className="text-xs text-zinc-500 font-mono">
                            Tool #{index + 1}
                          </div>

                          {/* Tool selector */}
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Tool</label>
                            <select
                              value={tool.toolId}
                              onChange={(e) => updateTool(index, "toolId", e.target.value)}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors"
                            >
                              <option value="">Select a tool...</option>
                              {TOOL_OPTIONS.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Plan selector — only show when tool is selected */}
                          {tool.toolId && (
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Plan</label>
                              <select
                                value={tool.planId}
                                onChange={(e) => updateTool(index, "planId", e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors"
                              >
                                <option value="">Select a plan...</option>
                                {getPlansForTool(tool.toolId).map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Monthly spend + seats */}
                          {tool.planId && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-zinc-500 mb-1 block">
                                  Monthly spend ($)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={tool.monthlySpend}
                                  onChange={(e) =>
                                    updateTool(index, "monthlySpend", e.target.value)
                                  }
                                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-zinc-500 mb-1 block">
                                  Seats / users
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  value={tool.seats}
                                  onChange={(e) => updateTool(index, "seats", e.target.value)}
                                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {/* Use case */}
                          {tool.planId && (
                            <div>
                              <label className="text-xs text-zinc-500 mb-2 block">
                                Primary use case for this tool
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {USE_CASES.map((uc) => (
                                  <button
                                    key={uc.id}
                                    onClick={() => updateTool(index, "useCase", uc.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                      tool.useCase === uc.id
                                        ? "bg-white text-black border-white"
                                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                    }`}
                                  >
                                    {uc.icon}
                                    {uc.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Add tool button */}
                      <button
                        onClick={addTool}
                        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-zinc-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus size={14} />
                        Add another tool
                      </button>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="mt-8 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStep((s) => s - 1)}
                      disabled={currentStep === 0}
                      className="text-zinc-500 hover:text-white disabled:opacity-0 flex items-center gap-2 transition-colors text-sm"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={!isStepValid() || loading}
                      className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Analyzing...
                        </>
                      ) : currentStep === STEPS.length - 1 ? (
                        <>
                          Run Audit
                          <ChevronRight size={14} />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight size={14} />
                        </>
                      )}
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