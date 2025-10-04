import { PA_CONFIG } from '../config/pa-config.js';

export interface TaskInfo {
  type: 'pa-task' | 'general-chat';
  agent?: string;
  taskFolder?: string;
  command?: string;
}

/**
 * Identify if a message is a PA automation task trigger
 */
export function identifyTask(message: string): TaskInfo {
  const lowerMessage = message.toLowerCase().trim();

  // Check if message matches any PA trigger commands
  for (const [trigger, agent] of Object.entries(PA_CONFIG.triggerCommands)) {
    if (lowerMessage.includes(trigger.toLowerCase())) {
      // Map agent name to task folder
      const agentKey = agent.replace('pa-', '').replace('-specialist', '');
      const taskFolder = PA_CONFIG.taskFolders[agentKey as keyof typeof PA_CONFIG.taskFolders];

      return {
        type: 'pa-task',
        agent,
        taskFolder,
        command: trigger
      };
    }
  }

  // Default to general chat
  return { type: 'general-chat' };
}

/**
 * Enhance prompt with PA context for automation tasks
 */
export function enhancePromptForPA(message: string, taskInfo: TaskInfo): string {
  if (taskInfo.type === 'general-chat') {
    return message;
  }

  return `
Task: ${message}

Context: This is a Personal Assistant automation task.
Agent: Use the ${taskInfo.agent} agent for execution.
${taskInfo.taskFolder ? `Instructions: Read ${taskInfo.taskFolder}/INSTRUCTIONS.md for detailed steps.` : ''}

Important:
1. Read PERSONAL_ASSISTANT_TASKS.md for task orchestration context
2. Use the Task tool to delegate to ${taskInfo.agent}
3. Follow the execution pattern from INSTRUCTIONS.md
4. Generate comprehensive reports with results
5. Create Notion database entries if required

Execute the task now.
  `.trim();
}
