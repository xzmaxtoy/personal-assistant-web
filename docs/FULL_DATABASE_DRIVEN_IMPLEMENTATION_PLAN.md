# Full Database-Driven Personal Assistant Implementation Plan

## Overview

This document outlines the complete implementation plan for transitioning the Personal Assistant Web UI from a basic Agent SDK integration to a full database-driven architecture with **officially supported** dynamic subagent creation and flexible output destinations.

**✅ VALIDATED APPROACH**: All core features use officially supported Agent SDK capabilities, ensuring compatibility and future-proofing.

## Current State Assessment

### What We Have
- ✅ **Basic Web UI**: React + Express with Agent SDK integration
- ✅ **Session Management**: Custom session tracking (in-memory)
- ✅ **Project Discovery**: Automatic Claude Code project scanning
- ✅ **Rich Chat Interface**: Tool widgets and streaming responses
- ✅ **Dual-Sidebar Layout**: Task commands + session management

### What We're Building Towards
- 🎯 **Full Database Storage**: All process data, results, and metadata in database
- 🎯 **Dynamic Subagent Creation**: ✅ **Officially supported** - Runtime agent creation with specialized capabilities
- 🎯 **Flexible Tool Selection**: ✅ **Officially supported** - Dynamic tool permission management
- 🎯 **Flexible Output Destinations**: User-configurable result routing (custom implementation)
- 🎯 **Memory System Integration**: Contextual learning using available MCP tools
- 🎯 **Advanced Task Management**: Visual task creation with official Agent SDK patterns

## Implementation Phases

### Phase 1: Database Foundation (Weeks 1-2)

#### Week 1: Core Database Schema
**Goal**: Establish database foundation for all future features

**Tasks**:
1. **Database Setup**
   - Choose database system (PostgreSQL recommended)
   - Install and configure PostgreSQL locally and for production
   - Set up database connection pool and configuration
   - Create development, staging, and production configurations
   - Set up environment variable management (.env files)

2. **Migration Framework Setup**
   - Install database migration tool (Knex.js or Prisma recommended)
   - Create migration infrastructure and scripts
   - Set up rollback procedures and data safety measures
   - Create migration workflow documentation

3. **Core Schema Implementation**
   ```sql
   -- Core tables to implement (in order):
   1. users (if multi-user support planned)
   2. task_groups (sidebar organization)
   3. tasks (task definitions with official Agent SDK fields)
   4. task_executions (execution tracking)
   5. execution_steps (granular step tracking)
   6. output_destinations (user-configured outputs)
   7. mcp_tool_registry (dynamic tool management)
   8. memory_system_config (Mem0 integration settings)
   9. memory_tag_templates (structured memory templates)
   10. memory_usage_tracking (performance analytics)
   ```

4. **Database Service Layer**
   ```typescript
   // server/services/DatabaseService.ts
   class DatabaseService {
     // Connection management
     async initializeConnection()
     async closeConnection()
     async testConnection()

     // Core CRUD operations
     async createTask(taskConfig: TaskConfiguration)
     async updateTask(taskId: string, updates: Partial<Task>)
     async deleteTask(taskId: string)
     async getTask(taskId: string)
     async listTasks(userId: string, filters?: TaskFilters)

     // Execution management
     async createExecution(taskId: string, context: ExecutionContext)
     async updateExecutionStatus(executionId: string, status: ExecutionStatus)
     async storeExecutionResults(executionId: string, results: TaskResults)
     async getExecutionHistory(taskId: string, limit?: number)

     // Task grouping
     async createTaskGroup(groupData: CreateGroupRequest)
     async moveTaskToGroup(taskId: string, groupId: string)
     async getTaskGroups(userId: string)
     async updateGroupOrder(groupId: string, newOrder: number)

     // Tool registry
     async registerMCPTool(toolConfig: MCPToolConfig)
     async validateToolAccess(toolName: string)
     async updateToolPermissions(toolName: string, permissions: ToolPermissions)
   }
   ```

5. **Data Migration and Seeding**
   - Create seed data for common task templates
   - Import existing task configurations from file-based system
   - Set up development data fixtures for testing
   - Create user onboarding seed data

6. **Database Testing Infrastructure**
   - Set up test database separate from development
   - Create database integration tests
   - Add transaction rollback testing
   - Performance testing for core queries

**Deliverables**:
- [ ] PostgreSQL database installed and configured
- [ ] Migration framework set up and tested
- [ ] All core tables created with proper relationships and indexes
- [ ] Database service layer implemented with full CRUD operations
- [ ] Migration scripts tested with rollback procedures
- [ ] Seed data and development fixtures working
- [ ] Database integration tests passing
- [ ] Connection pooling and environment configuration working
- [ ] Database backup and recovery procedures documented

#### Week 2: MCP Tool Configuration System
**Goal**: ✅ **OFFICIAL APPROACH** - Manage MCP tools via configuration, not runtime creation

**Tasks**:
1. **MCP Configuration Management**
   ```typescript
   // server/services/MCPConfigService.ts
   class MCPConfigService {
     // ✅ OFFICIAL: Load project .mcp.json configuration
     async loadMCPConfiguration(projectPath: string): Promise<MCPConfiguration> {
       const configPath = path.join(projectPath, '.mcp.json');
       if (!fs.existsSync(configPath)) {
         throw new Error(`No .mcp.json found at ${configPath}`);
       }
       return JSON.parse(fs.readFileSync(configPath, 'utf8'));
     }

     // ✅ OFFICIAL: Validate MCP servers are accessible
     async validateMCPServers(config: MCPConfiguration): Promise<ValidationResult[]> {
       const results: ValidationResult[] = [];

       for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
         try {
           // Test server connectivity using official MCP protocol
           const isAccessible = await this.testMCPServerConnection(serverConfig);
           results.push({
             serverName,
             status: isAccessible ? 'connected' : 'unreachable',
             lastChecked: new Date()
           });
         } catch (error) {
           results.push({
             serverName,
             status: 'error',
             error: error.message,
             lastChecked: new Date()
           });
         }
       }

       return results;
     }

     // ✅ OFFICIAL: Catalog available tools from configured MCP servers
     async getAvailableTools(config: MCPConfiguration): Promise<ToolCatalog> {
       const catalog: ToolCatalog = { tools: [], lastUpdated: new Date() };

       for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
         try {
           // Use official MCP tool discovery protocol
           const serverTools = await this.discoverServerTools(serverName, serverConfig);
           catalog.tools.push(...serverTools.map(tool => ({
             name: `mcp__${serverName}__${tool.name}`,
             server: serverName,
             description: tool.description,
             parameters: tool.parameters,
             capabilities: tool.capabilities
           })));
         } catch (error) {
           console.warn(`Failed to discover tools for ${serverName}:`, error.message);
         }
       }

       return catalog;
     }

     // ✅ OFFICIAL: Test tool connectivity and permissions
     async testToolConnections(tools: string[]): Promise<ToolTestResult[]> {
       const results: ToolTestResult[] = [];

       for (const toolName of tools) {
         try {
           // Test tool availability using Agent SDK patterns
           const testResult = await this.validateToolAccess(toolName);
           results.push({
             toolName,
             available: testResult.accessible,
             permissions: testResult.permissions,
             lastTested: new Date()
           });
         } catch (error) {
           results.push({
             toolName,
             available: false,
             error: error.message,
             lastTested: new Date()
           });
         }
       }

       return results;
     }
   }
   ```

