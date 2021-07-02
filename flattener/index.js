
import { parse, stringify } from 'svgson'
import { svg2png } from 'svg-png-converter'
import apng from 'node-apng'
import { serialize, deserialize } from 'v8'
import fs from 'fs'
import { Console } from 'console'

// HT https://stackoverflow.com/a/10916838
const structuredClone = obj => {
  return deserialize(serialize(obj))
}

const linesSvgAnimation = '<svg stroke="currentColor" height="512px" width="512px" viewBox="0 0 64 64"><g stroke-width="4" stroke-linecap="round"><line y1="12" y2="20" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg>'

const lines = await parse(linesSvgAnimation)

// Note: this code is specifically for these SVGs. It’s not for general use.

let keyframeCount = 1
let animationDuration = 0

// Measure the number of keyframes and the animation duration.
function measureKeyframes (node, parent = null, nodeIndex = 0) {
  console.log(node.name)
  if (node.name === 'animate') {
    console.log(node)
    if (parent === null) {
      throw new Error('Cannot animate null parent.')
    } else {
      animationDuration = Number(node.attributes.dur.replace('ms', '')) // warning: last writer wins
      const values = node.attributes.values.split(';')
      keyframeCount = values.length > keyframeCount ? values.length : keyframeCount
    }
  } else {
    if (node.children) {
      node.children.forEach((child, index) => measureKeyframes(child, node, index))
    }
  }
}

measureKeyframes(lines)

keyframeCount-=2

console.log('AFTER')

console.log(stringify(lines))

const tweenFrameCount = keyframeCount * 2

console.log('Keyframe count: ', keyframeCount)
console.log('Tweenframe count: ', tweenFrameCount)

const svgFrames = new Array(tweenFrameCount)
for (let i = 0; i <= tweenFrameCount; i++) {
  svgFrames[i] = structuredClone(lines)
}

// Flatten the animation.
function flattenFrame (frameTime, node, parent = null, nodeIndex = 0) {
  console.log('flattenFrame frameTime', frameTime, 'node', node.name)
  if (node.name === 'animate') {
    if (parent === null) {
      throw new Error('Cannot animate null parent.')
    } else {
      const attributeName = node.attributes.attributeName

      const keyframeIndex = frameTime/keyframeDuration
      const previousKeyframeIndex = Math.floor(keyframeIndex)
      // Next frame index can loop back to 0 as the animation repeats
      const nextKeyframeIndex = Math.ceil(keyframeIndex) > keyframeCount ? 0 : Math.ceil(keyframeIndex)
      const frameMultiplier = (previousKeyframeIndex + nextKeyframeIndex) / keyframeIndex

      console.log('---')
      console.log('Keyframe index', keyframeIndex)
      console.log('Previous keyframe index', previousKeyframeIndex)
      console.log('Next keyframe index', nextKeyframeIndex)
      console.log('Frame multipler', frameMultiplier)

      const values = node.attributes.values.split(';')
      const previousAttributeValue = Number(values[previousKeyframeIndex])
      const nextAttributeValue = Number(values[nextKeyframeIndex])
      const tweenedAttributeValue = previousAttributeValue + (nextAttributeValue - previousAttributeValue) / frameMultiplier

      console.log('Previous attribute value', previousAttributeValue)
      console.log('Next attribute value', nextAttributeValue)
      console.log('Tweened attribute value', tweenedAttributeValue)

      if (keyframeIndex === previousKeyframeIndex) {
        parent.attributes[attributeName] = previousAttributeValue
      } else if (keyframeIndex === nextKeyframeIndex) {
        parent.attributes[attributeName] = nextAttributeValue
      } else {
        parent.attributes[attributeName] = tweenedAttributeValue
      }

      // console.log('frame count:', frameCount)
      // console.log('Animate: ', parent.name, duration, values)

      // Remove the animation node.
      parent.children.splice(nodeIndex, 1)
    }
  } else {
    if (node.children) {
      node.children.forEach((child, index) => flattenFrame(frameTime, child, node, index))
    }
  }
}

const keyframeDuration = animationDuration/keyframeCount
const outputFrameDuration = animationDuration/tweenFrameCount

console.log('Animation duration: ', animationDuration)
console.log('Keyframe duration: ', keyframeDuration)
console.log('Output frame duration: ', outputFrameDuration)

for (let outputFrameIndex = 0; outputFrameIndex < tweenFrameCount; outputFrameIndex++) {
  const frameTime = outputFrameIndex * outputFrameDuration
  const frame = svgFrames[outputFrameIndex]
  flattenFrame(frameTime, frame)
  svgFrames[outputFrameIndex] = stringify(frame)
}

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

  // fs.writeFileSync(`lines${index}.png`, pngBuffer)
})

console.log(pngBuffers)

const animatedPngBuffer = apng(pngBuffers, index => ({ numerator: animationDuration /* in ms */ , denominator: (tweenFrameCount+1) * 1000 /* ms */ }))

fs.writeFileSync('lines.png', animatedPngBuffer)
