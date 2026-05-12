import type { RouteOption, TransferCommunicationScript } from "./types"

export function mockTransferRouteOptions(params: {
  origin: string
  destination: string
  travelerType: string
  tripRegion?: string
}): RouteOption[] {
  const isDomestic = params.tripRegion === "domestic"
  const hasElderly = params.travelerType === "with_parents"
  const hasKids = params.travelerType === "with_children"

  const taxiComplexity = hasElderly || hasKids ? "low" : "low"
  const transitComplexity = hasElderly || hasKids ? "high" : hasKids ? "medium" : "medium"

  const options: RouteOption[] = [
    {
      id: "taxi",
      mode: "taxi",
      title: isDomestic ? "打车 / 网约车" : "Taxi / Ride-hailing",
      provider: "mock",
      origin: params.origin,
      destination: params.destination,
      estimatedDurationMinutes: 30,
      estimatedDistanceKm: 15,
      estimatedCostText: isDomestic ? "约 ¥40-80" : "约 $15-30",
      complexity: taxiComplexity,
      recommendedFor: ["带老人", "带孩子", "行李多", "深夜抵达", "第一次出行"],
      notRecommendedFor: ["预算紧张"],
      steps: [
        { instruction: isDomestic ? "跟随到达大厅指示牌前往出租车上客区或网约车等候点" : "Follow signs to taxi stand or rideshare pickup area" },
        { instruction: isDomestic ? "排队等候或通过高德/滴滴叫车" : "Queue for taxi or use Uber/Lyft app" },
        { instruction: isDomestic ? "告知司机目的地地址或展示酒店名称" : "Tell driver destination or show hotel address" },
      ],
      pros: ["最快", "不用换乘", "适合带行李"],
      cons: ["可能排队", "高峰期费用增加"],
      warnings: isDomestic ? ["节假日打车排队可能较长"] : ["确认司机使用计价器"],
      deepLink: undefined,
      limitations: ["当前为模拟路线数据，实际耗时和费用可能不同"],
    },
    {
      id: "transit",
      mode: "public_transport",
      title: isDomestic ? "地铁 / 公交" : "Public Transit",
      provider: "mock",
      origin: params.origin,
      destination: params.destination,
      estimatedDurationMinutes: 50,
      estimatedDistanceKm: 18,
      estimatedCostText: isDomestic ? "约 ¥3-10" : "约 $2-5",
      complexity: transitComplexity,
      recommendedFor: ["白天抵达", "行李少", "熟悉当地"],
      notRecommendedFor: hasElderly ? ["带老人", "行李多", "深夜"] : hasKids ? ["行李多", "深夜"] : ["行李多"],
      steps: [
        { instruction: isDomestic ? "跟随地铁/公交指示牌前往站台" : "Follow signs to transit station" },
        { instruction: isDomestic ? "购票或扫码进站" : "Purchase ticket or use transit card" },
        { instruction: isDomestic ? "换乘后到达酒店附近站点" : "Transfer to hotel station" },
      ],
      pros: ["便宜", "避免堵车"],
      cons: ["需要换乘", "不适合大行李", "耗时久"],
      warnings: isDomestic ? ["高峰期地铁拥挤", "注意末班车时间"] : ["注意安全区域", "确认路线方向"],
      deepLink: undefined,
      limitations: ["当前为模拟路线数据"],
    },
  ]

  if (!hasElderly && !hasKids) {
    options.push({
      id: "self_drive",
      mode: "driving",
      title: isDomestic ? "自驾" : "Rental Car / Self-drive",
      provider: "mock",
      origin: params.origin,
      destination: params.destination,
      estimatedDurationMinutes: 35,
      estimatedDistanceKm: 15,
      estimatedCostText: isDomestic ? "约 ¥200-400/天" : "约 $40-80/day",
      complexity: "medium",
      recommendedFor: ["熟悉当地", "多目的地", "灵活行程"],
      notRecommendedFor: ["第一次到访", "不熟悉当地交通规则", "深夜抵达"],
      steps: [
        { instruction: isDomestic ? "到达后前往租车柜台或停车场取车" : "Go to rental car counter at arrival" },
        { instruction: "导航到酒店" },
      ],
      pros: ["灵活", "适合多目的地"],
      cons: ["停车费", "不熟悉路况可能有风险"],
      warnings: isDomestic ? ["国内导航用高德/百度地图", "注意限行规则"] : ["确认国际驾照要求", "注意靠左/靠右行驶"],
      deepLink: undefined,
      limitations: ["当前为模拟路线数据"],
    })
  }

  return options
}

export function mockTransferCommunicationScripts(params: {
  destination: string
  tripRegion?: string
}): TransferCommunicationScript[] {
  const isDomestic = params.tripRegion === "domestic"
  if (isDomestic) {
    return [
      { scenario: "打车去酒店", chinese: `请送我们去${params.destination}的酒店。`, english: `Please take us to our hotel near ${params.destination}.` },
      { scenario: "询问出租车上客区", chinese: "请问去出租车上客区怎么走？", english: "Where is the taxi stand?" },
    ]
  }
  return [
    { scenario: "Taxi to hotel", chinese: `请送我们去${params.destination}的酒店。`, english: `Could you take us to our hotel in ${params.destination}?` },
    { scenario: "Rideshare pickup", chinese: "请问网约车接客点在哪个位置？", english: "Where is the rideshare pickup area?" },
  ]
}