2. **Dynamic Tool Discovery & Registration**
   ```typescript
   // server/services/DynamicToolService.ts
   class DynamicToolService {
     // ✅ OFFICIAL: Agent-driven tool discovery
     async discoverTools(query: string, context: TaskContext): Promise<ToolDiscoveryResult[]> {
       const discoveries: ToolDiscoveryResult[] = [];

       // 1. Search npm registry for MCP servers
       const npmResults = await this.searchNpmMCPServers(query);

       // 2. Search GitHub for official MCP implementations
       const githubResults = await this.searchGithubMCPServers(query);

       // 3. Check existing .mcp.json for similar tools
       const existingTools = await this.findSimilarConfiguredTools(query, context.projectPath);

       return [...npmResults, ...githubResults, ...existingTools];
     }

     // ✅ OFFICIAL: Validate discovered tool before registration
     async validateTool(toolConfig: ToolConfiguration): Promise<ValidationResult> {
       try {
         // Test MCP server installation and startup
         const serverTest = await this.testMCPServerInstallation(toolConfig);
         if (!serverTest.success) {
           return { valid: false, error: 'Server installation failed', details: serverTest };
         }

         // Test tool functionality with safe operations
         const functionalTest = await this.testToolFunctionality(toolConfig);
         if (!functionalTest.success) {
           return { valid: false, error: 'Tool functionality test failed', details: functionalTest };
         }

         return {
           valid: true,
           capabilities: functionalTest.capabilities,
           security_assessment: await this.assessToolSecurity(toolConfig)
         };
       } catch (error) {
         return { valid: false, error: error.message };
       }
     }

     // ✅ OFFICIAL: Register tool for use (updates .mcp.json + database)
     async registerTool(toolConfig: ToolConfiguration, approval: ApprovalContext): Promise<RegistrationResult> {
       // 1. Update project .mcp.json file
       await this.updateMCPConfiguration(approval.projectPath, toolConfig);

       // 2. Store in database registry
       const dbEntry = await this.storeMCPToolRegistry({
         ...toolConfig,
         discovered_by: 'agent',
         discovery_context: approval.context,
         permission_level: approval.auto_approve ? 'allowed' : 'pending',
         auto_approved: approval.auto_approve
       });

       // 3. Test integration
       const integrationTest = await this.testToolIntegration(toolConfig, approval.projectPath);

       return {
         registered: integrationTest.success,
         tool_id: dbEntry.id,
         available_immediately: integrationTest.success,
         next_steps: integrationTest.success ? [] : ['manual_configuration_required']
       };
     }

     // ✅ OFFICIAL: Agent can request tool permission at runtime
     async requestToolPermission(toolName: string, context: TaskContext): Promise<PermissionResult> {
       const tool = await this.getMCPToolFromRegistry(toolName, context.userId);

       if (!tool) {
         // Tool not found - trigger discovery
         return {
           granted: false,
           action: 'discovery_required',
           suggestion: `I can search for and install "${toolName}" if you approve`
         };
       }

       if (tool.permission_level === 'allowed' || tool.auto_approved) {
         return { granted: true, tool_config: tool };
       }

       if (tool.permission_level === 'pending') {
         return {
           granted: false,
           action: 'approval_required',
           suggestion: `Tool "${toolName}" is available but needs your approval to use`
         };
       }

       return { granted: false, reason: tool.permission_level };
     }
   }
   ```

3. **Tool Selection API**
   ```typescript
   // API endpoints for tool management
   GET /api/tools - List configured MCP tools
   POST /api/tools/validate - Validate tool configuration
   PUT /api/tools/permissions - Update tool permissions
   GET /api/mcp/config - Get current MCP configuration
   ```

4. **Tool Permission UI**
   ```typescript
   // src/components/tools/ToolPermissionManager.tsx
   - Visual tool selection interface
   - Permission level configuration
   - Tool status indicators
   - MCP server health monitoring
   ```

**Deliverables**:
- [ ] MCP configuration service implemented
- [ ] Tool cataloging and validation working
- [ ] Tool permission API endpoints
- [ ] Tool management UI for configured tools

### Phase 2: Dynamic Task System (Weeks 3-4)

#### Week 3: Task Configuration UI
**Goal**: Visual task creation and management interface

**Tasks**:
1. **Task Creation UI**
   ```typescript
   // src/components/task/TaskCreator.tsx
   - Basic task information form
   - Tool selection interface
   - Instruction template editor
   - Output destination configuration
   ```

2. **Task Organization Service**
   ```typescript
   // server/services/TaskOrganizationService.ts
   class TaskOrganizationService {
     // ✅ AGENT-DRIVEN: Automatic task grouping
     async organizeTasksForUser(userId: string): Promise<OrganizationResult> {
       const ungroupedTasks = await this.getUngroupedTasks(userId);

       // Agent analyzes tasks and suggests groups
       const groupSuggestions = await this.analyzeTasksForGrouping(ungroupedTasks);

       // Create groups if they don't exist
       const createdGroups = [];
       for (const suggestion of groupSuggestions) {
         const group = await this.createOrFindGroup({
           name: suggestion.groupName,
           description: suggestion.description,
           icon: suggestion.suggestedIcon,
           color: suggestion.suggestedColor,
           created_by: 'agent'
         });
         createdGroups.push(group);

         // Move tasks to the group
         await this.moveTasksToGroup(suggestion.taskIds, group.id);
       }

       return {
         groupsCreated: createdGroups.length,
         tasksOrganized: ungroupedTasks.length,
         suggestions: groupSuggestions
       };
     }

     // ✅ AGENT-DRIVEN: Smart group creation based on task analysis
     async analyzeTasksForGrouping(tasks: Task[]): Promise<GroupSuggestion[]> {
       // Agent uses task names, descriptions, and categories to suggest logical groups
       const suggestions = [];

       // Group by business area
       const businessTasks = tasks.filter(t =>
         t.name.includes('business') || t.name.includes('report') || t.name.includes('analytics')
       );
       if (businessTasks.length > 0) {
         suggestions.push({
           groupName: 'Analytics & Reports',
           description: 'Business intelligence and data analysis tasks',
           suggestedIcon: 'BarChart3',
           suggestedColor: '#3b82f6',
           taskIds: businessTasks.map(t => t.id)
         });
       }

       // Group by automation type
       const automationTasks = tasks.filter(t =>
         t.name.includes('maintenance') || t.name.includes('system') || t.name.includes('health')
       );
       if (automationTasks.length > 0) {
         suggestions.push({
           groupName: 'System Management',
           description: 'System maintenance and health monitoring',
           suggestedIcon: 'Settings',
           suggestedColor: '#6b7280',
           taskIds: automationTasks.map(t => t.id)
         });
       }

       return suggestions;
     }

     // ✅ USER-DRIVEN: Manual group creation
     async createTaskGroup(groupData: CreateGroupRequest): Promise<TaskGroup> {
       return await this.db.createTaskGroup({
         ...groupData,
         created_by: 'user',
         display_order: await this.getNextDisplayOrder(groupData.userId)
       });
     }

     // ✅ FLEXIBLE: Move tasks between groups
     async moveTaskToGroup(taskId: string, groupId: string | null): Promise<void> {
       await this.db.updateTask(taskId, {
         group_id: groupId, // null = move to ungrouped
         display_order: groupId ? await this.getNextTaskOrder(groupId) : 0,
         updated_at: new Date()
       });
     }
   }
   ```

3. **Template System**
   ```typescript
   // server/services/TemplateService.ts
   class TemplateService {
     async renderTemplate(template: string, context: any)
     async validateTemplate(template: string)
     async createFromExisting(taskId: string)
   }
   ```

3. **Task Management API**
   ```typescript
   // API endpoints
   POST /api/tasks - Create new task
   GET /api/tasks - List user's tasks
   PUT /api/tasks/:id - Update task configuration
   DELETE /api/tasks/:id - Archive task
   ```

4. **Task Library**
   - Convert existing tasks to database templates
   - Create template marketplace/sharing
   - Import/export task configurations

**Deliverables**:
- [ ] Task creation UI completed
- [ ] Template system implemented
- [ ] Task management API
- [ ] Migration of existing tasks

#### Week 4: Dynamic Subagent Engine
**Goal**: ✅ **OFFICIAL APPROACH** - Execute tasks using official dynamic subagent creation

**Tasks**:
1. **Dynamic Subagent Factory**
   ```typescript
   // server/agents/SubagentFactory.ts
   class SubagentFactory {
     createBrowserAnalyst(context: TaskContext): AgentDefinition
     createContentGenerator(context: TaskContext): AgentDefinition
     createBusinessAnalyst(context: TaskContext): AgentDefinition
     createReportGenerator(context: TaskContext): AgentDefinition
   }
   ```

