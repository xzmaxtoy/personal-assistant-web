import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectStore } from '@/stores/projectStore';
import { Badge } from '@/components/ui/badge';

export function ProjectSelector() {
  const {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    setCurrentProject
  } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className="text-xs">
        Error
      </Badge>
    );
  }

  if (projects.length === 0) {
    return (
      <Badge variant="outline" className="text-xs">
        No projects
      </Badge>
    );
  }

  return (
    <Select
      value={currentProject?.id}
      onValueChange={handleProjectChange}
    >
      <SelectTrigger className="w-full h-auto border-0 bg-transparent hover:bg-gray-50 p-0 focus:ring-0 shadow-none">
        <div className="flex items-center gap-2 w-full">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
            </div>
          </div>
          <div className="flex-1 text-left">
            <SelectValue placeholder="Select project" />
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id} className="text-sm">
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
