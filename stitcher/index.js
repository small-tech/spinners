import apng from 'node-apng'
import path from 'path'
import fs from 'fs'

const lineBuffers = []
const dotBuffers = []

const lineImages = fs.readdirSync('./lines').forEach(fileName => {
  const filePath = path.join('.', 'lines', fileName)
  lineBuffers.push(fs.readFileSync(filePath))
})

console.log(lineBuffers)

// // The callback is for frame duration: `numeration/denominator` seconds
const linesBuffer = apng(lineBuffers, index => ({ numerator: 750, denominator: 12*1000 }))
fs.writeFileSync('lines.png', linesBuffer)

