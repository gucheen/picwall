import { readdir } from 'node:fs/promises'
import { ExifDateTime, exiftool, type Tags } from 'exiftool-vendored'
import dayjs from 'dayjs'
import pug from 'pug'
import path from 'path'

type MyTags = Tags & { ExposureCompensation: string | number }

const photoFiles = await readdir(path.join(import.meta.dirname, '../photos'))

const exifEntries: [string, MyTags][] = await Promise.all(photoFiles.map(async (fileName) => {
  return exiftool.read(path.join(import.meta.dirname, '../photos', fileName)).then((tags) => [fileName, tags] as [string, MyTags])
}))

exiftool.end()

function getDatetimeObjectFromTag(tags: MyTags) {
  return tags.DigitalCreationDateTime ?? tags.DateCreated ?? tags.CreateDate
}

const exifEntriesDecending = exifEntries
  .toSorted((a: [string, MyTags], b: [string, MyTags]) => {
    const aDate = dayjs(getDatetimeObjectFromTag(a[1]) as unknown as Date)
    const bDate = dayjs(getDatetimeObjectFromTag(b[1]) as unknown as Date)
    if (bDate.isAfter(aDate)) {
      return 1
    } else {
      return -1
    }
  })

await Bun.write(path.join(import.meta.dirname, 'exif.json'), JSON.stringify(exifEntriesDecending, null, 2))

const imageHost = 'https://picimpactimages.guchengf.me'

const formatExifEntries = exifEntriesDecending.map(([fileName, tags]) => {
  const {
    Model,
    ExposureTime,
    ExposureProgram,
    ISO,
    ShutterSpeedValue,
    ApertureValue,
    FocalLength,
    ExposureMode,
    FocalLengthIn35mmFormat,
    LensModel,
    Lens,
    Format,
    ImageWidth,
    ImageHeight,
    Aperture,
    Megapixels,
    ImageSize,
    ShutterSpeed,
    LensID,
    ExposureCompensation,
    MIMEType,
    Make,
    FNumber,
    Flash,
    WhiteBalance,
  } = tags
  const createDate = dayjs(getDatetimeObjectFromTag(tags) as unknown as Date).format('YYYY-MM-DD HH:mm:ss')
  return [
    fileName,
    {
      Model: Model?.replace('_', ' '),
      ISO,
      ShutterSpeed: ShutterSpeedValue || ShutterSpeed,
      Aperture: `F${ApertureValue || Aperture || FNumber}`,
      FocalLength: `${FocalLengthIn35mmFormat || FocalLength}mm`,
      ExposureMode,
      Lens: Lens || LensModel || LensID,
      Format,
      ImageWidth,
      ImageHeight,
      Megapixels,
      ImageSize,
      ExposureCompensation,
      MIMEType,
      Make,
      Flash,
      WhiteBalance,
      createDate,
      src: new URL(path.join('photos', fileName), imageHost).toString(),
      thumbnail: new URL(path.join('thumbnails', fileName), imageHost).toString(),
      thumbnailAvif: new URL(path.join('thumbnails', fileName + '.avif'), imageHost).toString(),
    }
  ]
})

const photosHtml = pug.renderFile(path.join(import.meta.dirname, 'photos.pug'), {
  photos: formatExifEntries,
})

const base = await Bun.file(path.join(import.meta.dirname, 'index.base.html')).text()
const index = base.replace('<!-- PHOTOS -->', photosHtml)
Bun.write(path.join(import.meta.dirname, 'index.html'), index)
