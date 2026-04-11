import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Zap, Bug, Clock, ArrowRight, Terminal, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Sparkles, title: "Plain English Explanations", description: "Understand any code instantly with clear, human-readable explanations." },
  { icon: Code2, title: "Line-by-Line Breakdown", description: "Get detailed annotations for every line of your code." },
  { icon: Bug, title: "Bug Detection", description: "Identify potential bugs, edge cases, and security issues automatically." },
  { icon: Zap, title: "Optimization Suggestions", description: "Receive actionable performance improvements and best practices." },
  { icon: Clock, title: "Complexity Analysis", description: "Understand time and space complexity at a glance." },
  { icon: Terminal, title: "Multi-Language Support", description: "Works with Python, JavaScript, TypeScript, Java, C++, and more." },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">CodeLens AI</span>
          </div>
          <Button variant="hero" size="sm" onClick={() => navigate("/workspace")}>
            Launch App <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Powered by AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Understand any code
              <br />
              <span className="text-gradient">in seconds</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Paste your code and get instant explanations, bug detection, optimization suggestions, and complexity analysis — powered by AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="hero" size="lg" onClick={() => navigate("/workspace")}>
                Try it now <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="hero-outline" size="lg" onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Learn more
              </Button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            className="mt-16 max-w-4xl mx-auto surface-elevated rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-muted-foreground ml-2 font-mono">workspace.tsx</span>
            </div>
            <div className="p-6 font-mono text-sm text-left">
              <div className="text-muted-foreground">
                <span className="text-primary">function</span>{" "}
                <span className="text-accent">fibonacci</span>
                <span className="text-foreground">(n) {"{"}</span>
              </div>
              <div className="text-muted-foreground pl-6">
                <span className="text-primary">if</span>{" "}
                <span className="text-foreground">(n {"<="} 1) </span>
                <span className="text-primary">return</span>{" "}
                <span className="text-foreground">n;</span>
              </div>
              <div className="text-muted-foreground pl-6">
                <span className="text-primary">return</span>{" "}
                <span className="text-accent">fibonacci</span>
                <span className="text-foreground">(n - 1) + </span>
                <span className="text-accent">fibonacci</span>
                <span className="text-foreground">(n - 2);</span>
              </div>
              <div className="text-foreground">{"}"}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to understand code</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From simple explanations to deep analysis, CodeLens AI covers it all.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="surface-elevated rounded-xl p-6 hover:border-primary/30 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="surface-elevated rounded-2xl p-12 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Ready to understand your code?</h2>
              <p className="text-muted-foreground mb-8">Start analyzing code instantly — no signup required.</p>
              <Button variant="hero" size="lg" onClick={() => navigate("/workspace")}>
                Open Workspace <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 CodeLens AI</span>
          <span>Built with AI</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
