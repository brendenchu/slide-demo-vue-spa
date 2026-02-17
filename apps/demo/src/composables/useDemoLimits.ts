import { useDemoStore } from '@/stores/demo'

export function useDemoLimits() {
  const demoStore = useDemoStore()

  function isProjectLimitReached(currentCount: number): boolean {
    if (!demoStore.isDemoMode) {
      return false
    }
    return currentCount >= demoStore.maxProjectsPerTeam
  }

  function isTeamLimitReached(ownedCount: number): boolean {
    if (!demoStore.isDemoMode) {
      return false
    }
    return ownedCount >= demoStore.maxTeamsPerUser
  }

  function isInvitationLimitReached(pendingCount: number): boolean {
    if (!demoStore.isDemoMode) {
      return false
    }
    return pendingCount >= demoStore.maxInvitationsPerTeam
  }

  function isUserLimitReached(userCount: number): boolean {
    if (!demoStore.isDemoMode) {
      return false
    }
    return userCount >= demoStore.maxUsers
  }

  function limitLabel(current: number, max: number): string | null {
    if (!demoStore.isDemoMode) {
      return null
    }
    return `${current} / ${max}`
  }

  return {
    isProjectLimitReached,
    isTeamLimitReached,
    isInvitationLimitReached,
    isUserLimitReached,
    limitLabel,
  }
}
