import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_BUCKET ?? 'corre-aqui'
const MAX_DIMENSION = 800
const WEBP_QUALITY = 80

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov']

export async function POST(req: NextRequest) {
  try {
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

    if (isImage) {
      const maxSize = 20 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'Imagem muito grande (máx. 20MB)' }, { status: 400 })
      }

      const sharp = (await import('sharp')).default
      const bytes = await file.arrayBuffer()
      const webpBuffer = await sharp(Buffer.from(bytes))
        .rotate()
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()

      const filename = `${randomUUID()}.webp`
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: filename,
        Body: webpBuffer,
        ContentType: 'image/webp',
      }))

      const region = process.env.AWS_DEFAULT_REGION ?? 'us-east-1'
      const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${filename}`
      return NextResponse.json({ url, type: 'image' }, { status: 201 })
    }

    // vídeo — upload direto sem processamento
    const maxVideoSize = 100 * 1024 * 1024
    if (file.size > maxVideoSize) {
      return NextResponse.json({ error: 'Vídeo muito grande (máx. 100MB)' }, { status: 400 })
    }

    const ext = file.type === 'video/webm' ? '.webm' : file.type === 'video/quicktime' ? '.mov' : '.mp4'
    const filename = `${randomUUID()}${ext}`
    const bytes = await file.arrayBuffer()

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: filename,
      Body: Buffer.from(bytes),
      ContentType: file.type,
    }))

    const region = process.env.AWS_DEFAULT_REGION ?? 'us-east-1'
    const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${filename}`
    return NextResponse.json({ url, type: 'video' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
