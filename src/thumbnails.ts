import path from 'node:path'
import { getSignature } from './imgproxy'

const dataFile = Bun.file(path.join(import.meta.dirname, 'data.json'))

const currentData: [string, any][] = await dataFile.json()

for (const item of currentData) {
  const url = `/w:1000/f:avif/plain/${item[1].src}`
  const thumbnailUrl = `https://imgproxy.guchengf.me/${getSignature(url)}${url}`
  item[1].thumbnail = thumbnailUrl.toString()
}

await dataFile.write(JSON.stringify(currentData, null, 2))
