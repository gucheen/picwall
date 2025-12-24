const KEY = process.env.IMGPROXY_KEY || ''
const SALT = process.env.IMGPROXY_SALT || ''

const sign = (salt: string, target: string, secret: string): string => {
  const hasher = new Bun.CryptoHasher('sha256', secret)
  hasher.update(salt)
  hasher.update(target)

  return hasher.digest('base64url')
}

export function getSignature(path: string): string {
  return sign(SALT, path, KEY)
}
