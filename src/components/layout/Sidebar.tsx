import { useState } from 'react';
import {
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  BarChart3,
  MessageSquare,
  Globe,
  Folder,
  FileText,
  GraduationCap,
  Activity,
  Building,
  Bitcoin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectSelector } from '../project/ProjectSelector';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  name: string;
  icon: any;
  active?: boolean;
  badge?: string;
  children?: NavItem[];
}

export function Sidebar({ className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['E-commerce']);

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const navItems: NavItem[] = [
    {
      name: 'Dashboards',
      icon: LayoutDashboard,
      children: [
        { name: 'Default', icon: LayoutDashboard }
      ]
    },
    {
      name: 'E-commerce',
      icon: ShoppingBag,
      active: true,
      children: [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Product List', icon: FileText },
        { name: 'Product Detail', icon: FileText },
        { name: 'Add Product', icon: FileText },
        { name: 'Order List', icon: FileText },
        { name: 'Order Detail', icon: FileText }
      ]
    },
    {
      name: 'Sales',
      icon: BarChart3
    },
    {
      name: 'CRM',
      icon: MessageSquare
    },
    {
      name: 'Website Analytics',
      icon: Activity
    },
    {
      name: 'Project Management',
      icon: Folder
    },
    {
      name: 'File Manager',
      icon: Folder
    },
    {
      name: 'Crypto',
      icon: Bitcoin
    },
    {
      name: 'Academy/School',
      icon: GraduationCap
    },
    {
      name: 'Hospital Management',
      icon: Activity
    },
    {
      name: 'Hotel Dashboard',
      icon: Building,
      badge: 'Coming'
    }
  ];

  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems.includes(item.name);

    if (!isExpanded && !isChild) {
      return (
        <button
          key={item.name}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
            item.active
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
          onClick={() => hasChildren && toggleItemExpansion(item.name)}
          className={cn(
            'flex items-center w-full rounded-md transition-colors',
            isChild
              ? 'py-1.5 pl-8 pr-3 text-xs'
              : 'py-2 px-3 text-sm',
            item.active && !isChild
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Icon className={cn('shrink-0', isChild ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          {isExpanded && (
            <>
              <span className={cn('flex-1 text-left ml-3', isChild && 'font-normal')}>
                {item.name}
              </span>
              {item.badge && (
                <span className="ml-2 text-xs text-gray-400">{item.badge}</span>
              )}
              {hasChildren && (
                isItemExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )
              )}
            </>
          )}
        </button>

        {hasChildren && isItemExpanded && isExpanded && (
          <div className="mt-1 space-y-0.5">
            {item.children!.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      'border-r border-gray-200 bg-white flex flex-col transition-all duration-300',
      isExpanded ? 'w-64' : 'w-16',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Project Selector / Logo */}
        {isExpanded ? (
          <div className="px-4 py-4 border-b border-gray-100">
            <ProjectSelector />
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 border-b border-gray-100">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center"
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          'flex-1 overflow-y-auto py-4',
          isExpanded ? 'px-3 space-y-1' : 'px-2 space-y-2 flex flex-col items-center'
        )}>
          {navItems.map(item => renderNavItem(item))}
        </nav>

        {/* User Info & Download Section */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* Download Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Download</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Unlock lifetime access to all dashboards, templates and components.
              </p>
              <button className="w-full bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                Get Shadcn UI Kit
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                TB
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Toby Belhome</p>
                <p className="text-xs text-gray-500 truncate">hello@tobybelhome.com</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
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
              className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
