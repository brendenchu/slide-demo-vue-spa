// Core data models for the Vue SPA

export interface User {
  id: string
  email: string
  name: string
  first_name?: string
  last_name?: string
  roles: Role[]
  permissions: string[]
  team_id: string | null
  team?: Team | null
  email_verified_at: string | null
}

export interface Team {
  id: string
  slug?: string
  name: string
  description?: string
  status: string
  is_personal?: boolean
  is_admin?: boolean
  is_owner?: boolean
  owner_id?: string | null
  current?: boolean
  created_at?: string
  updated_at?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  is_admin: boolean
  joined_at: string | null
}

export interface TeamInvitation {
  id: string
  email: string
  role: 'admin' | 'member'
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  team?: Team
  invited_by?: { id: string; name: string }
  expires_at: string | null
  created_at: string
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
