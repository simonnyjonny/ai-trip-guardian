import type { GeneratedItineraryDay } from '@/lib/ai/schemas'

const timeMap: Record<string, string | null> = {
  morning: '09:00', late_morning: '10:30', afternoon: '14:00', evening: '18:30', flexible: null,
}

export function convertGeneratedItineraryToItems(generated: GeneratedItineraryDay[]): Array<{
  day_index: number; start_time: string | null; end_time: string | null
  title: string; location_name: string | null; address: string | null; category: string; notes: string | null
}> {
  const result: Array<{
    day_index: number; start_time: string | null; end_time: string | null
    title: string; location_name: string | null; address: string | null; category: string; notes: string | null
  }> = []

  for (const day of generated) {
    for (const item of day.items) {
      result.push({
        day_index: day.dayIndex,
        start_time: item.timeOfDay ? (timeMap[item.timeOfDay] ?? null) : null,
        end_time: null,
        title: item.title,
        location_name: item.locationName || null,
        address: null,
        category: item.category || 'activity',
        notes: [item.why, ...(item.notes || [])].filter(Boolean).join('；') || null,
      })
    }
  }

  return result
}
