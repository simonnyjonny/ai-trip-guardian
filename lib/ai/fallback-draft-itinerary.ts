import type { GeneratedItineraryDay } from './schemas'

export function generateFallbackDraftItinerary(wishInput: {
  destination: string
  durationDays?: number
  mustVisitPlaces: string[]
  pace?: string
  travelers?: string
  avoid: string[]
}): GeneratedItineraryDay[] {
  const days = wishInput.durationDays || 5
  const places = wishInput.mustVisitPlaces.length > 0 ? wishInput.mustVisitPlaces : [`${wishInput.destination} 市区`]
  const isRelaxed = wishInput.pace === 'relaxed'
  const hasElderly = wishInput.travelers?.includes('父母') || wishInput.travelers?.includes('老人')
  const hasKids = wishInput.travelers?.includes('小孩') || wishInput.travelers?.includes('孩子')
  const maxPerDay = isRelaxed ? 2 : 3

  const result: GeneratedItineraryDay[] = []

  // Day 1: Arrival
  result.push({
    dayIndex: 1,
    theme: '抵达与休息',
    userWishesSatisfied: ['轻松慢游'],
    items: [
      { timeOfDay: 'afternoon', title: `抵达${wishInput.destination}`, category: 'flight', why: '抵达日减少活动，先适应时区和气候。', estimatedIntensity: 'low' },
      { timeOfDay: 'afternoon', title: '酒店入住与休息', category: 'hotel', why: '入住后休息，避免疲劳累积。', estimatedIntensity: 'low' },
      { timeOfDay: 'evening', title: '酒店附近轻松晚餐', category: 'restaurant', why: '不安排远距离活动，避免第一天过累。', estimatedIntensity: 'low' },
    ],
    restBuffers: hasKids ? ['下午保留午休时间'] : ['下午不安排景点'],
    riskAvoidanceNotes: ['避免抵达日疲劳'],
  })

  // Middle days
  for (let d = 2; d < days; d++) {
    const dayPlaces = places.slice(((d - 2) * maxPerDay) % places.length, ((d - 2) * maxPerDay + maxPerDay) % places.length || places.length)
    const items = dayPlaces.map((p, i) => ({
      timeOfDay: i === 0 ? ('morning' as const) : ('afternoon' as const),
      title: p,
      category: 'activity' as const,
      why: `安排在 Day ${d} 减少跨区移动。`,
      estimatedIntensity: 'medium' as const,
    }))
    // Add rest
    if (isRelaxed || hasKids || hasElderly) {
      items.push({ timeOfDay: 'afternoon', title: '休息与自由时间', category: 'rest', why: '保留体力，避免连续高强度活动。', estimatedIntensity: 'low' })
    }
    result.push({
      dayIndex: d,
      theme: `${wishInput.destination} 探索`,
      userWishesSatisfied: dayPlaces,
      items,
      restBuffers: hasKids ? ['午休时间'] : [],
      riskAvoidanceNotes: wishInput.avoid.slice(0, 2),
    })
  }

  // Last day: Departure
  result.push({
    dayIndex: days,
    theme: '轻松离境',
    userWishesSatisfied: ['轻松返回'],
    items: [
      { timeOfDay: 'morning', title: '退房', category: 'hotel', why: '离境日不安排远距离活动。', estimatedIntensity: 'low' },
      { timeOfDay: 'afternoon', title: `前往机场/车站`, category: 'transport', why: '预留足够时间，不赶不急。', estimatedIntensity: 'low' },
    ],
    restBuffers: [],
    riskAvoidanceNotes: ['离境日避免远距离景点', '提前出发预留交通时间'],
  })

  return result
}
