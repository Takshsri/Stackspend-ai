# DEVLOG

## Day 1 — 2026-05-06

**Hours worked:** 4

**What I did:**  
Initialized the project using Next.js with TypeScript and Tailwind CSS. Set up a scalable folder structure for components, services, utilities, tests, types, and pricing data. Installed and configured shadcn/ui for reusable UI components and started building the landing page foundation for the AI spend audit platform.

**What I learned:**  
Learned how shadcn/ui integrates with the Next.js App Router architecture and explored how to organize frontend applications in a more scalable and maintainable structure for SaaS-style products.

**Blockers / what I'm stuck on:**  
Still deciding how detailed the audit recommendation engine should be in the MVP while keeping the logic understandable and financially reasonable.

**Plan for tomorrow:**  
Build the audit form flow, and start implementing the audit engine recommendation logic.


# DEVLOG

## Day 2 — 2026-05-07

**Hours worked:** 7

**What I did:**  
Integrated Supabase into the application for authentication and database storage. Configured environment variables and created the Supabase client setup for the Next.js application. Built a complete authentication workflow including signup, login, loading states, validation handling, and dashboard redirection.

Developed a modern dashboard UI for the SaaS audit platform with metrics cards, audit workflow navigation, and recent audit history. Implemented a multi-step SaaS spend audit wizard with smooth transitions, animated interactions using Framer Motion, validation between steps, and user-friendly onboarding flow.

Created the audit results dashboard to display optimization insights, estimated savings, waste scores, SaaS spend breakdowns, and recommendation cards. Added Supabase database integration to persist audit submissions and connected the dashboard with real audit history fetched dynamically from the database.

Installed and configured additional frontend tooling including Framer Motion, Lucide React icons, clsx, and tailwind-merge to improve UI quality and component styling consistency.

**What I learned:**  
Learned how Supabase authentication works with the Next.js App Router and how client/server components behave differently in modern React applications. Explored how to persist user-generated data into Supabase tables and dynamically render database-driven UI in a SaaS dashboard workflow.

Also learned how to structure multi-step form experiences with React state management and how to integrate animation libraries like Framer Motion into production-style frontend flows.

**Blockers / what I'm stuck on:**  
Faced multiple issues related to client component rendering, import path mismatches, environment configuration, and Supabase authentication setup. Also spent time debugging App Router compatibility issues caused by React Router imports and incorrect module exports.

Still exploring the best approach for generating intelligent SaaS optimization recommendations dynamically while keeping the MVP lightweight and understandable.

**Plan for tomorrow:**  
Add dynamic recommendation logic and smarter SaaS optimization insights, improve analytics visualization, implement protected routes for authenticated users, refine dashboard UX.

# DEVLOG

## Day 3 — 2026-05-08

**Hours worked:** 6

**What I did:**  
Enhanced the dashboard experience by adding more dynamic analytics cards, improved audit history rendering, and cleaner SaaS-style UI interactions. Refined the audit workflow and connected the audit engine directly with the results page to generate dynamic optimization reports based on user inputs.

Implemented a rule-based audit recommendation engine capable of analyzing AI tool plans, team size, usage patterns, and monthly spending to calculate optimized plans, monthly savings, annual savings, and waste scores. Added support for multiple AI tools including ChatGPT, Gemini, Claude, Cursor, Windsurf, and GitHub Copilot pricing logic.

Converted the results page into a fully dynamic route using the Next.js App Router (`/results/[id]`) to simulate shareable public audit reports. Added audit report sharing functionality and created reusable result cards for recommendations, savings analysis, and AI-generated optimization summaries.

Added automated testing setup using Jest and TypeScript. Created audit-engine unit tests to validate recommendation logic, savings calculations, optimization flows, and edge-case scenarios. Configured Jest type definitions, scripts, and testing environment for scalable future coverage.

Improved overall UI polish across the dashboard, audit flow, and results pages by refining layouts, spacing, typography, loading behavior, and transitions to make the platform feel closer to a production-grade SaaS application.

**What I learned:**  
Learned how to build deterministic business-rule systems for pricing optimization instead of relying entirely on AI-generated recommendations. Explored dynamic routing and parameter-based rendering in the Next.js App Router and understood how public shareable report systems are structured in SaaS products.

Also learned how automated testing improves confidence in recommendation engines and how to configure Jest with TypeScript in a modern Next.js project structure.

**Blockers / what I'm stuck on:**  
Spent time debugging TypeScript issues related to Jest test environments, dynamic route typing, and audit-engine return types. Still refining the recommendation logic to balance realistic SaaS pricing assumptions with understandable optimization outputs.

Need to further improve how multiple AI tools are aggregated into a single organization-wide optimization report.

**Plan for tomorrow:**  
Implement protected routes and session persistence, improve charts and spend visualization, add AI-generated summaries using external APIs, finalize documentation files, and prepare the platform for deployment and final polish.


## Day 4 — 2026-05-10

**Hours worked:** 8

**What I did:**
Implemented route protection with Next.js middleware and Supabase session checking.
Fixed a redirect loop caused by localStorage vs cookie session mismatch between
@supabase/supabase-js and @supabase/ssr — resolved by switching to a client-side
useAuthGuard hook. Fixed login redirect logic (login → /dashboard, signup → /audit)
and resolved the useSearchParams TypeScript error.

Fixed dashboard card visibility — Tailwind v4 zinc utility classes weren't generating
in the custom @theme config, replaced with explicit bg-zinc-950/900/border-zinc-800
classes. Rebuilt audit list from 2-column grid to vertical list so all cards are
visible. Fixed share button null crash when share_id was missing on old rows, added
clipboard fallback for HTTP. Added load-more pagination with progress dots and
back-to-top button. Enhanced home page with animated counters, tool ticker, and
feature cards.

**What I learned:**
Supabase localStorage sessions are invisible to server-side middleware — client-side
auth guards are the faster fix. Tailwind v4 custom themes don't auto-generate zinc
utilities — always use explicit classes matching other pages.

**Blockers / what I'm stuck on:**
Flash of protected page before useAuthGuard redirects. Proper fix needs @supabase/ssr
browser client migration.

**Plan for tomorrow:**
Build /api/summary Anthropic API route, shareable /audit/[id] public page, Open Graph
tags, complete GTM.md/ECONOMICS.md/LANDING_COPY.md/METRICS.md, deploy to Vercel,
run Lighthouse audit.
