
import { parse, stringify } from 'svgson'
import { svg2png } from 'svg-png-converter'
import apng from 'node-apng'
import { serialize, deserialize } from 'v8'
import fs from 'fs'

// HT https://stackoverflow.com/a/10916838
const structuredClone = obj => {
  return deserialize(serialize(obj))
}

const linesSvgAnimation = '<svg stroke="currentColor" height="512px" width="512px" viewBox="0 0 64 64"><g stroke-width="4" stroke-linecap="round"><line y1="12" y2="20" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg>'

const lines = await parse(linesSvgAnimation)

const animations = []

let frameCount = 1
let duration = 0

// First pass: learn how many svgFrames the SVG animation has.
function firstPass (node, parent = null, nodeIndex = 0) {
  console.log(node.name)
  if (node.name === 'animate') {
    console.log(node)
    if (parent === null) {
      throw new Error('Cannot animate null parent.')
    } else {
      // Note: hardcoded to all durations being the same. Works here; won’t elsewhere :)
      duration = node.attributes.dur
      const values = node.attributes.values.split(';')
      frameCount = values.length > frameCount ? values.length : frameCount
      // console.log('frame count:', frameCount)
      // console.log('Animate: ', parent.name, duration, values)
    }
  } else {
    if (node.children) {
      node.children.forEach((child, index) => firstPass(child, node, index))
    }
  }
}

firstPass(lines)

frameCount-=2

console.log('AFTER')

console.log(stringify(lines))

const svgFrames = new Array(frameCount)
for (let i = 0; i <= frameCount; i++) {
  svgFrames[i] = structuredClone(lines)
}

// Second pass: actually flatten out the animations.

function secondPass (frameIndex = 0, node, parent = null, nodeIndex = 0) {
  console.log('secondpass frameIndex', frameIndex, 'node', node.name)
  if (node.name === 'animate') {
    // console.log(node)
    if (parent === null) {
      throw new Error('Cannot animate null parent.')
    } else {
      console.log('===', frameIndex)
      const attributeName = node.attributes.attributeName
      const attributeValue = node.attributes.values.split(';')[frameIndex]
      parent.attributes[attributeName] = attributeValue
      // console.log('frame count:', frameCount)
      // console.log('Animate: ', parent.name, duration, values)

      // Remove the animation node.
      parent.children.splice(nodeIndex, 1)
    }
  } else {
    if (node.children) {
      node.children.forEach((child, index) => secondPass(frameIndex, child, node, index))
    }
  }
}

svgFrames.forEach((frame, index) => {
  console.log('Index =======================', index)
  secondPass(index, frame)
  svgFrames[index] = stringify(frame)
})

// firstPass(lines)
// console.log(animations)
// console.log(lines)

// Create the svgFrames
console.log(svgFrames)

const pngBuffers = []

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

await asyncForEach(svgFrames, async (frame, index) => {
  const pngBuffer = await svg2png({
    input: frame,
    encoding: 'buffer',
    format: 'png'
  })
  pngBuffers.push(pngBuffer)

  fs.writeFileSync(`lines${index}.png`, pngBuffer)
})

console.log(pngBuffers)

const animatedPngBuffer = apng(pngBuffers, index => ({ numerator: duration /* in ms */ , denominator: (frameCount+1) * 1000 /* ms */ }))

fs.writeFileSync('lines.png', animatedPngBuffer)
