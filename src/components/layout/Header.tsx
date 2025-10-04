import { ProjectSelector } from '../project/ProjectSelector';

export function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">
            Personal Assistant
          </h1>
          <span className="text-xs text-gray-400">
            Powered by Claude Agent SDK
          </span>
        </div>

        <ProjectSelector />
      </div>
    </header>
  );
}
