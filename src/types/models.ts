// Core data models for the Vue SPA

export interface User {
  id: string
  email: string
  name: string
  roles: Role[]
  permissions: string[]
  team_id: string | null
  team?: Team
  email_verified_at: string | null
}

export interface Team {
  id: string
  name: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  team_id: string | null
  title: string
  description?: string
  status: 'draft' | 'in_progress' | 'completed'
  current_step: 'intro' | 'section_a' | 'section_b' | 'section_c' | 'complete'
  responses: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface FormResponse {
  id?: string
  project_id: string
  step: string
  data: Record<string, unknown>
  saved_at: string
}

export type Role = 'client' | 'consultant' | 'admin' | 'super-admin' | 'guest'
export type ProjectStatus = 'draft' | 'in_progress' | 'completed'
export type ProjectStep = 'intro' | 'section_a' | 'section_b' | 'section_c' | 'complete'
