import type { RouteOption, TransferCommunicationScript } from "./types"
import { getPickupHints, getDefaultPickupHints } from "./pickup-hints"
import { generateRideHailingLinks, generateGoogleMapsLink, generateAmapLink } from "./links"

export function mockTransferRouteOptions(params: {
  origin: string
  destination: string
  travelerType: string
  tripRegion?: string
}): RouteOption[] {
  const isDomestic = params.tripRegion === "domestic"
  const hasElderly = params.travelerType === "with_parents"
  const hasKids = params.travelerType === "with_children"
  const forSensitive = hasElderly || hasKids
  const hints = getPickupHints(params.origin) || getDefaultPickupHints(isDomestic)

  const taxiRecFor = forSensitive
    ? ["带老人", "带孩子", "行李多", "深夜抵达", "语言弱"]
    : ["行李多", "深夜抵达", "第一次出行"]

  const transitNotFor = forSensitive
    ? ["带老人（换乘不便）", "行李多", "深夜", "语言弱"]
    : ["行李多", "深夜"]

  const links = generateRideHailingLinks({ origin: params.origin, destination: params.destination, isDomestic })

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
      estimatedCostText: isDomestic ? "约 ¥40-120" : "约 $15-40",
      pickupPointHint: isDomestic ? hints.taxi : hints.rideHailing,
      complexity: "low",
      recommendedFor: taxiRecFor,
      notRecommendedFor: ["预算紧张"],
      steps: [
        { order: 1, mode: "walk", instruction: isDomestic ? "出站后，跟随出租车/网约车指示牌前往上客区" : "Follow signs to Taxi Stand or Ride App Pickup area" },
        { order: 2, mode: "wait", instruction: isDomestic ? "排队等候或在打车 App（高德/滴滴）输入目的地" : "Queue for taxi or open Uber/Lyft, set destination" },
        { order: 3, mode: "taxi", instruction: isDomestic ? "上车后告知司机目的地或展示酒店名称/地址" : "Tell driver destination; confirm meter/price before departure" },
        { order: 4, mode: "taxi", instruction: isDomestic ? "抵达后核对地址，付款下车" : "Arrive at hotel, verify address, pay and exit" },
      ],
      pros: ["最快直达", "不用换乘", "适合带行李", forSensitive ? "对老人/孩子友好" : ""].filter(Boolean),
      cons: isDomestic ? ["高峰期可能拥堵", "节假日排队较长"] : ["高峰期可能加价", "可能存在语言沟通障碍"],
      warnings: isDomestic ? ["不要乘坐出站口非官方揽客车辆", "上车前确认司机信息"] : ["确认司机使用计价器或 App 计价", "核对车牌号"],
      deepLink: undefined,
      rideHailingLinks: links,
      dataQuality: "mock",
      limitations: ["当前为模拟路线，实际耗时和费用请以地图 App 实时导航为准"],
    },
    {
      id: "transit",
      mode: "public_transport",
      title: isDomestic ? "公共交通" : "Public Transit",
      provider: "mock",
      origin: params.origin,
      destination: params.destination,
      estimatedDurationMinutes: 50,
      estimatedDistanceKm: 20,
      estimatedCostText: isDomestic ? "约 ¥3-10" : "约 $2-5",
      pickupPointHint: hints.transit,
      complexity: forSensitive ? "high" : "medium",
      recommendedFor: forSensitive ? ["白天抵达"] : ["白天抵达", "行李少", "熟悉当地", "预算敏感"],
      notRecommendedFor: transitNotFor,
      steps: isDomestic
        ? [
            { order: 1, mode: "walk", instruction: "跟随地铁/公交指示牌前往站台", notes: ["可打开高德地图/百度地图查询实时路线"] },
            { order: 2, mode: "subway", instruction: "购票或扫码（支付宝/微信/交通卡）进站", lineName: "查看地图确认线路" },
            { order: 3, mode: "transfer", instruction: "如需要换乘，请跟随站内换乘指示", notes: ["注意末班车时间"] },
            { order: 4, mode: "walk", instruction: "到达酒店附近站后步行即到", notes: ["如站点距离酒店较远可再打车"] },
          ]
        : [
            { order: 1, mode: "walk", instruction: "Follow signs to Transit / Train / Metro station", notes: ["Use Google Maps for real-time directions"] },
            { order: 2, mode: "train", instruction: "Purchase ticket from machine or counter; validate before boarding" },
            { order: 3, mode: "transfer", instruction: "Transfer if needed; follow station signs", notes: ["Check last departure time"] },
            { order: 4, mode: "walk", instruction: "Walk from final station to hotel", notes: ["Short taxi from station if far"] },
          ],
      pros: ["便宜", "避免堵车风险"],
      cons: isDomestic ? ["可能拥挤", "换乘不便", "不适合大行李"] : ["可能需要多次换乘", "语言标识不熟悉"],
      warnings: isDomestic ? ["高峰时段地铁拥挤", "注意末班车时间", "带老人/孩子慎选"] : ["注意个人财物", "确认线路方向"],
      deepLink: isDomestic ? generateAmapLink(params.origin, params.destination) : generateGoogleMapsLink(params.origin, params.destination, "transit"),
      dataQuality: "mock",
      limitations: ["当前为模拟路线，请以地图 App 实时导航为准"],
    },
  ]

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
      { scenario: "询问上车点", chinese: "请问去出租车上客区/网约车上车点怎么走？" },
      { scenario: "行李协助", chinese: "我们有两个大行李箱，请问后备箱可以放下吗？" },
      { scenario: "确认地址", chinese: "请帮我确认这是正确的酒店地址。" },
    ]
  }
  return [
    { scenario: "Taxi to hotel", chinese: `请送我们去${params.destination}的酒店。`, english: `Could you take us to our hotel in ${params.destination}?` },
    { scenario: "Rideshare pickup", chinese: "请问网约车/出租车接客点在哪个位置？", english: "Where is the rideshare/taxi pickup area?" },
    { scenario: "Luggage help", chinese: "我们有行李，能帮忙开一下后备箱吗？", english: "We have luggage. Could you help us with the trunk?" },
    { scenario: "Confirm address", chinese: "请帮我确认这是正确的酒店地址。", english: "Could you please confirm this is the correct hotel address?" },
  ]
}
