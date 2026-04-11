import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const LanguageSelector = ({ value, onChange }: Props) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-36 h-9 text-sm bg-muted border-border">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {languages.map((l) => (
        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default LanguageSelector;
