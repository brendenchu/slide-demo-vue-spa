# Migration Checklist

Use this checklist to track progress during the migration from Laravel + Inertia to Vue SPA.

## Phase 1: Project Setup ✅

- [x] Create vue-spa directory
- [x] Initialize package.json
- [x] Create basic project structure
- [x] Create configuration files
- [ ] Install core dependencies (vue, vue-router, pinia)
- [ ] Install dev dependencies (vite, typescript, tailwind)
- [ ] Configure Vite
- [ ] Configure TypeScript
- [ ] Configure Tailwind CSS
- [ ] Test dev server runs

## Phase 2: Component Migration

### Pure Components (Copy As-Is)
- [ ] Copy Slide system components
  - [ ] SlideProvider.vue
  - [ ] SlideFrame.vue
  - [ ] SlideContent.vue
  - [ ] SlideControls.vue
  - [ ] NavigationButton.vue
  - [ ] ActionButton.vue
  - [ ] types.d.ts
- [ ] Copy Form components
  - [ ] FormField.vue
  - [ ] FormCheckbox.vue
  - [ ] FormRadio.vue
  - [ ] FormLabel.vue
  - [ ] FormError.vue
  - [ ] FormFieldset.vue
  - [ ] FormGroupWrapper.vue
  - [ ] FormTextarea.vue
- [ ] Copy Common UI components
  - [ ] PrimaryButton.vue
  - [ ] SecondaryButton.vue
  - [ ] DangerButton.vue
  - [ ] ApplicationLogo.vue
  - [ ] ModalComponent.vue
- [ ] Copy utility functions
  - [ ] utils/math.ts
  - [ ] utils/format.ts
  - [ ] utils/ui.ts

### Components Requiring Refactoring
- [ ] Refactor Slide system (replace Head component)
  - [ ] SlideProvider.vue
  - [ ] SlideContent.vue
- [ ] Refactor Navigation components
  - [ ] NavLink.vue (Link → RouterLink)
  - [ ] DropdownLink.vue (Link → RouterLink)
  - [ ] ResponsiveNavLink.vue (Link → RouterLink)
  - [ ] DropdownMenu.vue (usePage → Pinia)
- [ ] Refactor Story Form components
  - [ ] IntroForm.vue
  - [ ] SectionAForm.vue
  - [ ] SectionBForm.vue
  - [ ] SectionCForm.vue
- [ ] Refactor Progress components
  - [ ] ProgressBar.vue
  - [ ] ProgressTimeline.vue (Link → RouterLink)
  - [ ] DashboardButton.vue (Link → RouterLink)
  - [ ] LogoutButton.vue (Link → action)
- [ ] Refactor Flash system
  - [ ] FlashProvider.vue (usePage → Pinia)
  - [ ] FlashModal.vue
- [ ] Refactor Layouts
  - [ ] StoryLayout.vue (usePage → Pinia)
  - [ ] AuthenticatedLayout.vue (usePage → Pinia)
  - [ ] GuestLayout.vue (usePage → Pinia)

### Pages Requiring Rewrite
- [ ] Auth pages
  - [ ] LoginUser.vue
  - [ ] RegisterUser.vue
  - [ ] ForgotPassword.vue
  - [ ] ResetPassword.vue
  - [ ] ConfirmPassword.vue
  - [ ] VerifyEmail.vue
- [ ] Account pages
  - [ ] ClientDashboard.vue
  - [ ] AcceptTerms.vue
  - [ ] EditProfile.vue
  - [ ] UpdateProfileInformationForm.vue
  - [ ] UpdatePasswordForm.vue
  - [ ] DeleteUserForm.vue
  - [ ] SelectTeam.vue
- [ ] Story pages
  - [ ] StoryForm.vue
  - [ ] NewStory.vue
  - [ ] ContinueStory.vue
  - [ ] CompleteStory.vue
- [ ] Admin pages
  - [ ] AdminDashboard.vue
  - [ ] BrowseUsers.vue
  - [ ] CreateUser.vue
  - [ ] ShowUser.vue

## Phase 3: State Management

### Pinia Stores
- [x] Create auth store skeleton
- [ ] Implement full auth store
  - [ ] login()
  - [ ] logout()
  - [ ] loadUser()
  - [ ] updateProfile()
  - [ ] can() (permissions)
- [ ] Create flash store
  - [ ] add()
  - [ ] remove()
  - [ ] success()
  - [ ] error()
  - [ ] warning()
  - [ ] info()
- [ ] Create projects store
  - [ ] fetchAll()
  - [ ] fetchById()
  - [ ] create()
  - [ ] update()
  - [ ] saveResponses()
  - [ ] complete()
  - [ ] deleteProject()
- [ ] Create teams store
- [ ] Create admin store

