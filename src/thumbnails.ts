import { readdir } from 'node:fs/promises'
import sharp from 'sharp'

const photoFiles = await readdir('./raw')

await Promise.all(photoFiles.map((fileName) => {
  const image = sharp(`./raw/${fileName}`)
    .rotate()
  return [
    image.clone()
      .jpeg({
        mozjpeg: true,
      })
      .toFile(`./photos/${fileName}`),
  ]
}).flat())

await Promise.all(photoFiles.map((fileName) => {
  const image = sharp(`./raw/${fileName}`)
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
