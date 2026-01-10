import { z } from 'zod'

/**
 * Intro Form Validation Schema
 *
 * Page 1: All 3 fields are required strings with max 255 chars
 * Note: Fields can be null initially, so we preprocess to convert null to empty string
 */
export const introFormSchema = z.object({
  intro_1: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .max(255, 'This field must not exceed 255 characters.')
  ),
  intro_2: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .max(255, 'This field must not exceed 255 characters.')
  ),
  intro_3: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .max(255, 'This field must not exceed 255 characters.')
  ),
})

export type IntroFormSchema = z.infer<typeof introFormSchema>