### Storage Layer
- [ ] Create storage interface (storage.ts)
- [ ] Implement LocalStorage adapter
- [ ] Implement IndexedDB adapter
- [ ] Create hybrid storage
- [ ] Create seed data script
- [ ] Implement data export
- [ ] Implement data import

## Phase 4: Routing & Navigation

- [x] Create router skeleton
- [ ] Define all routes
  - [ ] Auth routes
  - [ ] Account routes
  - [ ] Story routes
  - [ ] Admin routes
  - [ ] Error routes
- [ ] Implement navigation guards
  - [ ] Auth check guard
  - [ ] Guest-only guard
  - [ ] Permission check guard
  - [ ] Title update guard
- [ ] Create route helper (Ziggy replacement)
- [ ] Test all navigation flows

## Phase 5: Composables

- [ ] Create useForm composable
  - [ ] Form state management
  - [ ] Error handling
  - [ ] Processing state
  - [ ] Submit method
  - [ ] Reset method
  - [ ] Clear errors method
- [ ] Create useStoryForm composable
  - [ ] Story-specific form logic
  - [ ] saveForm()
  - [ ] nullifyFields()
- [ ] Create useAuth composable
  - [ ] Auth helpers
- [ ] Create usePagination composable
  - [ ] Client-side pagination

## Phase 6: Testing

### Unit Tests
- [ ] Configure Vitest
- [ ] Write useForm tests
- [ ] Write useStoryForm tests
- [ ] Write component tests
  - [ ] FormField.vue
  - [ ] FormCheckbox.vue
  - [ ] SlideProvider.vue
- [ ] Write store tests
  - [ ] auth store
  - [ ] projects store
  - [ ] flash store

### E2E Tests
- [ ] Configure Playwright
- [ ] Write auth flow tests
  - [ ] Login
  - [ ] Register
  - [ ] Logout
- [ ] Write story form tests
  - [ ] Create new story
  - [ ] Fill multi-step form
  - [ ] Save & continue
  - [ ] Complete story
- [ ] Write dashboard tests
  - [ ] View projects
  - [ ] Navigate to forms
- [ ] Write admin tests (if applicable)

## Phase 7: Styling & Polish

- [ ] Copy CSS from Laravel project
- [ ] Verify Tailwind classes work
- [ ] Test responsive design
- [ ] Verify DaisyUI components
- [ ] Test dark mode (if applicable)
- [ ] Check transitions/animations
- [ ] Verify flash messages display
- [ ] Check loading states

## Phase 8: Data Persistence

- [ ] Test LocalStorage persistence
- [ ] Test IndexedDB persistence
- [ ] Test data restoration on refresh
- [ ] Test form state restoration
- [ ] Test multi-tab behavior
- [ ] Test storage limits
- [ ] Test data export
- [ ] Test data import

## Phase 9: Quality Assurance

### Manual Testing
- [ ] Login/logout flow
- [ ] Registration flow
- [ ] Create new story
- [ ] Fill multi-step form (all sections)
- [ ] Save & continue functionality
- [ ] Complete story
- [ ] View dashboard
- [ ] Edit profile
- [ ] Update password
- [ ] Delete account
- [ ] Admin user management (if applicable)

### Cross-browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari 14+
- [ ] Edge (latest)

### Performance
- [ ] Check bundle size
- [ ] Test initial load time
- [ ] Test navigation speed
- [ ] Test form submission speed
- [ ] Profile with Vue DevTools

## Phase 10: Code Cleanup

- [ ] Remove all Inertia imports
- [ ] Remove all Laravel route helpers
- [ ] Update all TypeScript types
- [ ] Remove unused dependencies
- [ ] Configure ESLint
- [ ] Configure Prettier
- [ ] Format all code
- [ ] Fix all linting errors
- [ ] Fix all TypeScript errors
- [ ] Remove console.log statements
- [ ] Add JSDoc comments where needed

## Phase 11: Documentation

- [x] Create README.md
- [x] Create SETUP.md
- [x] Create MIGRATION_PLAN.md
- [x] Create MIGRATION_CHECKLIST.md
- [ ] Add inline code comments
- [ ] Document composables
- [ ] Document stores
- [ ] Document storage layer
- [ ] Create CONTRIBUTING.md (optional)

## Phase 12: Final Steps

- [ ] Run full test suite
- [ ] Build production bundle
- [ ] Test production build
- [ ] Deploy to demo hosting (optional)
- [ ] Create GitHub repository (optional)
- [ ] Tag v1.0.0 release

---

## Notes

- Use this checklist to track progress
- Check items off as you complete them
- Add notes below for any issues encountered
- Reference MIGRATION_PLAN.md for detailed implementation guidance

## Issues Encountered

(Add notes here as you encounter issues during migration)

## Additional Tasks

(Add any additional tasks discovered during migration)
