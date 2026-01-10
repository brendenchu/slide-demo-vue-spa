import { storage } from './storage'
import type { User, Team, Project } from '@/types/models'

export async function seedDemoData() {
  console.log('Seeding demo data...')

  // Seed demo users (matching backend seeder credentials)
  // These users are created by the backend database seeder
  const clientUser: User = {
    id: '1',
    email: 'client@demo.com',
    name: 'Client User',
    roles: ['client'],
    permissions: ['view-project', 'create-project', 'update-project'],
    team_id: '1',
    email_verified_at: new Date().toISOString(),
  }

  const adminUser: User = {
    id: '2',
    email: 'admin@demo.com',
    name: 'Super Admin',
    roles: ['super-admin'],
    permissions: [
      'view-user',
      'create-user',
      'update-user',
      'delete-user',
      'view-project',
      'create-project',
      'update-project',
      'delete-project',
    ],
    team_id: null,
    email_verified_at: new Date().toISOString(),
  }

  const consultantUser: User = {
    id: '3',
    email: 'consultant@example.com',
    name: 'Consultant User',
    roles: ['consultant'],
    permissions: ['view-project', 'create-project', 'update-project'],
    team_id: '1',
    email_verified_at: new Date().toISOString(),
  }

  const guestUser: User = {
    id: '4',
    email: 'guest@demo.com',
    name: 'Guest User',
    roles: ['guest'],
    permissions: ['view-project'],
    team_id: null,
    email_verified_at: new Date().toISOString(),
  }

  await storage.set('user:1', clientUser)
  await storage.set('user:2', adminUser)
  await storage.set('user:3', consultantUser)
  await storage.set('user:4', guestUser)

  // Seed demo team
  const team: Team = {
    id: '1',
    name: 'Acme Corporation',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await storage.set('team:1', team)

  // Seed a sample in-progress project
  const project: Project = {
    id: 'demo-project-1',
    user_id: '1',
    team_id: '1',
    title: 'Sample Story',
    status: 'in_progress',
    current_step: 'section_a',
    responses: {
      intro: {
        field1: 'Sample intro response',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await storage.set('project:demo-project-1', project)

  // Seed a completed project
  const completedProject: Project = {
    id: 'demo-project-2',
    user_id: '1',
    team_id: '1',
    title: 'Completed Story Example',
    status: 'completed',
    current_step: 'complete',
    responses: {
      intro: { field1: 'Completed intro' },
      section_a: { field2: 'Completed section A' },
      section_b: { field3: 'Completed section B' },
      section_c: { field4: 'Completed section C' },
    },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  }

  await storage.set('project:demo-project-2', completedProject)

  console.log('✅ Demo data seeded successfully!')
}

export async function clearAllData() {
  await storage.clear()
  console.log('All data cleared')
}

export async function checkIfSeeded(): Promise<boolean> {
  const user = await storage.get('user:1')
  return user !== null
}