2. **✅ OFFICIAL: Agent-Driven Tool Discovery & Usage**
   ```typescript
   // Your exact workflow is officially supported!
   class MainAgent {
     async handleUserRequest(request: string, context: TaskContext): Promise<AgentResponse> {
       // 1. Agent uses WebSearch to find MCP tools online
       const searchResults = await this.searchForMCPTools(request);

       // 2. ✅ OFFICIAL: Agent can install and test MCP servers dynamically
       const mcpServers = {};
       const allowedTools = [];

       for (const tool of searchResults) {
         // Agent can install npm packages during conversation
         await this.installMCPServer(tool.package); // npm install @shopify/mcp-server

         // ✅ OFFICIAL: Test MCP server configuration
         const serverConfig = {
           command: "npx",
           args: [tool.package],
           env: tool.requiredEnv
         };

         // Add to dynamic configuration
         mcpServers[tool.name] = serverConfig;
         allowedTools.push(`mcp__${tool.name}__*`);
       }

       // 3. ✅ OFFICIAL: Execute with dynamically discovered tools
       const result = await query({
         prompt: this.buildTaskPrompt(request, context),
         options: {
           // ✅ OFFICIAL: Runtime MCP server configuration
           mcpServers: mcpServers,
           allowedTools: allowedTools,

           // ✅ OFFICIAL: Dynamic permission control
           canUseTool: async (toolName, input) => {
             return await this.requestUserPermission(toolName, input, context);
           },

           // ✅ OFFICIAL: Create specialized subagents
           agents: this.createSubagentsForTask(request, context)
         }
       });

       // 4. Store successful configurations in database for future use
       await this.storeMCPConfiguration(mcpServers, context);

       return result;
     }

     // ✅ OFFICIAL: Agent searches online for MCP tools
     async searchForMCPTools(taskDescription: string): Promise<MCPTool[]> {
       const searchQuery = `MCP server for ${taskDescription}`;
       const results = await this.webSearch(searchQuery);

       return results.filter(r =>
         r.title.includes('mcp-server') ||
         r.url.includes('github.com') ||
         r.url.includes('npmjs.com')
       ).map(r => ({
         name: this.extractMCPName(r),
         package: this.extractPackageName(r),
         requiredEnv: this.extractEnvRequirements(r)
       }));
     }
   }
   ```

3. **Official Agent SDK Integration**
   ```typescript
   // server/agents/MainAgent.ts
   import { query, AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

   class MainAgent {
     async executeTask(taskId: string, userInput: any, context: ExecutionContext) {
       const task = await this.loadTask(taskId);
       const agents = this.createAgentsForTask(task, context);

       // ✅ OFFICIAL: Dynamic agent creation using AgentDefinition
       const result = await query({
         prompt: this.buildTaskPrompt(task, userInput),
         options: {
           // ✅ OFFICIAL: Dynamic agents array
           agents: agents, // AgentDefinition[] for runtime subagent creation

           // ✅ OFFICIAL: Tool permission management
           allowedTools: task.required_tools, // Array of tool names from .mcp.json
           disallowedTools: task.restricted_tools, // Optional tool restrictions

           // ✅ OFFICIAL: Context loading
           settingSources: ['project', 'user'], // Load CLAUDE.md files
           workingDirectory: context.projectPath, // Project context

           // ✅ OFFICIAL: Model and system configuration
           model: 'sonnet', // Use cloud subscription model
           systemPrompt: {
             type: 'preset',
             preset: 'claude_code'
           }
         }
       });

       return this.processResults(result);
     }

     // ✅ OFFICIAL: AgentDefinition creation pattern
     createAgentsForTask(task: Task, context: ExecutionContext): AgentDefinition[] {
       const agents: AgentDefinition[] = [];

       // Create specialized subagents based on task requirements
       if (task.category === 'browser-analysis') {
         agents.push({
           type: 'pa-browser-analysis-specialist',
           description: 'Browser history analysis and productivity insights',
           instructions: task.instruction_template,
           allowedTools: ['Read', 'Write', 'Bash', 'mcp__chrome-devtools__*']
         });
       }

       if (task.category === 'content-generation') {
         agents.push({
           type: 'content-specialist',
           description: 'Generate and optimize content for multiple platforms',
           instructions: task.instruction_template,
           allowedTools: ['mcp__notionApi__*', 'mcp__gemini-cli__*', 'WebFetch']
         });
       }

       return agents;
     }
   }
   ```

3. **Execution Tracking**
   - Real-time progress tracking with Agent SDK streaming
   - Subagent execution logging
   - Official error handling patterns
   - Performance metrics collection

4. **Integration Testing**
   - End-to-end task execution with dynamic subagents
   - Official Agent SDK pattern verification
   - Performance benchmarking

**Deliverables**:
- [ ] Dynamic subagent factory implemented
- [ ] Official Agent SDK integration working
- [ ] Real-time progress tracking
- [ ] Integration tests passing

### Phase 3: Output Distribution System (Weeks 5-6)

#### Week 5: Output Destination Framework
**Goal**: Flexible, user-configurable result distribution

**Tasks**:
1. **Output Destination Management**
   ```typescript
   // server/services/OutputDistributionService.ts
   class OutputDistributionService {
     async distributeResults(executionId: string, results: TaskResults)
     async sendToDestination(destination: OutputDestination, results: any)
     async validateDestination(destination: OutputDestination)
   }
   ```

2. **Destination Types Implementation**
   - Web UI destination (enhanced display)
   - Notion integration
   - Slack webhook integration
   - Email notification system
   - Generic webhook support
   - File export (JSON, CSV, PDF)

3. **Destination Configuration UI**
   ```typescript
   // src/components/destinations/DestinationManager.tsx
   - Add/edit output destinations
   - Test destination connectivity
   - Configure destination-specific settings
   - Set default destinations per task type
   ```

4. **Conditional Routing**
   - Rule-based output routing
   - Success/failure different destinations
   - Content-type specific routing

**Deliverables**:
- [ ] Output distribution service
- [ ] All destination types implemented
- [ ] Destination management UI
- [ ] Conditional routing system

#### Week 6: Enhanced Web UI Results
**Goal**: Rich, interactive result visualization in web interface

**Tasks**:
1. **Result Dashboard**
   ```typescript
   // src/components/results/ResultDashboard.tsx
   - Execution history overview
   - Real-time execution monitoring
   - Result search and filtering
   - Performance analytics
   ```

2. **Interactive Result Viewers**
   ```typescript
   // src/components/results/viewers/
   - JSON data viewer with syntax highlighting
   - Table view for structured data
   - Chart/graph generation for analytics
   - Image/file preview capabilities
   ```

3. **Result Actions**
   - Re-send to different destinations
   - Download in various formats
   - Share results with team members
   - Create tasks from results

4. **Advanced Features**
   - Result comparison between executions
   - Trend analysis over time
   - Automated insights generation

**Deliverables**:
- [ ] Result dashboard completed
- [ ] Interactive result viewers
- [ ] Result action system
- [ ] Advanced analytics features

### Phase 4: Memory System Integration (Weeks 7-8)

#### Week 7: Integrated Mem0 Memory System
**Goal**: ✅ **OFFICIAL APPROACH** - Integrate existing sophisticated Mem0 memory system with database-driven architecture

