'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Brain,
  Calendar,
  FileText,
  Settings,
  Zap,
  Globe,
  MessageSquare,
  Wrench,
  Database,
  Trash2,
  TrendingUp,
  Users,
  Package,
  Search,
  Clock,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectSelector } from '../project/ProjectSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TaskSidebarProps {
  className?: string;
  onTaskClick?: (taskCommand: string) => void;
}

interface TaskItem {
  name: string;
  icon: any;
  command: string;
  active?: boolean;
  badge?: string;
  children?: TaskItem[];
}

export function TaskSidebar({ className, onTaskClick }: TaskSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Analytics & Reports']);

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleTaskClick = (command: string) => {
    onTaskClick?.(command);
  };

  const taskItems: TaskItem[] = [
    {
      name: 'Analytics & Reports',
      icon: BarChart3,
      command: '',
      active: true,
      children: [
        { name: 'Daily Browser Analysis', icon: TrendingUp, command: 'start today\'s analysis' },
        { name: 'Business Intelligence', icon: Brain, command: 'business intelligence report' },
        { name: 'Time Tracking Report', icon: Clock, command: 'time tracking analysis' },
        { name: 'Productivity Metrics', icon: BarChart3, command: 'productivity metrics' }
      ]
    },
    {
      name: 'Business Operations',
      icon: Package,
      command: '',
      children: [
        { name: 'Bradoria Management', icon: Users, command: 'bradoria focus' },
        { name: 'TaskLift/Unhopp Tasks', icon: Zap, command: 'tasklift focus' },
        { name: 'Petnoya Operations', icon: Package, command: 'petnoya focus' },
        { name: 'GET Staffing Pipeline', icon: Users, command: 'get staffing focus' }
      ]
    },
    {
      name: 'Content & Social',
      icon: MessageSquare,
      command: '',
      children: [
        { name: 'Xiaohongshu Posts', icon: MessageSquare, command: 'generate xiaohongshu post' },
        { name: 'WeChat Content', icon: MessageSquare, command: 'generate wechat moments' },
        { name: 'Instagram/Facebook', icon: Globe, command: 'generate facebook post' },
        { name: 'Blog Articles', icon: FileText, command: 'generate blog post' }
      ]
    },
    {
      name: 'System Management',
      icon: Settings,
      command: '',
      children: [
        { name: 'Maintenance Tasks', icon: Wrench, command: 'run maintenance' },
        { name: 'Notion Sync', icon: Database, command: 'sync notion' },
        { name: 'File Cleanup', icon: Trash2, command: 'file cleanup' },
        { name: 'Health Checks', icon: Settings, command: 'maintenance check' }
      ]
    },
    {
      name: 'Quick Actions',
      icon: Zap,
      command: '',
      children: [
        { name: 'Daily Brief', icon: Calendar, command: 'daily brief' },
        { name: 'Quick Check', icon: Search, command: 'quick check' },
        { name: 'Optimize Schedule', icon: Calendar, command: 'optimize schedule' }
      ]
    }
  ];

  const renderTaskItem = (item: TaskItem, isChild = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems.includes(item.name);

    if (!isExpanded && !isChild) {
      return (
        <button
          key={item.name}
          onClick={() => !hasChildren && handleTaskClick(item.command)}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
            item.active
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          title={item.name}
        >
          <Icon className="h-4 w-4" />
        </button>
      );
    }

    return (
      <div key={item.name}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleItemExpansion(item.name);
            } else {
              handleTaskClick(item.command);
            }
          }}
          className={cn(
            'flex items-center w-full rounded-md transition-colors',
            isChild
              ? 'py-1.5 pl-8 pr-3 text-xs'
              : 'py-2 px-3 text-sm',
            item.active && !isChild
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className={cn('shrink-0', isChild ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          {isExpanded && (
            <>
              <span className={cn('flex-1 text-left ml-3', isChild && 'font-normal')}>
                {item.name}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                isItemExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )
              )}
              {!hasChildren && isChild && (
                <Play className="h-3 w-3 ml-auto opacity-50" />
              )}
            </>
          )}
        </button>

        {hasChildren && isItemExpanded && isExpanded && (
          <div className="mt-1 space-y-0.5">
            {item.children!.map(child => renderTaskItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      'border-r bg-background flex flex-col transition-all duration-300',
      isExpanded ? 'w-64' : 'w-16',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Project Selector / Logo */}
        {isExpanded ? (
          <div className="px-4 py-4 border-b">
            <ProjectSelector />
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 border-b">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Task Navigation */}
        <nav className={cn(
          'flex-1 overflow-y-auto py-4',
          isExpanded ? 'px-3 space-y-1' : 'px-2 space-y-2 flex flex-col items-center'
        )}>
          {taskItems.map(item => renderTaskItem(item))}
        </nav>

        {/* Download Section */}
        {isExpanded && (
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Personal Assistant</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated task execution powered by Claude Agent SDK
              </p>
              <Button size="sm" className="w-full">
                <Settings className="h-3 w-3 mr-2" />
                Task Settings
              </Button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                TB
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Toby Belhome</p>
                <p className="text-xs text-muted-foreground truncate">hello@tobybelhome.com</p>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        {isExpanded && (
          <div className="px-3 pb-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}