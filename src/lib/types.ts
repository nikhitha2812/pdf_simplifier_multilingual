export type SimplificationLevel = 'beginner' | 'intermediate' | 'advanced'

export type LanguageCode =
  | 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'bn'

export interface Language {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'HI' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: 'TE' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'TA' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: 'KN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: 'ML' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: 'BN' },
]

export const LEVELS: { value: SimplificationLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Plain language, everyday analogies. No jargon.' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Keeps key terms with brief explanations.' },
  { value: 'advanced', label: 'Advanced', desc: 'Concise technical summary with structure preserved.' },
]

export interface HistoryRecord {
  id: string
  file_name: string
  page_count: number | null
  level: SimplificationLevel | null
  language: LanguageCode | null
  simplified_text: string | null
  translated_text: string | null
  created_at: string
}
