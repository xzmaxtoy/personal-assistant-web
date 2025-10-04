import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { TaskSidebar } from './TaskSidebar';
import { SessionSidebar } from './SessionSidebar';

interface DashboardProps {
  children: ReactNode;
}

export function Dashboard({ children }: DashboardProps) {
  const [input, setInput] = useState('');

  const handleTaskClick = (taskCommand: string) => {
    if (taskCommand) {
      setInput(taskCommand);
      // Focus the input area if it exists
      const inputElement = document.querySelector('textarea[placeholder*="Ask Claude"]') as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.value = taskCommand;
        inputElement.focus();
        // Trigger input event to update React state
        const event = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <TaskSidebar onTaskClick={handleTaskClick} />

        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>

        <SessionSidebar />
      </div>
    </div>
  );
}
