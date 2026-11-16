import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { auth } from '@/auth'
import { MEDIA_BASE_URL, MEDIA_BUCKET, MEDIA_REGION } from '@/lib/media'
import { checkRateLimit, getClientIp, hashIp } from '@/lib/rateLimit'

const s3 = new S3Client({
  region: MEDIA_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Uploads por hora: anônimos por IP, logados por usuário
const ANON_UPLOADS_PER_HOUR = 30
const USER_UPLOADS_PER_HOUR = 60

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov']

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const allowed = session?.user?.id
      ? await checkRateLimit(`up:u:${session.user.id}`, USER_UPLOADS_PER_HOUR, 60 * 60 * 1000)
      : await checkRateLimit(`up:ip:${hashIp(getClientIp(req))}`, ANON_UPLOADS_PER_HOUR, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Muitos envios em pouco tempo. Tente novamente mais tarde.' }, { status: 429 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
    }

    const maxSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: isVideo ? 'Vídeo muito grande (máx. 100MB)' : 'Imagem muito grande (máx. 20MB)' },
        { status: 400 }
      )
    }

    const ext = isImage ? '.webp' : file.type === 'video/webm' ? '.webm' : file.type === 'video/quicktime' ? '.mov' : '.mp4'
    const filename = `${randomUUID()}${ext}`
    const bytes = await file.arrayBuffer()

    await s3.send(new PutObjectCommand({
      Bucket: MEDIA_BUCKET,
      Key: filename,
      Body: Buffer.from(bytes),
      ContentType: file.type,
    }))

    const url = `${MEDIA_BASE_URL}${filename}`
    return NextResponse.json({ url, type: isImage ? 'image' : 'video' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
