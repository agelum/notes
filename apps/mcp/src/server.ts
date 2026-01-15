import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import fs from 'node:fs'
import path from 'node:path'

const server = new Server(
  {
    name: 'agelum',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

const AGELUM_STRUCTURE = [
  'docs',
  'plans',
  'tasks/pending',
  'tasks/doing',
  'tasks/done',
  'commands',
  'skills',
  'agents',
  'context',
  'epics'
]

function getAgelumPath(repoPath: string): string {
  return path.join(repoPath, 'agelum')
}

function ensureAgelumStructure(repoPath: string): string {
  const agelumPath = getAgelumPath(repoPath)

  if (!fs.existsSync(agelumPath)) {
    fs.mkdirSync(agelumPath, { recursive: true })
    AGELUM_STRUCTURE.forEach(dir => {
      fs.mkdirSync(path.join(agelumPath, dir), { recursive: true })
    })
  }

  return agelumPath
}

function findRepoPath(): string | null {
  // Use parent directory of where the MCP server is running
  const currentPath = process.cwd()
  const parentPath = path.dirname(currentPath)
  
  // Check if parent directory exists and has subdirectories
  if (fs.existsSync(parentPath)) {
    return parentPath
  }

  return null
}

const tools = {
  'create-task': {
    name: 'create-task',
    description: 'Create a new task file in the agelum structure. Returns the file path.',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Repository name (folder name in git directory)' },
        taskName: { type: 'string', description: 'Name of the task' },
        description: { type: 'string', description: 'Task description' },
        state: { type: 'string', enum: ['pending', 'doing', 'done'], default: 'pending', description: 'Initial state of the task' }
      },
      required: ['repo', 'taskName']
    }
  },
  'move-task': {
    name: 'move-task',
    description: 'Move a task to a different state (pending, doing, done)',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Repository name' },
        taskName: { type: 'string', description: 'Name of the task' },
        fromState: { type: 'string', enum: ['pending', 'doing', 'done'], description: 'Current state' },
        toState: { type: 'string', enum: ['pending', 'doing', 'done'], description: 'Target state' }
      },
      required: ['repo', 'taskName', 'fromState', 'toState']
    }
  },
  'create-document': {
    name: 'create-document',
    description: 'Create a new markdown document in the agelum structure',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Repository name' },
        category: { type: 'string', enum: ['docs', 'plans', 'commands', 'skills', 'agents', 'context', 'epics'], description: 'Document category' },
        documentName: { type: 'string', description: 'Name of the document' },
        content: { type: 'string', description: 'Document content' }
      },
      required: ['repo', 'category', 'documentName']
    }
  },
  'list-repositories': {
    name: 'list-repositories',
    description: 'List all repositories in the git directory',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  'read-document': {
    name: 'read-document',
    description: 'Read the content of a document',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Repository name' },
        category: { type: 'string', description: 'Document category' },
        documentName: { type: 'string', description: 'Name of the document' }
      },
      required: ['repo', 'documentName']
    }
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(tools)
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    const repoPath = findRepoPath()
    if (!repoPath) {
      throw new Error('Could not find git directory or repository')
    }

    switch (name) {
      case 'create-task': {
        const { repo, taskName, description = '', state = 'pending' } = args as {
          repo: string
          taskName: string
          description?: string
          state?: 'pending' | 'doing' | 'done'
        }

        const fullRepoPath = path.join(repoPath, repo)
        if (!fs.existsSync(fullRepoPath)) {
          throw new Error(`Repository ${repo} not found`)
        }

        const agelumPath = ensureAgelumStructure(fullRepoPath)
        const taskDir = path.join(agelumPath, 'tasks', state)

        const safeFileName = taskName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const filePath = path.join(taskDir, `${safeFileName}.md`)

        const frontmatter = `---
title: ${taskName}
created: ${new Date().toISOString()}
state: ${state}
---
`

        const content = `${frontmatter}\n# ${taskName}\n\n${description}\n`
        fs.writeFileSync(filePath, content)

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              path: filePath,
              message: `Task "${taskName}" created in ${state}`
            })
          }]
        }
      }

      case 'move-task': {
        const { repo, taskName, fromState, toState } = args as {
          repo: string
          taskName: string
          fromState: 'pending' | 'doing' | 'done'
          toState: 'pending' | 'doing' | 'done'
        }

        const fullRepoPath = path.join(repoPath, repo)
        if (!fs.existsSync(fullRepoPath)) {
          throw new Error(`Repository ${repo} not found`)
        }

        const safeFileName = taskName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const fromPath = path.join(fullRepoPath, 'agelum', 'tasks', fromState, `${safeFileName}.md`)
        const toPath = path.join(fullRepoPath, 'agelum', 'tasks', toState, `${safeFileName}.md`)

        if (!fs.existsSync(fromPath)) {
          throw new Error(`Task "${taskName}" not found in ${fromState}`)
        }

        fs.renameSync(fromPath, toPath)

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              from: fromPath,
              to: toPath,
              message: `Task "${taskName}" moved from ${fromState} to ${toState}`
            })
          }]
        }
      }

      case 'create-document': {
        const { repo, category, documentName, content = '' } = args as {
          repo: string
          category: 'docs' | 'plans' | 'commands' | 'skills' | 'agents' | 'context' | 'epics'
          documentName: string
          content?: string
        }

        const fullRepoPath = path.join(repoPath, repo)
        if (!fs.existsSync(fullRepoPath)) {
          throw new Error(`Repository ${repo} not found`)
        }

        const agelumPath = ensureAgelumStructure(fullRepoPath)
        const categoryDir = path.join(agelumPath, category)

        const safeFileName = documentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const filePath = path.join(categoryDir, `${safeFileName}.md`)

        const frontmatter = `---
title: ${documentName}
created: ${new Date().toISOString()}
category: ${category}
---
`

        fs.writeFileSync(filePath, `${frontmatter}\n${content}`)

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              path: filePath,
              message: `Document "${documentName}" created in ${category}`
            })
          }]
        }
      }

      case 'list-repositories': {
        const repos = fs.existsSync(repoPath)
          ? fs.readdirSync(repoPath).filter(f => fs.statSync(path.join(repoPath, f)).isDirectory())
          : []

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              repositories: repos,
              basePath: repoPath
            })
          }]
        }
      }

      case 'read-document': {
        const { repo, category, documentName } = args as {
          repo: string
          category: string
          documentName: string
        }

        const fullRepoPath = path.join(repoPath, repo)
        if (!fs.existsSync(fullRepoPath)) {
          throw new Error(`Repository ${repo} not found`)
        }

        const safeFileName = documentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const filePath = path.join(fullRepoPath, 'agelum', category, `${safeFileName}.md`)

        if (!fs.existsSync(filePath)) {
          throw new Error(`Document "${documentName}" not found in ${category}`)
        }

        const content = fs.readFileSync(filePath, 'utf-8')

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              path: filePath,
              content
            })
          }]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error instanceof Error ? error.message : String(error)
        })
      }]
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Agelum MCP server running on stdio')
}

main().catch(console.error)
