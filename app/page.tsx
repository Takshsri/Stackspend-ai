import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BadgeDollarSign,
  Sparkles,
  TrendingDown,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">
            StackSpend AI
          </h1>

          <Button>Audit My Stack</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            AI Spend Optimization Platform
          </p>

          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Stop Overspending on AI Tools
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Audit your startup’s AI stack and uncover hidden
            monthly savings across ChatGPT, Claude, Cursor,
            Gemini, Copilot, and more.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg">Audit My Stack</Button>

            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <BadgeDollarSign className="mb-4 h-10 w-10" />

              <h3 className="text-xl font-semibold">
                Detect Overspending
              </h3>

              <p className="mt-3 text-muted-foreground">
                Identify overpriced AI plans and unnecessary
                subscriptions across your stack.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <TrendingDown className="mb-4 h-10 w-10" />

              <h3 className="text-xl font-semibold">
                Compare Better Alternatives
              </h3>

              <p className="mt-3 text-muted-foreground">
                Discover lower-cost AI tools and optimized plans
                tailored to your team size and workflow.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <Sparkles className="mb-4 h-10 w-10" />

              <h3 className="text-xl font-semibold">
                Instant Savings Report
              </h3>

              <p className="mt-3 text-muted-foreground">
                Get personalized monthly and annual savings
                insights in seconds.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}