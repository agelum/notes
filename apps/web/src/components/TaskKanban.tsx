'use client'

import { useState, useEffect, useCallback } from 'react'
import { DataViews, tableSchema, type IRecord, type IDataViewsClient, type TableSchema } from 'shadcn-data-views'

interface Task {
  id: string
  title: string
  description: string
  state: 'pending' | 'doing' | 'done'
  createdAt: string
  epic?: string
}

const taskSchema: TableSchema = {
  id: 'tasks',
  name: 'Tasks',
  fields: [
    { id: 'title', name: 'Title', type: 'text', isPrimary: true },
    { id: 'description', name: 'Description', type: 'text' },
    { id: 'epic', name: 'Epic', type: 'text' },
    { id: 'status', name: 'Status', type: 'select', options: [
      { id: 'pending', name: 'Pending', color: 'yellow' },
      { id: 'doing', name: 'Doing', color: 'blue' },
      { id: 'done', name: 'Done', color: 'green' }
    ]},
    { id: 'createdAt', name: 'Created', type: 'date' }
  ]
}

const taskStatusOptions = taskSchema.fields.find((f) => f.id === 'status' && f.type === 'select')?.options || []
const taskStatusIdToName = new Map(taskStatusOptions.map((o) => [o.id, o.name]))
const taskStatusNameToId = new Map(taskStatusOptions.map((o) => [o.name, o.id]))

const toTaskUiStatus = (value: string) => taskStatusIdToName.get(value) || value
const toTaskApiStatus = (value: string) => taskStatusNameToId.get(value) || value

interface TaskKanbanProps {
  repo: string
  onTaskSelect: (task: Task) => void
}

export default function TaskKanban({ repo, onTaskSelect }: TaskKanbanProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?repo=${encodeURIComponent(repo)}`)
    const data = await res.json()
    setTasks(data.tasks || [])
  }, [repo])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, refreshKey])

  const createRecord = useCallback(async (record: Partial<IRecord>): Promise<IRecord> => {
    const title = record.fields?.title as string || 'Untitled Task'
    const description = record.fields?.description as string || ''
    const state = toTaskApiStatus((record.fields?.status as string) || 'pending')

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo,
        action: 'create',
        data: { title, description, state }
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create task')

    setRefreshKey(k => k + 1)

    return {
      id: data.task.id,
      fields: {
        title: data.task.title,
        description: data.task.description,
        status: toTaskUiStatus(data.task.state),
        createdAt: data.task.createdAt
      },
      createdAt: data.task.createdAt
    }
  }, [repo])

  const updateRecord = useCallback(async (id: string, record: Partial<IRecord>): Promise<IRecord> => {
    const task = tasks.find(t => t.id === id)
    if (!task) throw new Error('Task not found')

    const newState = record.fields?.status as string
    const fromState = task.state

    const toState = newState ? toTaskApiStatus(newState) : ''

    if (toState && toState !== fromState) {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          action: 'move',
          taskId: id,
          fromState,
          toState
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to move task')
      }
    }

    setRefreshKey(k => k + 1)

    return {
      id,
      fields: record.fields ? { ...record.fields, status: newState ? toTaskUiStatus(toState) : record.fields.status } : {},
      createdAt: task.createdAt
    }
  }, [repo, tasks])

  const deleteRecord = useCallback(async (_id: string): Promise<void> => {
    // Implement if needed
  }, [])

  const dbClient: IDataViewsClient = {
    getRecords: async () => {
      const records = tasks.map(task => ({
        id: task.id,
        fields: {
          title: task.title,
          description: task.description,
          epic: task.epic || '',
          status: toTaskUiStatus(task.state),
          createdAt: task.createdAt
        },
        createdAt: task.createdAt
      }))
      console.log('Tasks records:', JSON.stringify(records, null, 2))
      console.log('Tasks schema:', JSON.stringify(taskSchema, null, 2))
      return records
    },
    createRecord,
    updateRecord,
    deleteRecord
  }

  return (
    <div className="h-full dataviews-hide-header">
      <DataViews
        schema={taskSchema}
        dbClient={dbClient}
        config={{
          defaultView: 'kanban',
          language: 'en'
        }}
        key={refreshKey}
        onRecordClick={(record: IRecord) => {
          const task = tasks.find((t) => t.id === record.id)
          if (task) onTaskSelect(task)
        }}
      />
    </div>
  )
}
