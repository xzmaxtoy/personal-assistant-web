import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@/types/project';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      setProjects: (projects) => set({ projects }),

      setCurrentProject: (project) => set({ currentProject: project }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:3001/api/projects');

          if (!response.ok) {
            throw new Error('Failed to fetch projects');
          }

          const data = await response.json();
          set({
            projects: data.projects,
            isLoading: false
          });

          // Auto-select first project if none selected
          const currentProject = useProjectStore.getState().currentProject;
          if (!currentProject && data.projects.length > 0) {
            set({ currentProject: data.projects[0] });
          }
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false
          });
        }
      }
    }),
    {
      name: 'pa-project-storage',
      partialize: (state) => ({
        currentProject: state.currentProject
      })
    }
  )
);
