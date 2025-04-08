import path from 'node:path'
import pug from 'pug'

const formatExifEntries = (await Bun.file(path.join(import.meta.dirname, 'data.json')).json())

const photosHtml = pug.renderFile(path.join(import.meta.dirname, '../web/photos.pug'), {
  photos: formatExifEntries,
})

const base = await Bun.file(path.join(import.meta.dirname, '../web/index.base.html')).text()
const index = base.replace('<!-- PHOTOS -->', photosHtml)
Bun.write(path.join(import.meta.dirname, '../web/index.html'), index)