**Tasks**:
1. **Enhanced MCP Memory Service with Existing Taxonomy**
   ```typescript
   // server/services/memory/PAMemoryService.ts
   class PAMemoryService {
     constructor() {
       // ✅ USE EXISTING: Mem0 cloud configuration
       this.mem0Config = {
         orgId: 'org_ESp6WlETjPEqJsrslZ74fIeosj5DoJLAPUlvJn3v',
         projectId: 'proj_kJkDq58eCY2CIJSTyQ79RkExT7m87eJzSUDoViQ3',
         userId: 'jesse-pa'
       };
     }

     // ✅ INTEGRATE: Existing structured tagging system
     async storeTaskExecution(execution: TaskExecution): Promise<void> {
       const memory = this.buildMemoryContent(execution);
       const tags = this.generateStructuredTags(execution);

       await this.mcpCall('mcp__mem0__add_memory', {
         content: memory,
         metadata: { tags, executionId: execution.id },
         userId: this.mem0Config.userId,
         projectId: this.mem0Config.projectId
       });
     }

     // ✅ EXISTING TAXONOMY: Use established tag structure
     generateStructuredTags(execution: TaskExecution): string[] {
       const tags = [];

       // Domain Tags (required)
       tags.push(this.getDomainTag(execution.task.category));

       // Type Tags
       tags.push('results', 'automation');

       // Context Tags
       tags.push('current');
       if (execution.status === 'completed') tags.push('critical');

       // Business Area Tags
       const businessArea = this.extractBusinessArea(execution.task.name);
       if (businessArea) tags.push(businessArea);

       // Temporal Tags
       tags.push(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

       return tags;
     }

     // ✅ MEMORY-DRIVEN: Retrieve context for task execution
     async getTaskContext(taskId: string, category: string): Promise<MemoryContext> {
       // Use existing search patterns from MEMORY_SYSTEM_GUIDE.md
       const searchQueries = this.buildContextSearchQueries(category);
       const memories = [];

       for (const query of searchQueries) {
         const results = await this.mcpCall('mcp__mem0__search_memory', {
           query: query.searchTerm,
           filters: { tags: query.tags },
           userId: this.mem0Config.userId,
           topK: 5
         });
         memories.push(...results);
       }

       return this.synthesizeMemoryContext(memories);
     }

     // ✅ EXISTING PATTERNS: Use established search patterns
     buildContextSearchQueries(category: string): SearchQuery[] {
       const queries = [];

       // Configuration queries
       queries.push({
         searchTerm: 'database configuration settings',
         tags: ['config', 'current']
       });

       // Business context queries
       if (category.includes('bradoria')) {
         queries.push({
           searchTerm: 'Bradoria business context',
           tags: ['business', 'area-21', 'current']
         });
       }

       // Technical troubleshooting
       queries.push({
         searchTerm: 'technical issues and solutions',
         tags: ['technical', 'troubleshooting']
       });

       return queries;
     }
   }
   ```

2. **Memory Templates for Database Tasks**
   ```typescript
   // ✅ INTEGRATE: Existing memory templates with new database operations
   const memoryTemplates = {
     taskExecution: (execution: TaskExecution) => ({
       content: `Task execution ${execution.task.name}: ${execution.status} in ${execution.duration_ms}ms with ${execution.results?.summary || 'no summary'}`,
       tags: ['session', 'results', 'automation', 'current', execution.task.category]
     }),

     taskGroupCreation: (group: TaskGroup) => ({
       content: `Task group "${group.name}" created with ${group.tasks?.length || 0} tasks, icon: ${group.icon}`,
       tags: ['config', 'workflow', 'current', 'critical']
     }),

     toolDiscovery: (tool: MCPTool, validation: ValidationResult) => ({
       content: `MCP tool ${tool.name} discovered and ${validation.valid ? 'validated' : 'failed validation'}: ${tool.description}`,
       tags: ['technical', 'automation', 'current', validation.valid ? 'optimization' : 'troubleshooting']
     }),

     businessInsight: (insight: BusinessInsight) => ({
       content: `Business insight for ${insight.businessArea}: ${insight.summary} with ${insight.metrics} performance`,
       tags: ['insights', 'business', insight.areaTag, 'current', 'optimization']
     })
   };
   ```

3. **Memory-Driven Task Execution Pattern**
   ```typescript
   // server/agents/MainAgent.ts - Enhanced with memory integration
   class MainAgent {
     async executeTask(taskId: string, context: ExecutionContext) {
       // 1. ✅ MEMORY-DRIVEN: Load relevant context from Mem0
       const memoryContext = await this.memoryService.getTaskContext(taskId, context.task.category);

       // 2. ✅ EXISTING PATTERNS: Use business area context
       const businessContext = memoryContext.businessAreas.find(ba =>
         context.task.name.toLowerCase().includes(ba.name.toLowerCase())
       );

       // 3. Execute task with enriched context
       const result = await query({
         prompt: this.buildPromptWithMemoryContext(context.task, memoryContext),
         options: {
           agents: this.createAgentsForTask(context.task, memoryContext),
           allowedTools: [...context.availableTools, 'mcp__mem0__*'],
           settingSources: ['project', 'user']
         }
       });

       // 4. ✅ AUTOMATIC MEMORY: Store execution results
       await this.memoryService.storeTaskExecution({
         taskId,
         result,
         context: memoryContext,
         timestamp: new Date()
       });

       return result;
     }

     // ✅ CONTEXT ENRICHMENT: Build prompts with memory context
     buildPromptWithMemoryContext(task: Task, memoryContext: MemoryContext): string {
       return `
         ${task.instruction_template}

         RELEVANT CONTEXT FROM MEMORY:
         - Configuration: ${memoryContext.configuration.join(', ')}
         - Business Context: ${memoryContext.businessContext}
         - Previous Results: ${memoryContext.recentResults.slice(0, 3).join(', ')}
         - Known Issues: ${memoryContext.troubleshooting.join(', ')}

         Execute this task with the above context in mind.
       `;
     }
   }
   ```

4. **Cross-Task Memory Sharing**
   - Leverage existing tag taxonomy for memory discovery across tasks
   - Automatic memory creation following established templates
   - Context inheritance from previous task executions
   - Business area knowledge transfer between related tasks

**Deliverables**:
- [ ] MCP-based memory service
- [ ] Memory provider selection logic
- [ ] Memory integration with Agent SDK
- [ ] Context automation working

#### Week 8: Advanced Memory Features
**Goal**: Intelligent context management and learning

**Tasks**:
1. **Smart Context Retrieval**
   ```typescript
   // Advanced context matching
   - Semantic similarity search
   - Business area context filtering
   - Temporal relevance scoring
   - User behavior pattern learning
   ```

2. **Memory Analytics**
   ```typescript
   // src/components/memory/MemoryAnalytics.tsx
   - Memory usage statistics
   - Context effectiveness metrics
   - Learning progress visualization
   ```

3. **Memory Management UI**
   ```typescript
   // src/components/memory/MemoryManager.tsx
   - Browse stored memories
   - Manual memory creation/editing
   - Memory tagging and organization
   - Memory export/import
   ```

4. **Privacy and Security**
   - Memory encryption for sensitive data
   - User consent for memory storage
   - Memory retention policies
   - Data anonymization options

**Deliverables**:
- [ ] Smart context retrieval
- [ ] Memory analytics dashboard
- [ ] Memory management UI
- [ ] Privacy/security features

### Phase 5: System Configuration & Advanced Features (Weeks 9-10)

#### Week 9: System Configuration Management
**Goal**: Complete database-driven configuration system including .env file management

