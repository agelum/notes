'use client'

import { FileText, X } from 'lucide-react'

interface FileViewerProps {
  file: { path: string; content: string } | null
}

export default function FileViewer({ file }: FileViewerProps) {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Select a file to view</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-200 truncate">{file.path.split('/').pop()}</span>
        </div>
        <span className="text-xs text-gray-500 truncate max-w-md">{file.path}</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
          {file.content}
        </pre>
      </div>
    </div>
  )
}
