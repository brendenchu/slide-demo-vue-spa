import { z } from 'zod'

/**
 * Section A Form Validation Schema
 *
 * Page 1: Checkboxes (optional booleans)
 * Page 2: Conditional fields based on checkboxes
 *   - If checkbox 1 is checked, field 4 must be current year
 *   - If checkbox 2 is checked, field 5 must be current month
 *   - If checkbox 3 is checked, field 6 must be current day
 */

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1 // 1-12
const currentDay = new Date().getDate()

// Page 1 schema - checkboxes only (A4, A5, A6 not on this page)
export const sectionAPage1Schema = z.object({
  section_a_1: z.boolean().nullable().optional(),
  section_a_2: z.boolean().nullable().optional(),
  section_a_3: z.boolean().nullable().optional(),
  // A4, A5, A6 fields need to exist in the object but not be validated on page 1
  section_a_4: z.any().optional(),
  section_a_5: z.any().optional(),
  section_a_6: z.any().optional(),
})

// Page 2 schema - conditional date fields
// Use superRefine to validate based on checkbox state
export const sectionAPage2Schema = z
  .object({
    section_a_1: z.boolean().nullable().optional(),
    section_a_2: z.boolean().nullable().optional(),
    section_a_3: z.boolean().nullable().optional(),
    section_a_4: z.union([z.string(), z.number(), z.null()]).optional(),
    section_a_5: z.union([z.string(), z.number(), z.null()]).optional(),
    section_a_6: z.union([z.string(), z.number(), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate section_a_4 if checkbox 1 is checked
    if (data.section_a_1 === true) {
      const val = data.section_a_4
      if (val === null || val === undefined || val === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['section_a_4'],
          message: 'This field is required.',
        })
      } else {
        const numVal = typeof val === 'string' ? parseInt(val, 10) : val
        if (numVal !== currentYear) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['section_a_4'],
            message: 'This field must be the current year.',
          })
        }
      }
    }

    // Validate section_a_5 if checkbox 2 is checked
    if (data.section_a_2 === true) {
      const val = data.section_a_5
      if (val === null || val === undefined || val === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['section_a_5'],
          message: 'This field is required.',
        })
      } else {
        const numVal = typeof val === 'string' ? parseInt(val, 10) : val
        if (numVal !== currentMonth) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['section_a_5'],
            message: 'This field must be the current month.',
          })
        }
      }
    }

    // Validate section_a_6 if checkbox 3 is checked
    if (data.section_a_3 === true) {
      const val = data.section_a_6
      if (val === null || val === undefined || val === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['section_a_6'],
          message: 'This field is required.',
        })
      } else {
        const numVal = typeof val === 'string' ? parseInt(val, 10) : val
        if (numVal !== currentDay) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['section_a_6'],
            message: 'This field must be the current day.',
          })
        }
      }
    }
  })

export type SectionAPage1Schema = z.infer<typeof sectionAPage1Schema>
export type SectionAPage2Schema = z.infer<typeof sectionAPage2Schema>