**Tasks**:
1. **System Configuration Database Schema**
   ```sql
   -- Add to existing schema
   CREATE TABLE system_config (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id VARCHAR(100) NOT NULL,
     config_key VARCHAR(255) NOT NULL,
     config_value TEXT,
     config_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json, secret
     is_sensitive BOOLEAN DEFAULT FALSE, -- for passwords, API keys
     description TEXT,
     category VARCHAR(100), -- 'mcp', 'notification', 'business', 'system'
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(user_id, config_key)
   );

   CREATE TABLE config_templates (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     template_name VARCHAR(255) NOT NULL,
     config_schema JSONB NOT NULL, -- JSON schema for validation
     description TEXT,
     category VARCHAR(100),
     is_system_template BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Configuration Management Service**
   ```typescript
   // server/services/SystemConfigService.ts
   class SystemConfigService {
     // Configuration CRUD
     async getConfiguration(userId: string, category?: string): Promise<ConfigMap>
     async updateConfiguration(userId: string, key: string, value: any, type: string)
     async setSecureConfiguration(userId: string, key: string, value: string) // Encrypts sensitive data
     async deleteConfiguration(userId: string, key: string)

     // .env file integration
     async importEnvFile(userId: string, filePath: string): Promise<ImportResult>
     async exportEnvFile(userId: string, category?: string): Promise<string>
     async generateEnvFile(userId: string, targetPath: string): Promise<void>

     // Template management
     async getConfigTemplates(category?: string): Promise<ConfigTemplate[]>
     async applyTemplate(userId: string, templateId: string, values: Record<string, any>)
     async createTemplateFromConfig(userId: string, templateName: string, keys: string[])

     // Validation and security
     async validateConfiguration(config: ConfigurationRequest): Promise<ValidationResult>
     async encryptSensitiveValues(config: ConfigMap): Promise<ConfigMap>
     async decryptSensitiveValues(config: ConfigMap): Promise<ConfigMap>
   }
   ```

3. **Environment Configuration API**
   ```typescript
   // System Configuration Management
   GET    /api/admin/config                  // Get all system configurations
   GET    /api/admin/config/:category        // Get configurations by category
   PUT    /api/admin/config                  // Update system configuration
   POST   /api/admin/config                  // Create new configuration
   DELETE /api/admin/config/:key             // Remove configuration

   // Template Management
   GET    /api/admin/config/templates        // Get configuration templates
   POST   /api/admin/config/templates        // Create new template
   PUT    /api/admin/config/templates/:id    // Update template
   POST   /api/admin/config/apply-template   // Apply template to user config

   // .env File Management
   POST   /api/admin/config/import-env       // Import .env file to database
   GET    /api/admin/config/export-env       // Export database config as .env format
   POST   /api/admin/config/generate-env     // Generate .env file for deployment
   POST   /api/admin/config/validate         // Validate configuration values
   ```

4. **Admin Configuration UI**
   ```typescript
   // src/components/admin/config/SystemConfigurationPanel.tsx
   export const SystemConfigurationPanel = () => {
     // ✅ ENVIRONMENT VARIABLES MANAGEMENT
     const EnvironmentConfigSection = () => (
       <div className="space-y-4">
         <h3>Environment Variables</h3>
         <FileUpload
           label="Import .env file"
           accept=".env"
           onUpload={handleEnvImport}
         />
         <ConfigurationEditor
           configs={envConfigs}
           onUpdate={handleConfigUpdate}
           showSensitive={false} // Mask sensitive values
         />
         <Button onClick={handleExportEnv}>
           Export as .env file
         </Button>
       </div>
     );

     // ✅ MCP CREDENTIALS MANAGEMENT
     const MCPCredentialsSection = () => (
       <div className="space-y-4">
         <h3>MCP Server Credentials</h3>
         <SecureConfigEditor
           configs={mcpConfigs.filter(c => c.category === 'mcp')}
           onUpdate={handleSecureUpdate}
         />
         <ConfigTemplateSelector
           category="mcp"
           onApplyTemplate={handleApplyTemplate}
         />
       </div>
     );

     // ✅ BUSINESS CONFIGURATION
     const BusinessConfigSection = () => (
       <div className="space-y-4">
         <h3>Business Area Settings</h3>
         <BusinessAreaConfigEditor
           configs={businessConfigs}
           businessAreas={businessAreas}
           onUpdate={handleBusinessConfigUpdate}
         />
       </div>
     );

     return (
       <div className="space-y-8">
         <EnvironmentConfigSection />
         <MCPCredentialsSection />
         <BusinessConfigSection />
         <ConfigurationValidation />
         <ConfigurationBackup />
       </div>
     );
   };
   ```

5. **Migration Strategy for Existing .env Files**
   ```typescript
   // server/migrations/migrate-env-files.ts
   class EnvMigrationService {
     async migrateExistingEnvFiles(): Promise<MigrationResult> {
       const envPaths = [
         '/Users/jessexu/Personal Assistant/.env',
         '/Users/jessexu/personal-assistant-web/server/.env',
         // Additional .env files from Personal Assistant system
       ];

       const results = [];
       for (const envPath of envPaths) {
         if (fs.existsSync(envPath)) {
           const result = await this.importEnvFile('jesse-pa', envPath);
           results.push({ path: envPath, ...result });
         }
       }

       return { migrated: results.length, details: results };
     }

     async importEnvFile(userId: string, filePath: string): Promise<ImportResult> {
       const envContent = fs.readFileSync(filePath, 'utf8');
       const envVars = this.parseEnvFile(envContent);

       const imported = [];
       for (const [key, value] of Object.entries(envVars)) {
         const isSensitive = this.isSensitiveKey(key);
         const category = this.categorizeEnvVar(key);

         await this.configService.updateConfiguration(userId, key, value, 'string', {
           is_sensitive: isSensitive,
           category: category,
           source: 'env_migration'
         });

         imported.push({ key, category, sensitive: isSensitive });
       }

       return { imported: imported.length, details: imported };
     }
   }
   ```

6. **Configuration Security and Validation**
   - Encryption for sensitive configuration values
   - Configuration validation against schemas
   - Audit logging for configuration changes
   - Backup and restore procedures for configurations

**Deliverables**:
- [ ] System configuration database tables implemented
- [ ] Configuration management service with encryption
- [ ] Environment variable import/export functionality
- [ ] Admin UI for configuration management
- [ ] Configuration templates for common setups
- [ ] Migration scripts for existing .env files
- [ ] Configuration validation and security measures
- [ ] Audit logging for configuration changes

### Phase 5 Continued: Advanced Features & Polish

#### Week 9: Performance & Scalability
**Goal**: Optimize system for production use

**Tasks**:
1. **Performance Optimization**
   - Database query optimization
   - Caching layer implementation
   - Background job processing
   - Resource usage monitoring

2. **Scalability Improvements**
   - Connection pooling
   - Rate limiting
   - Load balancing considerations
   - Horizontal scaling preparation

3. **Monitoring & Observability**
   ```typescript
   // server/services/MonitoringService.ts
   - Application performance monitoring
   - Error tracking and alerting
   - Usage analytics
   - Health check endpoints
   ```

4. **Security Enhancements**
   - API authentication improvements
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection

**Deliverables**:
- [ ] Performance optimizations
- [ ] Scalability improvements
- [ ] Monitoring system
- [ ] Security hardening

#### Week 10: User Experience & Documentation
**Goal**: Polish UI/UX and create comprehensive documentation

**Tasks**:
1. **UI/UX Polish**
   ```typescript
   // Enhanced user interface
   - Responsive design improvements
   - Accessibility compliance
   - Dark mode support
   - Mobile optimization
   ```

2. **User Onboarding**
   ```typescript
   // src/components/onboarding/
   - Welcome tour for new users
   - Task creation wizard
   - Tool setup guidance
   - Best practices tutorial
   ```

3. **Documentation**
   - API documentation
   - User guide
   - Administrator guide
   - Development setup guide

4. **Testing & Quality Assurance**
   ```typescript
   // Comprehensive test suite structure
   tests/
   ├── unit/                 // Unit tests for individual components
   │   ├── services/         // Database service tests
   │   ├── agents/           // Agent SDK integration tests
   │   ├── memory/           // Memory system tests
   │   └── config/           // Configuration management tests
   ├── integration/          // Integration tests
   │   ├── database/         // Database integration tests
   │   ├── mcp-tools/        // MCP tool integration tests
   │   ├── api/              // API endpoint tests
   │   └── agent-workflows/  // End-to-end agent execution tests
   ├── e2e/                  // End-to-end tests
   │   ├── task-creation/    // Complete task creation workflows
   │   ├── task-execution/   // Task execution scenarios
   │   ├── memory-context/   // Memory-driven context tests
   │   └── output-delivery/  // Output destination tests
   ├── performance/          // Performance and load tests
   │   ├── database/         // Database query performance
   │   ├── memory/           // Memory retrieval performance
   │   ├── agent-execution/  // Agent execution performance
   │   └── concurrent-users/ // Multi-user load testing
   └── security/             // Security tests
       ├── authentication/   // Auth and authorization tests
       ├── data-encryption/  // Sensitive data protection tests
       ├── input-validation/ // Input sanitization tests
       └── mcp-security/     // MCP tool security validation
   ```

   **Test Coverage Requirements:**
   - Unit tests: >90% code coverage
   - Integration tests: All API endpoints and database operations
   - E2E tests: All critical user workflows
   - Performance tests: All database queries <100ms
   - Security tests: All input vectors and data handling

   **Quality Gates:**
   - All tests must pass before deployment
   - Performance benchmarks must be met
   - Security scans must show no critical vulnerabilities
   - Code review required for all changes

**Deliverables**:
- [ ] Polished UI/UX with accessibility compliance
- [ ] Interactive user onboarding system
- [ ] Complete documentation (API, user guide, admin guide)
- [ ] Comprehensive test suite with >90% coverage
- [ ] Performance testing with benchmarks
- [ ] Security testing and vulnerability assessment
- [ ] User acceptance testing completed
- [ ] Production deployment checklist

## Official Agent SDK Reference

### query() Function Parameters
```typescript
import { query, AgentDefinition, QueryOptions } from '@anthropic-ai/claude-agent-sdk';

