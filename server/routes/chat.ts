import express from 'express';
import { streamChatResponse } from '../services/agentService.js';
import { identifyTask, enhancePromptForPA } from '../services/commandRouter.js';

const router = express.Router();

/**
 * POST /api/chat - Stream chat responses from Agent SDK
 */
router.post('/chat', async (req, res) => {
  const { projectPath, message } = req.body;

  // Validate input
  if (!projectPath || !message) {
    return res.status(400).json({
      error: 'Missing required fields: projectPath and message'
    });
  }

  try {
    // Set headers for Server-Sent Events streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Identify if this is a PA automation task
    const taskInfo = identifyTask(message);
    const enhancedMessage = enhancePromptForPA(message, taskInfo);

    console.log('[Chat] Task type:', taskInfo.type);
    if (taskInfo.type === 'pa-task') {
      console.log('[Chat] PA Agent:', taskInfo.agent);
      console.log('[Chat] Task Folder:', taskInfo.taskFolder);
    }

    // Stream responses from Agent SDK
    for await (const chunk of streamChatResponse({
      projectPath,
      message: enhancedMessage
    })) {
      // Send chunk as Server-Sent Event
      const eventData = JSON.stringify(chunk);
      res.write(`data: ${eventData}\n\n`);
    }

    // Send completion signal
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('[Chat] Error:', error);

    // Send error to client
    const errorData = JSON.stringify({
      type: 'error',
      error: error.message || 'Unknown error occurred'
    });

    res.write(`data: ${errorData}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

export default router;
