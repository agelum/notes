'use client'

import { FolderGit2, ChevronRight, Folder } from 'lucide-react'

interface SidebarProps {
  repositories: string[]
  selectedRepo: string | null
  onSelectRepo: (repo: string) => void
}

export default function Sidebar({ repositories, selectedRepo, onSelectRepo }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-blue-400" />
          Agelum
        </h1>
        <p className="text-xs text-gray-400 mt-1">AI Document Manager</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">
          Repositories
        </h2>
        <ul className="space-y-1">
          {repositories.map((repo) => (
            <li key={repo}>
              <button
                onClick={() => onSelectRepo(repo)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedRepo === repo
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span className="truncate">{repo}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
