import path from 'node:path'
import pug from 'pug'

const formatExifEntries = (await Bun.file(path.join(import.meta.dirname, 'data.json')).json())

const webHTML = pug.renderFile(path.join(import.meta.dirname, '../web/index.pug'), {
  photos: formatExifEntries,
})

Bun.write(path.join(import.meta.dirname, '../web/index.html'), webHTML)
