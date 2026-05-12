import type { ParsedItineraryItem } from "@/types/trip"

export function fallbackParse(rawInput: string): ParsedItineraryItem[] {
  const items: ParsedItineraryItem[] = []
  const lines = rawInput.split(/\n/).filter(Boolean)
  let currentDay = 1

  for (const line of lines) {
    // Detect day markers
    const dayMatch = line.match(/[Dd]ay\s*(\d+)|第\s*(\d+)\s*[天日月]/)
    if (dayMatch) {
      currentDay = parseInt(dayMatch[1] || dayMatch[2])
      continue
    }

    // Skip very short or metadata lines
    const trimmed = line.replace(/^[-\s•·]+/, "").trim()
    if (trimmed.length < 3) continue
    if (/^(目的地|日期|同行|节奏|语言|特殊需求|期望|测试|备注)/.test(trimmed)) continue

    // Category detection
    const lower = trimmed.toLowerCase()
    let category = "activity" as ParsedItineraryItem["category"]
    if (/酒店|hotel|check.in|checkin|入住|民宿|旅馆|inn|lodge/.test(lower)) category = "hotel"
    else if (/航班|flight|机场|airport|登机|boarding|起飞|arrive|抵达.*机场|LAX|NRT|HND|CDG|PEK|PVG|SHA/.test(lower)) category = "flight"
    else if (/高铁|火车|新干线|jr|rail|train|eurostar|车站|station/.test(lower)) category = "train"
    else if (/早餐|午餐|晚餐|饭店|餐厅|restaurant|居酒屋|拉面|寿司|火锅|烧烤/.test(lower)) category = "restaurant"
    else if (/休息|午休|自由|睡觉|nap|rest|缓[冲和]/.test(lower)) category = "rest"
    else if (/购物|商场|mall|买|shopping/.test(lower)) category = "shopping"
    else if (/地铁|公交|出租|打车|uber|taxi|bus|步行|走路|ride/.test(lower)) category = "transport"

    items.push({ day_index: currentDay, title: trimmed.slice(0, 120), category, notes: null })
  }

  return items
}
