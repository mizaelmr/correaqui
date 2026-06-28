import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { extname } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx. 10MB)' }, { status: 400 })
    }

    const ext = extname(file.name) || '.jpg'
    const filename = `${randomUUID()}${ext}`
    const bytes = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from('uploads')
      .upload(filename, bytes, { contentType: file.type })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
    }

    const { data } = supabase.storage.from('uploads').getPublicUrl(filename)

    return NextResponse.json({ url: data.publicUrl }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
