import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, deleteTrip } from '@/lib/db/queries'
import { userError } from '@/lib/errors'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]'>,
) {
  try {
    const { tripId } = await ctx.params
    const trip = await getTrip(tripId)
    if (!trip) return userError('trip_not_found', 404)

    const items = await getItineraryItems(tripId)
    return NextResponse.json({ trip, items })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取行程失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]'>,
) {
  try {
    const { tripId } = await ctx.params
    await deleteTrip(tripId)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '删除失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
