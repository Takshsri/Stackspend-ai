
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export default function DashboardPage() {
    const [audits, setAudits] = useState<any[]>([]);
    useEffect(() => {
  fetchAudits();
}, []);

const fetchAudits = async () => {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error.message);
    return;
  }

  setAudits(data || []);
};
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-6xl">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Dashboard
            </h1>

            <p className="mt-2 text-zinc-400">
              Analyze and optimize your SaaS spending
            </p>
          </div>

                    <Link href="/audit">
                        <button className="rounded-lg bg-white px-5 py-2 text-black font-semibold">
                            Start Audit
                        </button>
                </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Total Savings</p>

            <h2 className="mt-3 text-3xl font-bold">
              $12,400
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Active Audits</p>

            <h2 className="mt-3 text-3xl font-bold">
              8
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Waste Score</p>

            <h2 className="mt-3 text-3xl font-bold text-red-400">
              72%
            </h2>
          </div>

        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-semibold">
            Recent Audits
          </h2>

<div className="mt-6 space-y-4">

  {audits.length === 0 ? (
    <p className="text-zinc-500">
      No audits found yet.
    </p>
  ) : (
    audits.map((audit) => (
      <div
        key={audit.id}
        className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"
      >
        <div>
          <h3 className="font-semibold">
            {audit.company_name}
          </h3>

          <p className="text-sm text-zinc-400">
            Monthly Spend: ${audit.monthly_spend}
          </p>
        </div>

        <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
          Active
        </span>
      </div>
    ))
  )}

</div>
        </div>

      </div>
    </div>
  );
}