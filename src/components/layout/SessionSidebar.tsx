'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/stores/projectStore';
import {
  MessageSquare,
  Clock,
  Settings2,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  Save,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionInfo {
  id: string;
  projectId: string;
  messageCount: number;
  lastActivity: Date;
  isActive: boolean;
  model: string;
  toolsUsed: string[];
  createdAt: Date;
}

interface ProjectSessionData {
  sessions: SessionInfo[];
  currentSessionId: string | null;
  count: number;
}

export function SessionSidebar() {
  const { projects, currentProject } = useProjectStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [allSessions, setAllSessions] = useState<Map<string, ProjectSessionData>>(new Map());
  const [loading, setLoading] = useState(false);

  // Load sessions for all projects
  useEffect(() => {
    const loadAllSessions = async () => {
      if (!projects.length) return;

      setLoading(true);
      try {
        const sessionPromises = projects.map(async (project) => {
          const response = await fetch(`http://localhost:3001/api/projects/${project.id}/sessions`);
          if (response.ok) {
            const data: ProjectSessionData = await response.json();
            // Convert string dates to Date objects
            data.sessions = data.sessions.map(session => ({
              ...session,
              lastActivity: new Date(session.lastActivity),
              createdAt: new Date(session.createdAt),
              isActive: session.id === data.currentSessionId
            }));
            return [project.id, data] as [string, ProjectSessionData];
          }
          return [project.id, { sessions: [], currentSessionId: null, count: 0 }] as [string, ProjectSessionData];
        });

        const results = await Promise.all(sessionPromises);
        setAllSessions(new Map(results));
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllSessions();
  }, [projects]);

  // Get current session from current project
  const currentProjectSessions = currentProject ? allSessions.get(currentProject.id) : null;
  const currentSession = currentProjectSessions?.sessions.find(s => s.isActive) || null;

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Session Management</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {/* Current Session */}
          {currentSession && (
            <div className="p-4 border-b">
              <h4 className="font-medium text-sm mb-3 text-green-600">Current Session</h4>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      <span className="text-sm font-medium">{currentProject?.name}</span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Session: {currentSession.id.slice(0, 8)}...</div>
                      <div>Model: {currentSession.model}</div>
                      <div>Messages: {currentSession.messageCount}</div>
                      <div>Tools: {currentSession.toolsUsed.length}</div>
                    </div>

                    <div className="flex gap-1 pt-2">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Project Sessions */}
          <div className="p-4">
            <h4 className="font-medium text-sm mb-3">Project Sessions</h4>
            {loading ? (
              <div className="text-xs text-muted-foreground">Loading sessions...</div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => {
                  const projectSessionData = allSessions.get(project.id);
                  const projectSessions = projectSessionData?.sessions || [];
                  const hasActiveSession = projectSessions.some(s => s.isActive);

                  return (
                    <Card
                      key={project.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        hasActiveSession && "border-primary/20 bg-primary/5"
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {hasActiveSession ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium">{project.name}</span>
                          </div>
                          {projectSessions.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {projectSessions.length}
                            </Badge>
                          )}
                        </div>

                        {projectSessions.length > 0 && (
                          <div className="space-y-1">
                            {projectSessions.slice(0, 2).map((session) => (
                              <div
                                key={session.id}
                                className="text-xs text-muted-foreground flex items-center justify-between"
                              >
                                <span>{session.messageCount} msgs</span>
                                <span>{session.lastActivity.toLocaleTimeString()}</span>
                              </div>
                            ))}

                            {!hasActiveSession && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-full mt-2 text-xs"
                                onClick={() => {
                                  // TODO: Implement session restoration
                                  console.log('Restore session for', project.id);
                                }}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restore Session
                              </Button>
                            )}
                          </div>
                        )}

                        {projectSessions.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            No sessions yet
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session Actions */}
          <div className="p-4 border-t mt-auto">
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Settings2 className="h-3 w-3 mr-1" />
                Session Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                Export History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}