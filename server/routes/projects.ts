import express from 'express';
import { discoverProjects, getProject } from '../services/projectService.js';
import { PA_CONFIG } from '../config/pa-config.js';

const router = express.Router();

/**
 * GET /api/projects - List all Claude Code projects
 */
router.get('/projects', async (req, res) => {
  try {
    const rootPath = req.query.rootPath as string || PA_CONFIG.projectRoot;
    const projects = await discoverProjects(rootPath);

    res.json({
      projects,
      count: projects.length,
      rootPath
    });
  } catch (error: any) {
    console.error('[Projects] Discovery error:', error);
    res.status(500).json({
      error: 'Failed to discover projects',
      message: error.message
    });
  }
});

/**
 * GET /api/projects/:id - Get specific project details
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = req.query.path as string;

    if (!projectPath) {
      return res.status(400).json({
        error: 'Missing query parameter: path'
      });
    }

    const project = await getProject(projectPath);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or missing .claude/ directory'
      });
    }

    res.json(project);
  } catch (error: any) {
    console.error('[Projects] Get project error:', error);
    res.status(500).json({
      error: 'Failed to get project',
      message: error.message
    });
  }
});

export default router;
