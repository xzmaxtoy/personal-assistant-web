import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Terminal,
  FileText,
  Bot,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileCode,
  Search,
  Globe,
  ListTodo,
  DollarSign,
  Timer
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// System Initialization Widget
export const SystemInitWidget: React.FC<{
  sessionId: string;
  model: string;
  tools: string[];
}> = ({ sessionId, model, tools }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Session Initialized</span>
              <Badge variant="outline" className="text-xs">
                {model}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Session ID: <code className="font-mono">{sessionId}</code></div>
              <div className="flex items-center gap-2">
                <span>Tools available: {tools.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-auto p-1"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-2 p-2 bg-background rounded border">
                <div className="flex flex-wrap gap-1">
                  {tools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Tool Execution Widget
export const ToolWidget: React.FC<{
  toolName: string;
  input: any;
  result?: any;
  isComplete?: boolean;
  error?: string;
}> = ({ toolName, input, result, isComplete = false, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getToolIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('read')) return <FileText className="h-4 w-4" />;
    if (lowercaseName.includes('write')) return <FileCode className="h-4 w-4" />;
    if (lowercaseName.includes('bash')) return <Terminal className="h-4 w-4" />;
    if (lowercaseName.includes('search')) return <Search className="h-4 w-4" />;
    if (lowercaseName.includes('web')) return <Globe className="h-4 w-4" />;
    if (lowercaseName.includes('todo')) return <ListTodo className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className={cn(
      "border transition-colors",
      error ? "border-red-500/20 bg-red-500/5" :
      isComplete ? "border-green-500/20 bg-green-500/5" :
      "border-blue-500/20 bg-blue-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "mt-0.5",
            error ? "text-red-500" :
            isComplete ? "text-green-500" :
            "text-blue-500"
          )}>
            {getToolIcon(toolName)}
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {toolName}
              </span>
              {error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
              )}
            </div>

            {/* Tool Input */}
            {input && Object.keys(input).length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Input:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-auto p-1"
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="relative">
                    <pre className="text-xs font-mono bg-background border rounded p-2 overflow-x-auto">
                      {JSON.stringify(input, null, 2)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(input, null, 2))}
                      className="absolute top-1 right-1 h-auto p-1"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tool Result */}
            {result && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Result:</span>
                <div className="p-2 bg-background border rounded">
                  <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Todo Widget
export const TodoWidget: React.FC<{ todos: any[] }> = ({ todos }) => {
  const statusIcons = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    in_progress: <Clock className="h-4 w-4 text-blue-500 animate-pulse" />,
    pending: <Circle className="h-4 w-4 text-muted-foreground" />
  };

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ListTodo className="h-5 w-5 text-purple-500 mt-0.5" />
          <div className="flex-1 space-y-3">
            <span className="text-sm font-medium">Todo List Updated</span>

            <div className="space-y-2">
              {todos.map((todo, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded border bg-card/50",
                    todo.status === "completed" && "opacity-60"
                  )}
                >
                  <div className="mt-0.5">
                    {statusIcons[todo.status as keyof typeof statusIcons] || statusIcons.pending}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      {todo.content || todo.description || todo.task}
                    </div>
                    {todo.activeForm && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {todo.activeForm}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Usage Stats Widget
export const UsageStatsWidget: React.FC<{
  cost?: number;
  duration?: number;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}> = ({ cost, duration, usage }) => {
  return (
    <Card className="border-muted-foreground/20 bg-muted/10">
      <CardContent className="p-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {duration && (
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              <span>{(duration / 1000).toFixed(2)}s</span>
            </div>
          )}

          {cost && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>${cost.toFixed(4)}</span>
            </div>
          )}

          {usage && (
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span>
                {usage.input_tokens + usage.output_tokens} tokens
                ({usage.input_tokens} in, {usage.output_tokens} out)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};