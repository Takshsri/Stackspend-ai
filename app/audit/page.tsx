"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [monthlySpend, setMonthlySpend] = useState("");
  const [tools, setTools] = useState("");

  const handleAudit = async () => {
    console.log({
      companyName,
      teamSize,
      monthlySpend,
      tools,
    });

    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-3xl">
        
        <h1 className="text-4xl font-bold">
          SaaS Spend Audit
        </h1>

        <p className="mt-2 text-zinc-400">
          Analyze your software stack and identify savings opportunities.
        </p>

        <div className="mt-10 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Company Name
            </label>

            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Team Size
            </label>

            <input
              type="number"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="50"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Monthly SaaS Spend ($)
            </label>

            <input
              type="number"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(e.target.value)}
              placeholder="5000"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Tools Used
            </label>

            <textarea
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="Slack, Notion, Jira, Figma..."
              className="h-32 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
            />
          </div>

          <button
            onClick={handleAudit}
            className="w-full rounded-lg bg-white py-3 font-semibold text-black"
          >
            Generate Audit
          </button>

        </div>
      </div>
    </div>
  );
}