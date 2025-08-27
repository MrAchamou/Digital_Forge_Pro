import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface CodePreviewProps {
  code: string;
  language?: string;
  maxHeight?: string;
}

export default function CodePreview({ 
  code, 
  language = "javascript", 
  maxHeight = "400px" 
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Code Copied",
        description: "Code has been copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive"
      });
    }
  };

  // Simple syntax highlighting for JavaScript
  const highlightSyntax = (code: string) => {
    if (language !== 'javascript') return code;

    return code
      // Keywords
      .replace(/\b(class|function|const|let|var|if|else|for|while|return|import|export|async|await|try|catch|throw|new)\b/g, 
        '<span class="keyword">$1</span>')
      // Strings
      .replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span class="string">$1$2$1</span>')
      // Comments
      .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
      // Function names
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span>')
      // Numbers
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');
  };

  return (
    <div className="relative">
      {/* Copy Button */}
      <Button
        onClick={handleCopy}
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 z-10 text-gray-400 hover:text-white hover:bg-forge-dark/80"
        data-testid="button-copy-code"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </>
        )}
      </Button>

      {/* Code Container */}
      <div 
        className="code-preview rounded-lg p-4 text-sm font-mono custom-scrollbar overflow-auto bg-forge-black/90 border border-forge-purple/30"
        style={{ maxHeight }}
        data-testid="code-preview-container"
      >
        <pre className="text-gray-300 whitespace-pre-wrap">
          <code 
            className="syntax-highlight block"
            dangerouslySetInnerHTML={{ 
              __html: highlightSyntax(code) 
            }}
          />
        </pre>
      </div>

      {/* Language Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="px-2 py-1 bg-forge-dark/80 text-xs text-gray-400 rounded border border-forge-purple/30">
          {language}
        </span>
      </div>
    </div>
  );
}
