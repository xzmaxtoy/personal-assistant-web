export interface Project {
  id: string;
  name: string;
  path: string;
  hasClaudeConfig: boolean;
  lastModified?: Date;
}

export interface ProjectsResponse {
  projects: Project[];
  count: number;
  rootPath: string;
}
