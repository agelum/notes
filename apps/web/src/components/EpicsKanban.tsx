'use client'

import { useState, useEffect, useCallback } from 'react'
import { DataViews, tableSchema, type IRecord, type IDataViewsClient, type TableSchema } from 'shadcn-data-views'

interface Epic {
  id: string
  title: string
  description: string
  state: 'pending' | 'doing' | 'done'
  createdAt: string
}

const epicSchema: TableSchema = {
  id: 'epics',
  name: 'Epics',
  fields: [
    { id: 'title', name: 'Title', type: 'text', isPrimary: true },
    { id: 'description', name: 'Description', type: 'text' },
    { id: 'state', name: 'Status', type: 'select', options: [
      { id: 'pending', name: 'Pending', color: 'yellow' },
      { id: 'doing', name: 'Doing', color: 'blue' },
      { id: 'done', name: 'Done', color: 'green' }
    ]},
    { id: 'createdAt', name: 'Created', type: 'date' }
  ]
}

interface EpicsKanbanProps {
  repo: string
  onEpicSelect: (epic: Epic) => void
}

export default function EpicsKanban({ repo, onEpicSelect }: EpicsKanbanProps) {
  const [epics, setEpics] = useState<Epic[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchEpics = useCallback(async () => {
    const res = await fetch(`/api/epics?repo=${encodeURIComponent(repo)}`)
    const data = await res.json()
    setEpics(data.epics || [])
  }, [repo])

  useEffect(() => {
    fetchEpics()
  }, [fetchEpics, refreshKey])

  const createRecord = useCallback(async (record: Partial<IRecord>): Promise<IRecord> => {
    const title = record.fields?.title as string || 'Untitled Epic'
    const description = record.fields?.description as string || ''
    const state = (record.fields?.state as string) || 'pending'

    const res = await fetch('/api/epics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo,
        action: 'create',
        data: { title, description, state }
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create epic')

    setRefreshKey(k => k + 1)

    return {
      id: data.epic.id,
      fields: {
        title: data.epic.title,
        description: data.epic.description,
        state: data.epic.state,
        createdAt: data.epic.createdAt
      },
      createdAt: data.epic.createdAt
    }
  }, [repo])

  const updateRecord = useCallback(async (id: string, record: Partial<IRecord>): Promise<IRecord> => {
    const epic = epics.find(e => e.id === id)
    if (!epic) throw new Error('Epic not found')

    const newState = record.fields?.state as string
    const fromState = epic.state

    if (newState && newState !== fromState) {
      const res = await fetch('/api/epics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          action: 'move',
          epicId: id,
          fromState,
          toState: newState
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to move epic')
      }
    }

    setRefreshKey(k => k + 1)

    return {
      id,
      fields: record.fields || {},
      createdAt: epic.createdAt
    }
  }, [repo, epics])

  const deleteRecord = useCallback(async (_id: string): Promise<void> => {
    // Implement if needed
  }, [])

  const dbClient: IDataViewsClient = {
    getRecords: async () => {
      return epics.map(epic => ({
        id: epic.id,
        fields: {
          title: epic.title,
          description: epic.description,
          state: epic.state,
          createdAt: epic.createdAt
        },
        createdAt: epic.createdAt
      }))
    },
    createRecord,
    updateRecord,
    deleteRecord
  }

  return (
    <div className="h-full dataviews-hide-header">
      <DataViews
        schema={epicSchema}
        dbClient={dbClient}
        config={{
          defaultView: 'kanban',
          language: 'en'
        }}
      />
    </div>
  )
}
