# REFLECTION.md

## 1. The hardest bug you hit this week, and how you debugged it

The hardest bug was a redirect loop after successful login. After signing in, the app
kept bouncing back to `/login?redirectTo=%2Faudit` indefinitely instead of landing on
the dashboard. No error appeared in the console — it just looped silently.

My first hypothesis was that the Supabase session wasn't being created at all, so I
added `console.log` after `signInWithPassword` and confirmed the session object was
returned successfully. The auth itself was working. So the session existed client-side
but the middleware was still treating the user as unauthenticated.

Second hypothesis: the middleware was running before the session cookie was set. I
checked the middleware and found it was using `@supabase/ssr`'s `createServerClient`
which reads from **cookies**, but `lib/supabase.ts` was using the standard
`@supabase/supabase-js` `createClient` which stores sessions in **localStorage**.
These two clients are completely invisible to each other — the server can't read
localStorage, so the middleware always saw no session even after a successful login.

I confirmed this by temporarily logging `request.cookies.getAll()` in the middleware
and seeing zero auth cookies despite being logged in on the client.

The fix I shipped was replacing the middleware approach entirely with a client-side
`useAuthGuard` hook that calls `supabase.auth.getSession()` at the top of each
protected page. This works because both the hook and the login page use the same
localStorage-based client. I also added `router.refresh()` before `router.push()` in
the login handler to force Next.js to sync state before navigation.

The deeper fix — migrating to `@supabase/ssr` browser client throughout — is logged
as a known blocker in DEVLOG.md for a future iteration.

---

## 2. A decision you reversed mid-week, and what made you reverse it

I initially built the dashboard audit list as a 2-column CSS grid
(`grid-cols-2`) because it looked cleaner with multiple cards side by side. After
implementing pagination and load-more functionality, I kept getting reports that
previously loaded cards were invisible — users could only see the last card in the
list.

The problem was the grid layout. When new cards loaded, they appeared in a new row
above the fold, but users had no visual indication to scroll up. The "3 of 3 loaded"
message appeared at the bottom while the actual cards were hidden above. The grid also
broke badly when only one card was in a row — leaving a half-empty layout that looked
broken.

I reversed the decision and switched to a full-width vertical flex column
(`flex flex-col gap-3`). Every card is now full width, stacked sequentially, visible
in reading order. I also added an auto-scroll to the first newly loaded card after
clicking "Load more", so the user is always brought to new content rather than left
wondering where it went.

The lesson: grid layouts require careful thought about what happens at odd numbers and
after dynamic loads. For a list of variable-length content cards, a vertical list is
almost always the more predictable choice.

---

## 3. What you would build in week 2 if you had it

The highest-priority week 2 build would be the shareable public audit URL
(`/audit/[id]`) with proper Open Graph tags. Right now the share button copies a link
but the destination page doesn't exist as a standalone public route — it relies on
`sessionStorage` which clears when the tab closes. A proper public page would fetch
the `public_result` JSON directly from Supabase using the `share_id`, strip any
identifying information, and render a clean read-only audit report. This is the viral
loop the entire product depends on.

Second priority would be the `/api/summary` Anthropic API route with graceful
fallback. The audit engine gives defensible numbers but a one-paragraph personalized
summary — "your team is spending 3x the market rate on Claude for a writing workflow
that would be equally served by a $20/mo plan" — is what makes the report feel
genuinely valuable rather than a calculator output.

Third would be a proper Vercel deployment with Lighthouse scores verified against the
spec thresholds (Performance ≥85, Accessibility ≥90, Best Practices ≥90), environment
variables configured, and CI showing green. The product isn't real until it's deployed
and reachable at a public URL.

---

## 4. How you used AI tools

I used Claude (Sonnet) as the primary development assistant throughout the week, and
Cursor as the editor with inline completions for TypeScript and Tailwind.

Claude was most useful for: generating the complete audit engine with defensible
pricing logic across 9 tools, building the full dashboard and results page components
from spec requirements, writing the middleware auth protection, and debugging the
Supabase session mismatch — which it correctly diagnosed on the second attempt after
I gave it the error logs.

I did not trust Claude with: final pricing numbers in `PRICING_DATA.md` (every figure
was manually verified against vendor pricing pages), the DEVLOG entries (written by
hand to reflect what actually happened each day), and the USER_INTERVIEWS.md (real
conversations, not generated).

One specific time the AI was wrong: Claude initially suggested fixing the redirect loop
by adding `router.refresh()` alone, claiming that would sync the cookie session.
It didn't — the underlying mismatch between localStorage and cookie clients meant
there was nothing to refresh. I caught this because the loop persisted after
implementing the suggestion. The correct diagnosis came after I manually logged the
middleware cookies and saw they were empty, which led to the client-side auth guard
solution.

---

## 5. Self-ratings

**Discipline: 7/10**
Commits were spread across at least 5 distinct calendar days and DEVLOG entries were
written daily with honest blockers. Lost half a point for a few late-night cramming
sessions that could have been spread more evenly.

**Code quality: 6/10**
The audit engine is well-structured with pure functions and defensible logic. The
dashboard and results pages accumulated some inline style debt when the Tailwind v4
CSS variable approach failed, leaving a mix of utility classes and inline styles that
should be unified.

**Design sense: 7/10**
The dark zinc-950 aesthetic is consistent across pages, the results page hierarchy
(hero savings number → per-tool breakdown → Credex CTA) is logical, and the home page
animations add polish. The audit form could use visual progress feedback beyond the
step counter.

**Problem-solving: 8/10**
Diagnosed and resolved the Supabase session mismatch correctly after one failed
attempt. Identified the grid → vertical list fix quickly once the invisibility pattern
was clear. Pivoted away from middleware to client-side auth guard pragmatically given
the time constraint.

**Entrepreneurial thinking: 7/10**
The product logic is sound — free tool that surfaces real savings, Credex CTA gated
on genuine $500+/mo opportunity, email capture after value is shown. The GTM and
ECONOMICS files need more specific channel detail and real unit economics math to score
higher. User interviews were conducted with real people which is the non-negotiable
floor.

## Final Thoughts

This project taught me how real SaaS systems combine product thinking,
authentication, APIs, databases, UI/UX, deployment, and debugging under
tight time constraints. The biggest lesson was that building a working
product is mostly about solving integration problems rather than writing
isolated features.


