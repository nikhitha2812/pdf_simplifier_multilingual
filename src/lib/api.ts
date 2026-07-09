import { SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from './supabase'
import type { SimplificationLevel, LanguageCode, HistoryRecord } from './types'

const headers = () => ({
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
})

async function callFunction<T>(slug: string, body: unknown): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${slug}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const j = await res.json()
      if (j?.error) detail = j.error
    } catch { /* keep default */ }
    throw new Error(detail)
  }
  const data = await res.json()
  if (!data || (data.error && data.text === undefined)) {
    throw new Error(data?.error || 'Unexpected response from server')
  }
  return data as T
}

export const api = {
  simplify: (text: string, level: SimplificationLevel) =>
    callFunction<{ text: string }>('simplify-pdf', {
      text: text.slice(0, 18000),
      level,
    }).then((d) => d.text),

  translate: (text: string, level: SimplificationLevel, target: LanguageCode) =>
    callFunction<{ text: string }>('translate-pdf', {
      text: text.slice(0, 18000),
      target,
      source: 'en',
    }).then((d) => d.text),

  tts: (text: string, lang: LanguageCode) =>
    callFunction<{ audio: string; format: string }>('tts-pdf', {
      text: text.slice(0, 1800),
      lang,
    }).then((d) => d.audio),
}

export async function saveHistory(input: {
  file_name: string
  page_count: number
  level: SimplificationLevel
  language: LanguageCode
  simplified_text: string
  translated_text: string
}): Promise<HistoryRecord | null> {
  const { data, error } = await supabase
    .from('pdf_history')
    .insert(input)
    .select()
    .maybeSingle()
  if (error) {
    console.warn('Failed to save history:', error.message)
    return null
  }
  return data as HistoryRecord
}

export async function listHistory(search = ''): Promise<HistoryRecord[]> {
  let q = supabase
    .from('pdf_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (search.trim()) {
    q = q.ilike('file_name', `%${search.trim()}%`)
  }
  const { data, error } = await q
  if (error) {
    console.warn('Failed to load history:', error.message)
    return []
  }
  return (data || []) as HistoryRecord[]
}

export async function deleteHistory(id: string): Promise<void> {
  await supabase.from('pdf_history').delete().eq('id', id)
}
