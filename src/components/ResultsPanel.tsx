import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Sparkles, Code2, Bug, Zap, Clock, FileText, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExplanationResult } from "@/pages/Workspace";

interface Props {
  result: ExplanationResult | null;
  isLoading: boolean;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </Button>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <FileText className="w-8 h-8 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground mb-2">No analysis yet</h3>
    <p className="text-sm text-muted-foreground max-w-xs">
      Paste your code in the editor and click "Explain Code" to get started.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
      <Sparkles className="w-8 h-8 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground mb-2">Analyzing your code...</h3>
    <p className="text-sm text-muted-foreground">This usually takes a few seconds.</p>
  </div>
);

const SummaryTab = ({ result }: { result: ExplanationResult }) => (
  <ScrollArea className="h-full">
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {result.language}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          result.complexity === "Easy" ? "bg-green-500/10 text-green-400" :
          result.complexity === "Hard" ? "bg-red-500/10 text-red-400" :
          "bg-yellow-500/10 text-yellow-400"
        }`}>
          {result.complexity}
        </span>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{result.summary}</p>
    </div>
  </ScrollArea>
);

const LineByLineTab = ({ result }: { result: ExplanationResult }) => (
  <ScrollArea className="h-full">
    <div className="p-6 space-y-3">
      {result.lineByLine.map((item, i) => (
        <div key={i} className="surface-elevated rounded-lg p-3">
          <code className="text-xs font-mono text-primary block mb-1.5">{item.line}</code>
          <p className="text-xs text-muted-foreground">{item.explanation}</p>
        </div>
      ))}
    </div>
  </ScrollArea>
);

const TextTab = ({ content }: { content: string }) => (
  <div className="relative h-full">
    <div className="absolute top-3 right-3 z-10">
      <CopyButton text={content} />
    </div>
    <ScrollArea className="h-full">
      <div className="p-6 pr-12">
        <pre className="whitespace-pre-wrap font-mono text-sm text-foreground/90 leading-relaxed">{content}</pre>
      </div>
    </ScrollArea>
  </div>
);

const ResultsPanel = ({ result, isLoading }: Props) => {
  if (isLoading) return <LoadingState />;
  if (!result) return <EmptyState />;

  return (
    <Tabs defaultValue="summary" className="h-full flex flex-col">
      <div className="border-b border-border px-2 shrink-0">
        <TabsList className="bg-transparent h-11 gap-1">
          <TabsTrigger value="summary" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs gap-1.5 px-3">
            <Sparkles className="w-3.5 h-3.5" /> Explanation
          </TabsTrigger>
          <TabsTrigger value="lines" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs gap-1.5 px-3">
            <Code2 className="w-3.5 h-3.5" /> Line-by-Line
          </TabsTrigger>
          <TabsTrigger value="bugs" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs gap-1.5 px-3">
            <Bug className="w-3.5 h-3.5" /> Bugs
          </TabsTrigger>
          <TabsTrigger value="optimize" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs gap-1.5 px-3">
            <Zap className="w-3.5 h-3.5" /> Optimize
          </TabsTrigger>
          <TabsTrigger value="complexity" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs gap-1.5 px-3">
            <Clock className="w-3.5 h-3.5" /> Complexity
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="flex-1 min-h-0">
        <TabsContent value="summary" className="h-full m-0">
          <SummaryTab result={result} />
        </TabsContent>
        <TabsContent value="lines" className="h-full m-0">
          <LineByLineTab result={result} />
        </TabsContent>
        <TabsContent value="bugs" className="h-full m-0">
          <TextTab content={result.bugs} />
        </TabsContent>
        <TabsContent value="optimize" className="h-full m-0">
          <TextTab content={result.optimizations} />
        </TabsContent>
        <TabsContent value="complexity" className="h-full m-0">
          <TextTab content={result.timeComplexity} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default ResultsPanel;
