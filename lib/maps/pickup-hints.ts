const AIRPORT_HINTS: Record<string, { rideHailing: string; taxi: string; transit: string }> = {
  LAX: {
    rideHailing: "到达后跟随 Ground Transportation / Ride App Pickup 指示牌前往 LAX-it 区域。打开 Uber/Lyft App 叫车，输入酒店地址即可。",
    taxi: "跟随 Taxi 指示牌到官方出租车上客区排队。不要接受航站楼出口非官方揽客。大约 $15-40 到 Santa Monica。",
    transit: "LAX 公共交通需先乘坐免费 FlyAway 或接驳巴士到 Metro 站，再换乘地铁/公交。行李多时不太方便。",
  },
  HND: {
    rideHailing: "羽田机场建议先前往出租车上客区。带孩子或行李多时优先打车或机场巴士。",
    taxi: "跟随 Taxi 指示牌到官方出租车上车点。到新宿约 ¥6000-9000。",
    transit: "羽田可乘坐东京单轨电车/京急线到市区，在滨松町/品川换乘 JR 或其他线路。行李多时不建议换乘。",
  },
  NRT: {
    rideHailing: "成田机场到市区较远，NEX 成田特快或机场巴士通常更方便。打车费用较高（¥15000-25000）。",
    taxi: "成田出租车较贵，建议优先选择 NEX 或机场巴士。如需打车请到官方 Taxi Stand。",
    transit: "NEX 成田特快可直达新宿/东京/品川。京成本线较便宜但较慢。",
  },
  PEK: {
    rideHailing: "首都机场请到网约车上车区叫车。T2/T3 航站楼的网约车上车点不同，请按指示牌前往。",
    taxi: "跟随出租车指示牌到官方排队区，不要乘坐航站楼出口揽客车辆。到市区约 ¥100-200。",
    transit: "首都机场线可到东直门/三元桥换乘地铁。行李多或带老人时建议打车。",
  },
  PKX: {
    rideHailing: "大兴机场网约车上车区按航站楼指示前往。大兴机场离市区较首都机场远。",
    taxi: "前往官方出租车排队区。到市区约 ¥150-250，耗时较长。",
    transit: "大兴机场线可到草桥站换乘地铁。大兴机场离市区较远，请预留出行时间。",
  },
  CDG: {
    rideHailing: "戴高乐机场出关后跟随 Taxi / Ride 指示牌。Uber 在 CDG 通常有指定接客点，请查看 App 确认。",
    taxi: "跟随 Taxi 指示牌到官方出租车上车点。到巴黎市区约 €50-70。",
    transit: "CDG 可乘坐 RER B 到市区，在 Châtelet 等站换乘 Metro。注意看管行李。",
  },
  PVG: {
    rideHailing: "浦东机场请到指定网约车上车区。T1/T2 网约车点不同。",
    taxi: "跟随出租车指示牌到官方排队区。到市区约 ¥150-250。",
    transit: "浦东机场可乘坐磁悬浮/地铁 2 号线到市区。磁悬浮更快但只到龙阳路。",
  },
  SHA: {
    rideHailing: "虹桥机场/火车站一体化区域，请确认是 T1/T2 还是虹桥火车站。",
    taxi: "跟随出租车指示牌。虹桥到市区较浦东近，约 ¥40-80。",
    transit: "虹桥可乘坐地铁 2/10 号线直接进市区，非常方便。",
  },
  KIX: {
    rideHailing: "关西机场可乘坐南海电铁到难波，或 JR 关空快速到大阪站。打车费用较高（¥15000+）。",
    taxi: "关西机场出租车较贵。建议优先选择南海电铁或机场巴士。",
    transit: "南海电铁到难波约 40 分钟，JR 到大阪站约 65 分钟。南海电铁更快更便宜。",
  },
  ICN: {
    rideHailing: "仁川机场到首尔市区约 50-70 分钟。机场巴士通常比打车更实惠。",
    taxi: "跟随 Taxi 指示牌。到市区约 ₩60000-90000。",
    transit: "AREX 机场快线可直达首尔站。普通列车较便宜，直达列车更快。",
  },
}

const STATION_HINTS: Record<string, { rideHailing: string; taxi: string; transit: string }> = {
  北京南站: {
    rideHailing: "北京南站出站后请按网约车标识前往 B2/B3 停车场上车区。请不要接受出站口陌生人揽客。",
    taxi: "北京南站有出租车排队区，跟随 Taxi 指示牌。高峰时段排队可能较长。",
    transit: "北京南站可乘坐地铁 4/14 号线进市区。到王府井可坐 4 号线换乘其他线路。",
  },
  上海虹桥站: {
    rideHailing: "虹桥站出站后请按网约车标识到 P9/P10 停车场。",
    taxi: "虹桥站有出租车排队区，跟随 Taxi 指示牌。",
    transit: "虹桥站连接地铁 2/10/17 号线，可直达市区。",
  },
  "Tokyo Station": {
    rideHailing: "东京站出站后可到出租车乘车处。东京站较大，请确认出口（丸之内/八重洲）。",
    taxi: "东京站有多个出租车乘车处。新宿方向从丸之内出口上车较方便。",
    transit: "东京站可换乘 JR 山手线/中央线/总武线等，新宿方向乘坐中央线快速最方便。",
  },
  "Gare du Nord": {
    rideHailing: "巴黎北站出站后到指定出租车乘车处。注意看管行李和随身物品。",
    taxi: "巴黎北站外有出租车排队区。高峰时段可能需要排队。",
    transit: "巴黎北站可换乘 Metro 4/5 号线或 RER B/D 线。",
  },
}

export function getPickupHints(place: string): { rideHailing: string; taxi: string; transit: string } | null {
  // Exact match
  for (const [key, hints] of Object.entries(AIRPORT_HINTS)) {
    if (place.toUpperCase().includes(key.toUpperCase())) return hints
  }
  for (const [key, hints] of Object.entries(STATION_HINTS)) {
    if (place.includes(key)) return hints
  }
  return null
}

export function getDefaultPickupHints(isDomestic: boolean): { rideHailing: string; taxi: string; transit: string } {
  if (isDomestic) {
    return {
      rideHailing: "请根据机场/车站内网约车上车区指示牌前往。可通过高德地图/滴滴叫车。",
      taxi: "请跟随出租车指示牌到官方出租车上车点，不要乘坐非官方揽客车辆。",
      transit: "请跟随地铁/公交指示牌前往站台。可通过高德地图/百度地图查询实时路线。",
    }
  }
  return {
    rideHailing: "请跟随机场内 Ride App Pickup / Ground Transportation 指示牌。可通过 Uber/Lyft 叫车。",
    taxi: "请跟随 Taxi Stand 指示牌到官方出租车上车点，不要接受非官方揽客。",
    transit: "请跟随 Train / Metro / Transit 指示牌前往站台。可通过 Google Maps 查询实时路线。",
  }
}