// ✅ OFFICIAL: Complete query() function signature
const result = await query({
  prompt: string, // Required: The prompt/instruction to execute
  options?: {
    // ✅ Core Agent Configuration
    agents?: AgentDefinition[], // Dynamic subagent creation
    model?: 'sonnet' | 'haiku' | 'opus', // Model selection (cloud subscription)

    // ✅ System Prompt Configuration
    systemPrompt?: {
      type: 'preset' | 'custom',
      preset?: 'claude_code' | 'assistant', // Official presets
      content?: string // Custom system prompt (when type='custom')
    },

    // ✅ Tool Management
    allowedTools?: string[], // Whitelist: only these tools can be used
    disallowedTools?: string[], // Blacklist: these tools cannot be used

    // ✅ Context Loading
    settingSources?: ('project' | 'user')[], // Load CLAUDE.md files
    workingDirectory?: string, // Project path for context

    // ✅ Execution Control
    maxTokens?: number, // Response length limit
    temperature?: number, // Creativity/randomness (0-1)
    stopSequences?: string[], // Custom stop sequences

    // ✅ Streaming and Callbacks
    stream?: boolean, // Enable streaming responses
    onProgress?: (chunk: any) => void, // Streaming callback
    onToolUse?: (tool: any) => void, // Tool execution callback

    // ✅ Advanced Options
    metadata?: Record<string, any>, // Custom metadata
    timeout?: number, // Request timeout in milliseconds
    retries?: number // Retry attempts for failed requests
  }
});
```

### AgentDefinition Structure
```typescript
// ✅ OFFICIAL: AgentDefinition interface for dynamic subagent creation
interface AgentDefinition {
  // Required fields
  type: string; // Agent type identifier (e.g., 'pa-browser-analysis-specialist')
  description: string; // Human-readable description of agent capabilities

  // Optional configuration
  instructions?: string; // Specific instructions for this agent
  allowedTools?: string[]; // Tools this specific agent can use
  disallowedTools?: string[]; // Tools this agent cannot use
  systemPrompt?: string; // Custom system prompt for agent

  // Agent-specific settings
  model?: string; // Override default model for this agent
  temperature?: number; // Override creativity setting
  maxTokens?: number; // Override token limit

  // Context and data
  context?: Record<string, any>; // Agent-specific context data
  metadata?: Record<string, any>; // Additional agent metadata
}
```

### MCP Tool Configuration Patterns
```typescript
// ✅ OFFICIAL: Reading .mcp.json configuration
interface MCPConfiguration {
  mcpServers: {
    [serverName: string]: {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  };
}

// ✅ Tool naming patterns from MCP servers
const toolPatterns = {
  notion: 'mcp__notionApi__*', // All Notion API tools
  mem0: 'mcp__mem0__*', // All Mem0 memory tools
  shopify: 'mcp__shopify-dev-mcp__*', // All Shopify tools
  chrome: 'mcp__chrome-devtools__*', // All Chrome DevTools
  specific: 'mcp__notionApi__API-post-page' // Specific tool only
};
```

### settingSources Configuration
```typescript
// ✅ OFFICIAL: Context loading configuration
const contextExamples = {
  // Load project-specific CLAUDE.md only
  project: ['project'],

  // Load user global settings only
  user: ['user'],

  // Load both (recommended for full context)
  both: ['project', 'user'],

  // No additional context loading
  none: []
};

// File locations that settingSources will load:
// 'project': /path/to/project/CLAUDE.md + /path/to/project/.claude/
// 'user': ~/.claude/CLAUDE.md + ~/.claude/
```

## Technical Specifications

### Database Schema

#### Core Tables (Official Agent SDK Compatible)
```sql
-- ✅ OFFICIAL: Task Groups for sidebar organization
CREATE TABLE task_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL, -- "Analytics & Reports", "Business Operations"
  description TEXT,
  icon VARCHAR(50), -- "BarChart3", "Building2", "Zap"
  color VARCHAR(20), -- Hex color for visual distinction
  display_order INTEGER DEFAULT 0, -- Order in sidebar
  is_expandable BOOLEAN DEFAULT TRUE,
  is_expanded BOOLEAN DEFAULT TRUE, -- User's current expand state
  created_by VARCHAR(50) DEFAULT 'user', -- 'user', 'agent', 'system'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- ✅ OFFICIAL: Tasks table aligned with Agent SDK patterns
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- ✅ GROUPING: Task organization
  group_id UUID REFERENCES task_groups(id), -- NULL = "Ungrouped" section
  display_order INTEGER DEFAULT 0, -- Order within group

  -- Legacy category for backward compatibility
  category VARCHAR(100),
  trigger_commands JSONB,

  -- ✅ OFFICIAL: Agent SDK configuration
  subagent_definitions JSONB, -- AgentDefinition objects for runtime creation
  instruction_template TEXT, -- Template with context placeholders
  required_tools JSONB, -- Tools from .mcp.json configuration
  tool_permissions JSONB, -- allowedTools/disallowedTools configuration
  working_directory VARCHAR(500), -- Project path for settingSources

  -- ✅ UI Configuration
  icon VARCHAR(50), -- Task-specific icon
  color VARCHAR(20), -- Task-specific color
  quick_action BOOLEAN DEFAULT FALSE, -- Show in Quick Actions section

  -- User Preferences
  user_settings JSONB,
  default_outputs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active'
);

-- Task executions with memory integration
CREATE TABLE task_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  user_id VARCHAR(100),
  session_id VARCHAR(100),
  trigger_command TEXT,
  input_data JSONB,
  execution_strategy VARCHAR(50),
  status VARCHAR(20) DEFAULT 'queued',
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  duration_ms INTEGER,
  process_data JSONB,
  final_results JSONB,

  -- ✅ MEMORY INTEGRATION: Connect executions to Mem0 memories
  memory_context_used JSONB, -- Memories retrieved and used during execution
  memory_ids_created JSONB, -- New memories created from this execution
  business_area_tags TEXT[], -- Business area context applied
  memory_tags TEXT[], -- All memory tags associated with this execution

  metadata JSONB,
  output_destinations JSONB,
  error_details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ✅ MEMORY METADATA: Track memory usage patterns and optimization
CREATE TABLE memory_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES task_executions(id),
  user_id VARCHAR(100) DEFAULT 'jesse-pa',

  -- Memory retrieval metrics
  search_queries_used JSONB, -- Queries sent to Mem0
  memories_retrieved INTEGER DEFAULT 0,
  retrieval_time_ms INTEGER,
  relevance_scores JSONB, -- Memory relevance scoring

  -- Memory creation tracking
  memories_created INTEGER DEFAULT 0,
  memory_templates_used TEXT[], -- Templates from MEMORY_SYSTEM_GUIDE.md
  tags_applied TEXT[], -- Full tag taxonomy applied

  -- Performance metrics
  context_improvement_score DECIMAL(3,2), -- How much memory helped (0.0-1.0)
  tag_optimization_suggestions JSONB, -- Auto-suggested tag improvements

  created_at TIMESTAMP DEFAULT NOW()
);

