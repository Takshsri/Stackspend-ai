"use client";

import Link from "next/link";

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-6xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Audit Results
            </h1>

            <p className="mt-2 text-zinc-400">
              AI-powered SaaS optimization insights
            </p>
          </div>

          <Link href="/dashboard">
            <button className="rounded-lg bg-white px-5 py-2 font-semibold text-black">
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* TOP METRICS */}

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              Estimated Savings
            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-400">
              $2,400
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Annual optimization potential
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              Waste Score
            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-400">
              72%
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Significant redundant spending detected
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              Optimization Level
            </p>

            <h2 className="mt-3 text-4xl font-bold text-yellow-400">
              Medium
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Multiple pricing inefficiencies found
            </p>
          </div>

        </div>

        {/* RECOMMENDATIONS */}

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

          <h2 className="text-2xl font-bold">
            AI Recommendations
          </h2>

          <div className="mt-8 space-y-5">

            <div className="rounded-xl border border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Remove Unused Slack Seats
                </h3>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
                  Save $600/year
                </span>
              </div>

              <p className="mt-3 text-zinc-400">
                12 inactive Slack premium seats detected across your organization.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Switch Notion to Annual Billing
                </h3>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
                  Save $420/year
                </span>
              </div>

              <p className="mt-3 text-zinc-400">
                Annual billing reduces your current Notion spending by 18%.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Downgrade Figma Enterprise
                </h3>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
                  Save $1,380/year
                </span>
              </div>

              <p className="mt-3 text-zinc-400">
                Your usage patterns align better with Figma Professional tier.
              </p>
            </div>

          </div>

        </div>

        {/* TOOL BREAKDOWN */}

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

          <h2 className="text-2xl font-bold">
            SaaS Spend Breakdown
          </h2>

          <div className="mt-8 space-y-5">

            <div>
              <div className="mb-2 flex justify-between">
                <span>Slack</span>
                <span>$240/month</span>
              </div>

              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-3 w-[70%] rounded-full bg-red-500"></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <span>Notion</span>
                <span>$180/month</span>
              </div>

              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-3 w-[50%] rounded-full bg-yellow-500"></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <span>Figma</span>
                <span>$420/month</span>
              </div>

              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-3 w-[90%] rounded-full bg-green-500"></div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}