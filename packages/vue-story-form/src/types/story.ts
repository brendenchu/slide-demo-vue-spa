export interface ProjectStep {
  id: string
  slug: string
  name: string
}

/**
 * Minimal project interface used by the story form engine.
 * The consuming app's full Project type should satisfy this interface.
 */
export interface StoryProject {
  id: string
  status: 'draft' | 'in_progress' | 'completed'
  current_step: string
  responses: Record<string, unknown>
  updated_at: string
}
