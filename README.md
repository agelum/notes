# Agelum

AI Document Management Tool for Development Projects

## Overview

Agelum is a Turborepo monorepo containing a Next.js application for managing AI-related documents within development projects. It automatically creates an `agelum` folder with a standardized directory structure and exposes an MCP (Model Context Protocol) server for programmatic access.

## Repository Structure

```
agelum/
├── apps/
│   ├── web/          # Next.js web application
│   └── mcp/          # MCP server (Model Context Protocol)
├── packages/         # Shared packages (for future use)
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```

## Agelum Directory Structure

When initialized in a project, Agelum creates:

```
agelum/
├── docs/          # Project documentation
├── plans/         # Planning documents
├── tasks/
│   ├── pending/   # Tasks waiting to be started
│   ├── doing/     # Tasks currently in progress
│   └── done/      # Completed tasks
├── commands/      # Command references and scripts
├── skills/        # Skill definitions
├── agents/        # Agent configurations
├── context/       # Context documents
└── epics/         # Epic definitions
```

## Features

- **Web Interface**: Browse repositories and files through a responsive sidebar and file browser
- **Kanban Board**: Visual task management with drag-and-drop powered by shadcn-data-views
- **MCP Server**: Programmatic access to manage documents and tasks
- **Repository Discovery**: Automatically discovers repositories in your `~/git` directory

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.0+

### Installation

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Or run individual apps:

```bash
# Next.js web app (http://localhost:3000)
pnpm --filter @agelum/web dev

# MCP server
pnpm --filter @agelum/mcp dev
```

### Build

Build all apps:

```bash
pnpm build
```

Or build individual apps:

```bash
pnpm --filter @agelum/web build
pnpm --filter @agelum/mcp build
```

## MCP Server

Start the MCP server for programmatic access:

```bash
pnpm --filter @agelum/mcp dev
```

## MCP Tools

### create-task

Create a new task file in the agelum structure.

```json
{
  "name": "create-task",
  "arguments": {
    "repo": "my-project",
    "taskName": "Implement feature X",
    "description": "Description of the task",
    "state": "pending"
  }
}
```

### move-task

Move a task between states (pending, doing, done).

```json
{
  "name": "move-task",
  "arguments": {
    "repo": "my-project",
    "taskName": "Implement feature X",
    "fromState": "pending",
    "toState": "doing"
  }
}
```

### create-document

Create a markdown document in any category.

```json
{
  "name": "create-document",
  "arguments": {
    "repo": "my-project",
    "category": "docs",
    "documentName": "API Reference",
    "content": "# API Reference\n\n..."
  }
}
```

### list-repositories

List all repositories in the git directory.

```json
{
  "name": "list-repositories",
  "arguments": {}
}
```

### read-document

Read the content of a document.

```json
{
  "name": "read-document",
  "arguments": {
    "repo": "my-project",
    "category": "docs",
    "documentName": "API Reference"
  }
}
```

## Environment Variables

- `HOME` or `USERPROFILE`: Used to locate the git directory containing repositories

## Architecture

- **Frontend**: Next.js 14 with React, Tailwind CSS, and shadcn-data-views
- **MCP Server**: TypeScript implementation using @modelcontextprotocol/sdk
- **Build System**: Turborepo for efficient monorepo management

## License

MIT
