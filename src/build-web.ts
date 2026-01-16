import path from 'node:path'
import { Edge } from 'edge.js'
import index from './index.edge' with { type: 'text' }

const edge = Edge.create({
  cache: false,
})

edge.registerTemplate('index', {
  template: index,
})

const formatExifEntries = (await Bun.file(path.join(import.meta.dirname, 'data.json')).json())
const html = await edge.render('index', {
  photos: formatExifEntries,
})

Bun.write(path.join(import.meta.dirname, '../web/index.html'), html)
