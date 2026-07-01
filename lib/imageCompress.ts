const MAX_DIMENSION = 800
const WEBP_QUALITY = 0.8

export async function compressImage(file: File): Promise<Blob> {
  const img = new Image()
  const objectUrl = URL.createObjectURL(file)

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Falha ao carregar imagem'))
    img.src = objectUrl
  })

  URL.revokeObjectURL(objectUrl)

  let { naturalWidth: w, naturalHeight: h } = img
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    if (w >= h) {
      h = Math.round((h * MAX_DIMENSION) / w)
      w = MAX_DIMENSION
    } else {
      w = Math.round((w * MAX_DIMENSION) / h)
      h = MAX_DIMENSION
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao comprimir imagem'))),
      'image/webp',
      WEBP_QUALITY
    )
  })
}
