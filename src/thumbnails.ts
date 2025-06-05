import { readdir } from 'node:fs/promises'
import sharp from 'sharp'

const photoFiles = await readdir('./photos')

await Promise.all(photoFiles.map((fileName) => {
  const image = sharp(`./photos/${fileName}`)
  .resize({
    width: 1000,
    height: 1000,
    fit: 'inside',
  })
  .rotate()
  return [
    image.clone()
    .toFile(`./thumbnails/${fileName}.avif`),
  ]
}).flat())
