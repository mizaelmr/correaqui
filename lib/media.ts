export const MEDIA_BUCKET = process.env.AWS_BUCKET ?? 'corre-aqui'
export const MEDIA_REGION = process.env.AWS_DEFAULT_REGION ?? 'us-east-1'
export const MEDIA_BASE_URL = `https://${MEDIA_BUCKET}.s3.${MEDIA_REGION}.amazonaws.com/`

/** Só aceita URLs de mídia enviadas pelo nosso próprio /api/upload. */
export function isOwnMediaUrl(url: unknown): url is string {
  return typeof url === 'string' && url.startsWith(MEDIA_BASE_URL) && !url.slice(MEDIA_BASE_URL.length).includes('/')
}
