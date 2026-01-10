import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DataSourceFactory } from './persistence/dataSourceFactory'
import { useAuthStore } from './auth'
import type { Project } from '@/types/models'

export const useProjectsStore = defineStore('projects', () => {
  // Create data source instance
  const dataSource = DataSourceFactory.create()
  const authStore = useAuthStore()

  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)

  // Getters
  const userProjects = computed(() => {
    if (!authStore.user) return []
    return projects.value.filter((p) => p.user_id === authStore.user!.id)
  })

  const inProgressProjects = computed(() => {
    return userProjects.value.filter((p) => p.status === 'in_progress')
  })

  const completedProjects = computed(() => {
    return userProjects.value.filter((p) => p.status === 'completed')
  })

  const draftProjects = computed(() => {
    return userProjects.value.filter((p) => p.status === 'draft')
  })

  // Actions
  async function fetchAll() {
    isLoading.value = true
    try {
      projects.value = await dataSource.getProjects()
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      const project = await dataSource.getProject(id)
      if (project) {
        currentProject.value = project
      }
      return project
    } catch (error) {
      console.error('Failed to fetch project:', error)
      throw error
    }
  }

  async function create(data: Partial<Project>) {
    try {
      const project = await dataSource.createProject({
        title: data.title || 'Untitled Story',
      })

      // Update local cache
      projects.value.push(project)

      return project
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  async function update(id: string, data: Partial<Project>) {
    try {
      const updated = await dataSource.updateProject(id, data)

      // Update local cache
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = updated
      }

      if (currentProject.value?.id === id) {
        currentProject.value = updated
      }

      return updated
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }

  async function saveResponses(
    projectId: string,
    step: string,
    responses: Record<string, unknown>
  ) {
    try {
      const updated = await dataSource.saveResponses(projectId, step, responses)

      // Update local cache
      const index = projects.value.findIndex((p) => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = updated
      }

      if (currentProject.value?.id === projectId) {
        currentProject.value = updated
      }

      return updated
    } catch (error) {
      console.error('Failed to save responses:', error)
      throw error
    }
  }

  async function complete(projectId: string) {
    try {
      const completed = await dataSource.completeProject(projectId)

      // Update local cache
      const index = projects.value.findIndex((p) => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = completed
      }

      if (currentProject.value?.id === projectId) {
        currentProject.value = completed
      }

      return completed
    } catch (error) {
      console.error('Failed to complete project:', error)
      throw error
    }
  }

  async function deleteProject(id: string) {
    try {
      await dataSource.deleteProject(id)

      // Update local cache
      projects.value = projects.value.filter((p) => p.id !== id)

      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  return {
    // State
    projects,
    currentProject,
    isLoading,
    // Getters
    userProjects,
    inProgressProjects,
    completedProjects,
    draftProjects,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    saveResponses,
    complete,
    deleteProject,
  }
})