-- ✅ MEMORY CONFIGURATION: User-configurable memory system settings
CREATE TABLE memory_system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,

  -- ✅ MEM0 CONFIGURATION: Store Mem0 credentials and settings
  mem0_org_id VARCHAR(255), -- org_ESp6WlETjPEqJsrslZ74fIeosj5DoJLAPUlvJn3v
  mem0_project_id VARCHAR(255), -- proj_kJkDq58eCY2CIJSTyQ79RkExT7m87eJzSUDoViQ3
  mem0_user_context VARCHAR(100) DEFAULT 'jesse-pa',
  mem0_api_endpoint VARCHAR(255) DEFAULT 'https://api.mem0.ai',
  mem0_enabled BOOLEAN DEFAULT TRUE,

  -- ✅ TAGGING CONFIGURATION: Customizable tag taxonomy
  domain_tags TEXT[] DEFAULT ARRAY['config', 'business', 'technical', 'session', 'insights'],
  type_tags TEXT[] DEFAULT ARRAY['database', 'workflow', 'settings', 'results', 'patterns', 'team', 'automation'],
  context_tags TEXT[] DEFAULT ARRAY['current', 'archived', 'critical', 'optimization', 'troubleshooting'],
  business_area_tags JSONB DEFAULT '{"area-01": "Jesse Personal", "area-21": "Bradoria", "area-22": "TaskLift/Unhopp", "area-23": "Petnoya", "area-24": "Side Business", "area-25": "Aifu", "area-26": "GET Staffing", "area-29": "Kidsense"}',
  temporal_tag_format VARCHAR(50) DEFAULT 'YYYY-MM', -- How to format temporal tags

  -- ✅ MEMORY PREFERENCES: User-configurable behavior
  auto_memory_creation BOOLEAN DEFAULT TRUE, -- Auto-create memories for task executions
  memory_retention_days INTEGER DEFAULT 365, -- How long to keep memories
  max_context_memories INTEGER DEFAULT 10, -- Max memories to retrieve for context
  context_relevance_threshold DECIMAL(3,2) DEFAULT 0.7, -- Minimum relevance score
  enable_cross_task_sharing BOOLEAN DEFAULT TRUE, -- Share memories across tasks

  -- ✅ PERFORMANCE SETTINGS: Optimization controls
  enable_memory_analytics BOOLEAN DEFAULT TRUE,
  tag_suggestion_enabled BOOLEAN DEFAULT TRUE,
  memory_cache_ttl_minutes INTEGER DEFAULT 30,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id) -- One config per user
);

-- ✅ MEMORY TAG TEMPLATES: User-customizable memory templates
CREATE TABLE memory_tag_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  template_name VARCHAR(100) NOT NULL, -- "task_execution", "tool_discovery", etc.
  template_description TEXT,

  -- Template configuration
  content_template TEXT NOT NULL, -- Template string with variables
  required_tags TEXT[] NOT NULL, -- Tags that must be included
  optional_tags TEXT[], -- Tags that may be included
  business_area_auto_detect BOOLEAN DEFAULT TRUE, -- Auto-detect business area from content

  -- Usage settings
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, template_name)
);

-- Output destinations
CREATE TABLE output_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  name VARCHAR(255),
  type VARCHAR(50),
  config JSONB,
  credentials_encrypted TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- ✅ OFFICIAL: Dynamic MCP Tools registry (agent-discoverable and configurable)
CREATE TABLE mcp_tool_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  project_path VARCHAR(500),

  -- Tool identification
  tool_name VARCHAR(255), -- e.g., "mcp__notionApi__API-post-page"
  mcp_server VARCHAR(100), -- e.g., "notionApi"
  server_command TEXT, -- e.g., "npx @anthropic-ai/mcp-server-notion"
  server_args JSONB, -- Additional server arguments
  server_env JSONB, -- Environment variables needed

  -- Discovery and validation
  discovered_by VARCHAR(50) DEFAULT 'agent', -- 'agent', 'user', 'system'
  discovery_context JSONB, -- Context when agent found this tool
  capabilities JSONB,
  permission_level VARCHAR(50) DEFAULT 'pending', -- "pending", "allowed", "disallowed", "conditional"
  validation_status VARCHAR(50) DEFAULT 'pending', -- "pending", "validated", "failed"
  validation_results JSONB,
  last_validated TIMESTAMP,

  -- Agent management
  auto_approved BOOLEAN DEFAULT FALSE, -- Can agent use without asking?
  approval_criteria JSONB, -- Rules for automatic approval
  usage_restrictions JSONB, -- Limits on when/how to use

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### Task Management
```typescript
// Task Group Management
GET    /api/task-groups              // List user's task groups
POST   /api/task-groups              // Create new group
PUT    /api/task-groups/:id          // Update group (name, icon, order)
DELETE /api/task-groups/:id          // Delete group (moves tasks to ungrouped)
PUT    /api/task-groups/:id/expand   // Toggle expand/collapse state

// Task CRUD operations
POST   /api/tasks                    // Create new task (defaults to ungrouped)
GET    /api/tasks                    // List user's tasks (grouped structure)
GET    /api/tasks/ungrouped          // List ungrouped tasks only
GET    /api/tasks/:id                // Get specific task
PUT    /api/tasks/:id                // Update task
PUT    /api/tasks/:id/move           // Move task to different group
PUT    /api/tasks/:id/reorder        // Change task order within group
DELETE /api/tasks/:id                // Archive task

// Task execution
POST   /api/tasks/:id/execute        // Execute task
GET    /api/tasks/:id/executions     // Get execution history
GET    /api/executions/:id           // Get specific execution
POST   /api/executions/:id/retry     // Retry failed execution

// Agent-driven organization
POST   /api/tasks/auto-organize      // Agent suggests/creates groups
POST   /api/tasks/batch-move         // Agent moves multiple tasks to groups
```

#### Custom MCP Server for Agent Access
```typescript
// server/mcp/internal-api-server.js
// ✅ SOLUTION: Agent can access all functionality via MCP tools

const mcpTools = {
  // Task Group Management
  "mcp__internal__list-task-groups": () => taskService.getTaskGroups(userId),
  "mcp__internal__create-task-group": (params) => taskService.createTaskGroup(params),
  "mcp__internal__update-task-group": (params) => taskService.updateTaskGroup(params),
  "mcp__internal__delete-task-group": (params) => taskService.deleteTaskGroup(params),

  // Task Management
  "mcp__internal__list-tasks": () => taskService.getTasks(userId),
  "mcp__internal__create-task": (params) => taskService.createTask(params),
  "mcp__internal__move-task": (params) => taskService.moveTaskToGroup(params),
  "mcp__internal__organize-tasks": () => taskOrganizationService.organizeTasksForUser(userId),

  // Tool Discovery & Registration
  "mcp__internal__search-mcp-tools": (query) => toolService.searchForMCPTools(query),
  "mcp__internal__validate-tool": (config) => toolService.validateTool(config),
  "mcp__internal__register-tool": (config) => toolService.registerTool(config),

  // Execution Management
  "mcp__internal__execute-task": (params) => taskService.executeTask(params),
  "mcp__internal__get-executions": (taskId) => taskService.getExecutions(taskId)
};
```

#### Updated Agent SDK Configuration
```typescript
// server/index.js - line 253-257 updated
allowedTools: [
  // Basic tools
  'Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Grep', 'Glob',
  'Task', 'TodoWrite', 'WebFetch', 'WebSearch',

  // ✅ AGENT ACCESS: Internal functionality via MCP
  'mcp__internal__*',  // All internal API operations
  'mcp__notionApi__*', // Existing MCP tools
  'mcp__mem0__*',
  'mcp__chrome-devtools__*'
]
```

#### Tool Management
```typescript
GET    /api/tools                    // List available tools
POST   /api/tools/discover           // Trigger tool discovery
PUT    /api/tools/:id/test           // Test tool availability
POST   /api/tools/:id/configure      // Configure tool settings
```

