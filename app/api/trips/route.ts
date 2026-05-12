import { NextRequest, NextResponse } from 'next/server'
import { createTrip } from '@/lib/db/queries'
import { createTripInputSchema } from '@/lib/ai/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = createTripInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: '输入数据格式错误', details: validation.error.issues },
        { status: 400 },
      )
    }

    const input = validation.data
    const trip = await createTrip({
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      travelerType: input.travelerType,
      pace: input.pace,
      languageLevel: input.languageLevel,
      specialNeeds: input.specialNeeds,
      rawInput: input.rawInput,
    })

    return NextResponse.json({ trip }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '创建行程失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
