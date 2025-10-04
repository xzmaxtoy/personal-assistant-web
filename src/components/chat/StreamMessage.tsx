import React from 'react';
import { Bot, User, AlertCircle, Terminal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

import {
  SystemInitWidget,
  ToolWidget,
  TodoWidget,
  UsageStatsWidget
} from '@/components/tool-widgets/ToolWidgets';
import type { ClaudeStreamMessage } from '@/types/claude';

interface StreamMessageProps {
  message: ClaudeStreamMessage;
  className?: string;
}

export const StreamMessage: React.FC<StreamMessageProps> = ({ message, className }) => {
  const { theme } = useTheme();
  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

  // Handle different message types with rich widgets
  switch (message.type) {
    case 'init':
      return (
        <div className={className}>
          <SystemInitWidget
            sessionId={message.sessionId || 'unknown'}
            model={message.model || 'unknown'}
            tools={message.tools || []}
          />
        </div>
      );

    case 'tool_use':
      return (
        <div className={className}>
          <ToolWidget
            toolName={message.toolName || 'unknown'}
            input={message.toolInput}
            result={message.toolResult}
            isComplete={false}
          />
        </div>
      );

    case 'tool_result':
      return (
        <div className={className}>
          <ToolWidget
            toolName={message.toolName || 'tool'}
            input={message.toolInput}
            result={message.toolResult}
            isComplete={true}
            error={message.error}
          />
        </div>
      );

    case 'result':
      return (
        <div className={cn("space-y-2", className)}>
          {message.content && (
            <Card className={cn(
              message.success === false
                ? "border-red-500/20 bg-red-500/5"
                : "border-green-500/20 bg-green-500/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {message.success === false ? (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <Terminal className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2">
                      {message.success === false ? 'Execution Failed' : 'Execution Complete'}
                    </h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={syntaxTheme}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage stats */}
          {(message.cost || message.duration || message.usage) && (
            <UsageStatsWidget
              cost={message.cost}
              duration={message.duration}
              usage={message.usage}
            />
          )}
        </div>
      );

    case 'assistant':
      return (
        <div className={className}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  {message.content && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={syntaxTheme}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'user':
      return (
        <div className={className}>
          <Card className="border-muted-foreground/20 bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'debug':
      // Only show debug messages in development
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className={className}>
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Terminal className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                      Debug
                    </div>
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                      {JSON.stringify(message, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
      return null;

    default:
      return null;
  }
};