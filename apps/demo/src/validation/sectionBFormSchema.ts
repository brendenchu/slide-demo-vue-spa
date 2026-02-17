import { z } from 'zod'

/**
 * Section B Form Validation Schema
 *
 * Math quiz with specific answers required for each question:
 * Page 1:
 *   - section_b_1: 1 + 1 = 2
 *   - section_b_2: 2 - 6 = -4
 *   - section_b_3: 3 * 3 = 9
 * Page 2:
 *   - section_b_4: 12 / 4 = 3
 *   - section_b_5: 3 ^ 3 = 27
 *   - section_b_6: 5! = 120
 * Page 3:
 *   - section_b_7: sides of heptagon = 7
 *   - section_b_8: degrees in right angle = 90
 *   - section_b_9: days in leap year = 366
 *
 * Note: Fields can be null initially, so we handle that in validation
 */

const validateNumericAnswer = (val: string | number | null | undefined, expected: number) => {
  if (val === null || val === undefined || val === '') {
    return false
  }
  const numVal = typeof val === 'string' ? parseInt(val, 10) : val
  if (isNaN(numVal)) {
    return false
  }
  return numVal === expected
}

// Page 1 schema
export const sectionBPage1Schema = z.object({
  section_b_1: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 2), {
      message: 'Sorry, that is incorrect.',
    })
  ),
  section_b_2: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, -4), {
      message: 'Sorry, that is incorrect.',
    })
  ),
  section_b_3: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 9), {
      message: 'Sorry, that is incorrect.',
    })
  ),
})

// Page 2 schema
export const sectionBPage2Schema = z.object({
  section_b_4: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 3), {
      message: 'Sorry, that is incorrect.',
    })
  ),
  section_b_5: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 27), {
      message: 'Sorry, that is incorrect.',
    })
  ),
  section_b_6: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 120), {
      message: 'Sorry, that is incorrect.',
    })
  ),
})

// Page 3 schema
export const sectionBPage3Schema = z.object({
  section_b_7: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 7), {
      message: 'Sorry, that is incorrect.',
    })
  ),
  section_b_8: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 90), {
      message: 'Sorry, that is incorrect.',
    })
  ),
  section_b_9: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.union([z.string(), z.number()]).refine((val) => validateNumericAnswer(val, 366), {
      message: 'Sorry, that is incorrect.',
    })
  ),
})

export type SectionBPage1Schema = z.infer<typeof sectionBPage1Schema>
export type SectionBPage2Schema = z.infer<typeof sectionBPage2Schema>
export type SectionBPage3Schema = z.infer<typeof sectionBPage3Schema>
