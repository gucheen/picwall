import { readdir } from 'node:fs/promises'
import { ExifDateTime, exiftool, type Tags } from 'exiftool-vendored'
import dayjs from 'dayjs'
import path from 'path'

type MyTags = Tags & { ExposureCompensation: string | number }

const photoFiles = await readdir(path.join(import.meta.dirname, '../raw'))

const exifEntries: [string, MyTags][] = await Promise.all(photoFiles.map(async (fileName) => {
  return exiftool.read(path.join(import.meta.dirname, '../raw', fileName)).then((tags) => [fileName, tags] as [string, MyTags])
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
    Orientation,
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
      ImageWidth: Orientation === 8 ? ImageHeight : ImageWidth,
      ImageHeight: Orientation === 8 ? ImageWidth : ImageHeight,
      Megapixels,
      ImageSize,
      ExposureCompensation,
      MIMEType,
      Make,
      Flash,
      WhiteBalance,
      createDate,
      src: new URL(path.join('photos', fileName), imageHost).toString(),
      thumbnail: new URL(path.join('thumbnails', fileName + '.avif'), imageHost).toString(),
      Orientation,
    }
  ]
})

const dataFile = Bun.file(path.join(import.meta.dirname, 'data.json'))

const currentData: [string, any][] = await dataFile.json()

const newData = formatExifEntries.filter(entry => currentData.findIndex(ent => ent[0] === entry[0]) === -1)

if (newData.length > 0) {
  await dataFile.write(JSON.stringify(newData.concat(currentData), null, 2))
} else {
  console.log('没有新照片')
}
