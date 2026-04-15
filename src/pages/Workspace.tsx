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

// Mock Data Object
const MOCK_FIBONACCI_DATA: ExplanationResult = {
  summary: "This JavaScript code defines a recursive function named 'fibonacci' that calculates the nth Fibonacci number. It includes a base case for n less than or equal to 1 and a recursive step that sums the (n-1)th and (n-2)th Fibonacci numbers. The code then calculates and prints the 10th Fibonacci number to the console.",
  language: "javascript",
  complexity: "Intermediate",
  lineByLine: [
    { line: "1", explanation: "This line defines a new function named 'fibonacci' that accepts a single argument, 'n'." },
    { line: "2", explanation: "This is the base case for the recursion. If 'n' is 0 or 1, the function directly returns 'n' (since fib(0) = 0 and fib(1) = 1). This prevents infinite recursion." },
    { line: "3", explanation: "This is the recursive step. For 'n' greater than 1, the function calculates the Fibonacci number by summing the result of calling itself with 'n-1' and 'n-2'." },
    { line: "4", explanation: "This closes the definition of the 'fibonacci' function." },
    { line: "5", explanation: "An empty line for readability." },
    { line: "6", explanation: "This line calls the 'fibonacci' function with the argument '10' to calculate the 10th Fibonacci number, and then prints the returned value to the console." }
  ],
  bugs: "**Negative input:** The current base case `if (n ≤ 1)` does not explicitly handle negative `n` values. Calling `fibonacci(-1)` would lead to infinite recursion and eventually a stack overflow.\n**Performance for large 'n':** The naive recursive approach recalculates the same Fibonacci numbers multiple times, leading to exponential time complexity. For example, `fibonacci(5)` would calculate `fibonacci(3)` twice, `fibonacci(2)` three times, etc.",
  optimizations: "**Memoization/Dynamic Programming:** Store the results of expensive function calls and return the cached result when the same inputs occur again. This reduces the time complexity to O(n).\n**Iterative approach:** An iterative solution using a loop (e.g., using two variables to keep track of the previous two Fibonacci numbers) can be much more efficient, avoiding recursion overhead and stack overflow issues. This also achieves O(n) time complexity and O(1) space complexity.",
  timeComplexity: "O(2^n). This is because each call to `fibonacci(n)` generates two new calls, `fibonacci(n-1)` and `fibonacci(n-2)`, leading to an exponential growth in the number of function calls as 'n' increases. This is inefficient due to redundant calculations."
};

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

    // Realistic Demo Logic
    if (code.trim() === DEFAULT_CODE.trim()) {
      // Artificial delay to make it look like AI is thinking
      setTimeout(() => {
        setResult(MOCK_FIBONACCI_DATA);
        setIsLoading(false);
      }, 1500); 
      return;
    }

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

      if (!data.success) {
        toast({
          title: "AI Error",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      setResult(data.data as ExplanationResult);

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