#### Output Destinations
```typescript
GET    /api/destinations             // List output destinations
POST   /api/destinations             // Create new destination
PUT    /api/destinations/:id         // Update destination
DELETE /api/destinations/:id         // Remove destination
POST   /api/destinations/:id/test    // Test destination
```

#### Memory System Management
```typescript
// Memory Configuration
GET    /api/memory/config             // Get user's memory configuration
PUT    /api/memory/config             // Update memory settings
POST   /api/memory/config/reset       // Reset to default configuration

// Memory Tag Management
GET    /api/memory/tags               // Get current tag taxonomy
PUT    /api/memory/tags/domain        // Update domain tags
PUT    /api/memory/tags/business      // Update business area tags
PUT    /api/memory/tags/temporal      // Update temporal tag format

// Memory Template Management
GET    /api/memory/templates          // List memory templates
POST   /api/memory/templates          // Create new template
PUT    /api/memory/templates/:id      // Update template
DELETE /api/memory/templates/:id      // Delete template
POST   /api/memory/templates/:id/test // Test template with sample data

// Memory Analytics & Insights
GET    /api/memory/analytics          // Memory usage statistics
GET    /api/memory/performance        // Memory system performance metrics
GET    /api/memory/suggestions        // AI-suggested improvements
POST   /api/memory/cleanup            // Clean up old/irrelevant memories

// Memory Search & Browse
GET    /api/memory/search             // Search memories with filters
GET    /api/memory/browse             // Browse memories by tags
GET    /api/memory/recent             // Recent memory activity
```

#### Admin UI Components for Memory Management
```typescript
// src/components/admin/memory/MemoryConfigurationPanel.tsx
export const MemoryConfigurationPanel = () => {
  // ✅ MEM0 CONNECTION SETTINGS
  const Mem0ConfigSection = () => (
    <div className="space-y-4">
      <h3>Mem0 Cloud Configuration</h3>
      <InputField
        label="Organization ID"
        value={config.mem0_org_id}
        placeholder="org_ESp6WlETjPEqJsrslZ74fIeosj5DoJLAPUlvJn3v"
      />
      <InputField
        label="Project ID"
        value={config.mem0_project_id}
        placeholder="proj_kJkDq58eCY2CIJSTyQ79RkExT7m87eJzSUDoViQ3"
      />
      <InputField
        label="User Context"
        value={config.mem0_user_context}
        placeholder="jesse-pa"
      />
      <ToggleField
        label="Enable Mem0 Integration"
        value={config.mem0_enabled}
      />
    </div>
  );

  // ✅ TAG TAXONOMY MANAGEMENT
  const TagTaxonomySection = () => (
    <div className="space-y-4">
      <h3>Tag Taxonomy Configuration</h3>
      <TagArrayEditor
        label="Domain Tags"
        tags={config.domain_tags}
        description="Primary categories: config, business, technical, session, insights"
      />
      <TagArrayEditor
        label="Type Tags"
        tags={config.type_tags}
        description="Content classification: database, workflow, settings, results, etc."
      />
      <BusinessAreaTagEditor
        businessAreas={config.business_area_tags}
        description="Configure business area tags and their descriptions"
      />
    </div>
  );

  // ✅ MEMORY BEHAVIOR SETTINGS
  const MemoryBehaviorSection = () => (
    <div className="space-y-4">
      <h3>Memory Behavior Settings</h3>
      <ToggleField
        label="Auto-create memories for task executions"
        value={config.auto_memory_creation}
      />
      <SliderField
        label="Memory retention (days)"
        value={config.memory_retention_days}
        min={30} max={730}
      />
      <SliderField
        label="Max context memories per task"
        value={config.max_context_memories}
        min={5} max={50}
      />
      <SliderField
        label="Context relevance threshold"
        value={config.context_relevance_threshold}
        min={0.1} max={1.0} step={0.1}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <Mem0ConfigSection />
      <TagTaxonomySection />
      <MemoryBehaviorSection />
      <MemoryTemplateManager />
      <MemoryAnalyticsDashboard />
    </div>
  );
};

// src/components/admin/memory/MemoryTemplateManager.tsx
export const MemoryTemplateManager = () => {
  // Template creation and editing interface
  // Live preview of template with sample data
  // Template validation and testing
  // Usage statistics for each template
};

// src/components/admin/memory/MemoryAnalyticsDashboard.tsx
export const MemoryAnalyticsDashboard = () => {
  // Memory usage statistics over time
  // Tag distribution analytics
  // Performance metrics (retrieval time, relevance scores)
  // Memory optimization suggestions
  // Cross-task memory sharing effectiveness
};
```

### Environment Configuration

#### Development Setup
```env
# Database
DATABASE_URL=postgresql://localhost:5432/personal_assistant_dev
DATABASE_POOL_SIZE=10

# Agent SDK
CLAUDE_API_KEY=your_api_key_here
CLAUDE_MODEL=sonnet

# Memory System
MEM0_API_KEY=your_mem0_key
MEM0_ORG_ID=your_org_id
MEM0_PROJECT_ID=your_project_id

# Output Destinations
NOTION_API_KEY=your_notion_key
SLACK_WEBHOOK_URL=your_slack_webhook
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

#### Production Considerations
```env
# Security
SESSION_SECRET=strong_random_secret
JWT_SECRET=jwt_signing_secret
ENCRYPTION_KEY=data_encryption_key

# Performance
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
METRICS_ENABLED=true
```

## Success Metrics

### Technical Metrics
- [ ] **Database Performance**: Query response time < 100ms for 95% of requests
- [ ] **Tool Discovery**: 100% accuracy in available tool detection
- [ ] **Execution Reliability**: 99%+ success rate for well-configured tasks
- [ ] **Memory System**: Context retrieval accuracy > 90%

### User Experience Metrics
- [ ] **Task Creation Time**: < 5 minutes for new task setup
- [ ] **Execution Visibility**: Real-time progress updates
- [ ] **Result Access**: Multiple output formats available
- [ ] **Learning Curve**: New users productive within 30 minutes

### Business Metrics
- [ ] **Task Automation**: 80% reduction in manual work for routine tasks
- [ ] **Integration Flexibility**: Support for 5+ output destination types
- [ ] **Extensibility**: New task types can be added without code changes
- [ ] **Reliability**: 24/7 operation with minimal downtime

## Risk Assessment & Mitigation

### Technical Risks
1. **Database Performance**: Implement proper indexing and query optimization
2. **Agent SDK Reliability**: Build retry mechanisms and fallback strategies
3. **Tool Integration**: Comprehensive error handling for MCP tools
4. **Memory System**: Graceful degradation when memory providers fail

### User Experience Risks
1. **Complexity**: Progressive disclosure of advanced features
2. **Learning Curve**: Comprehensive onboarding and documentation
3. **Configuration Overhead**: Smart defaults and templates
4. **Migration Friction**: Automated migration from existing system

### Operational Risks
1. **Data Loss**: Regular backups and transaction safety
2. **Security**: Proper authentication and data encryption
3. **Scalability**: Design for horizontal scaling from day one
4. **Maintenance**: Automated testing and deployment pipelines

## Next Steps

### Immediate Actions (Week 1)
1. **Project Setup**
   - Create development branch
   - Set up database (PostgreSQL)
   - Configure development environment
   - Set up project management tools

2. **Team Coordination**
   - Review implementation plan
   - Assign phase responsibilities
   - Set up regular check-in meetings
   - Establish communication channels

3. **Technical Foundation**
   - Database schema implementation
   - Basic database service layer
   - Initial migration scripts
   - Development environment testing

### Decision Points
- **Database Choice**: PostgreSQL vs MySQL vs SQLite
- **Memory Provider**: Mem0 vs Notion vs custom implementation
- **UI Framework**: Continue with current React setup vs upgrade
- **Deployment Strategy**: Docker vs serverless vs traditional hosting

---

**Document Version**: 1.0
**Last Updated**: 2025-01-17
**Author**: Claude Code
**Review Date**: Weekly during implementation

This plan provides a comprehensive roadmap for transforming the Personal Assistant Web UI into a full database-driven system while maintaining all current functionality and adding significant new capabilities.