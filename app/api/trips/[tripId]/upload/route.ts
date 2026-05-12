import { NextRequest, NextResponse } from 'next/server'
import { createDocument } from '@/lib/db/queries'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/trips/[tripId]/upload'>,
) {
  try {
    const { tripId } = await ctx.params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `文件大小不能超过${parseInt(process.env.MAX_FILE_SIZE_MB || '10')}MB` },
        { status: 400 },
      )
    }

    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，请上传 PDF、文本文件或图片' },
        { status: 400 },
      )
    }

    // MVP: Store file info, skip actual cloud storage upload
    const doc = await createDocument({
      trip_id: tripId,
      file_url: `local://${file.name}`,
      file_type: file.type,
    })

    return NextResponse.json({ document: doc }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '文件上传失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
