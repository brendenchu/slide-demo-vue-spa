import { z } from 'zod'

/**
 * Section C Form Validation Schema
 *
 * Capital city quiz - each page has one question with a specific correct answer:
 * Page 1: France = Paris
 * Page 2: Japan = Tokyo
 * Page 3: Australia = Canberra
 * Page 4: Canada = Ottawa
 * Page 5: India = New Delhi
 * Page 6: Brazil = Brasilia
 * Page 7: Denmark = Copenhagen
 * Page 8: Kenya = Nairobi
 * Page 9: South Africa = Johannesburg
 *
 * Note: Fields can be null initially, so we preprocess to convert null to empty string
 */

// Page 1 schema
export const sectionCPage1Schema = z.object({
  section_c_1: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Paris', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 2 schema
export const sectionCPage2Schema = z.object({
  section_c_2: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Tokyo', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 3 schema
export const sectionCPage3Schema = z.object({
  section_c_3: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Canberra', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 4 schema
export const sectionCPage4Schema = z.object({
  section_c_4: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Ottawa', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 5 schema
export const sectionCPage5Schema = z.object({
  section_c_5: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'New Delhi', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 6 schema
export const sectionCPage6Schema = z.object({
  section_c_6: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Brasilia', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 7 schema
export const sectionCPage7Schema = z.object({
  section_c_7: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Copenhagen', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 8 schema
export const sectionCPage8Schema = z.object({
  section_c_8: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Kinshasa', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

// Page 9 schema
export const sectionCPage9Schema = z.object({
  section_c_9: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, 'This field is required.')
      .refine((val) => val === 'Johannesburg', {
        message: 'Sorry, that is incorrect.',
      })
  ),
})

export type SectionCPage1Schema = z.infer<typeof sectionCPage1Schema>
export type SectionCPage2Schema = z.infer<typeof sectionCPage2Schema>
export type SectionCPage3Schema = z.infer<typeof sectionCPage3Schema>
export type SectionCPage4Schema = z.infer<typeof sectionCPage4Schema>
export type SectionCPage5Schema = z.infer<typeof sectionCPage5Schema>
export type SectionCPage6Schema = z.infer<typeof sectionCPage6Schema>
export type SectionCPage7Schema = z.infer<typeof sectionCPage7Schema>
export type SectionCPage8Schema = z.infer<typeof sectionCPage8Schema>
export type SectionCPage9Schema = z.infer<typeof sectionCPage9Schema>
