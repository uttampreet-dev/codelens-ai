import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Code2, ArrowLeft, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ResultsPanel from "@/components/ResultsPanel";
import LanguageSelector from "@/components/LanguageSelector";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
console.log(fibonacci(10));`;

export interface LineExplanation {
  line: string;
  explanation: string;
}

export interface ExplanationResult {
  summary: string;
  language: string;
  complexity: string;
  lineByLine: LineExplanation[];
  bugs: string;
  optimizations: string;
  timeComplexity: string;
}

const Workspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);

  const handleExplain = async () => {
    if (!code.trim()) {
      toast({ title: "Please enter some code", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "https://4f885503-e5cb-4db5-85ab-3ae7992bd07d-00-2bej0mybq1zq3.riker.replit.dev/explain",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${errorText}`);
      }

      const data = await response.json();
      setResult(data as ExplanationResult);

    } catch (err: any) {
      console.error("Explain error:", err);
      toast({ title: "Error analyzing code", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">CodeLens AI</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector value={language} onChange={setLanguage} />
          <Button variant="hero" size="sm" onClick={handleExplain} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Play className="w-4 h-4" /> Explain Code</>
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className="flex-1 min-h-[300px] md:min-h-0 border-b md:border-b-0 md:border-r border-border">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(v) => setCode(v || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              renderLineHighlight: "gutter",
              smoothScrolling: true,
            }}
          />
        </div>
        <div className="flex-1 min-h-[300px] md:min-h-0 overflow-hidden">
          <ResultsPanel result={result} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Workspace;
