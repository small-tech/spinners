//////////////////////////////////////////////////////////////////////////////////////////
//
// Outputs a transparent animated PNG of the dots spinner by
// initially creating SVGs of each frame of the animation,
// converting them to PNGs, and stitching them together.
//
// The spinner is based on the dots spinner SVG from the Ionic Framework
// (https://ionicframework.com/docs/api/spinner via https://codepen.io/ionic/pen/GgwVON)
//
// Usage:
//
// node dots --help
//
//////////////////////////////////////////////////////////////////////////////////////////

import { svg2png } from 'svg-png-converter'
import apng from 'node-apng'
import fs from 'fs'
import { Command } from 'commander/esm.mjs'

// Note: the default colour is chosen from list of colours that have a contrast ratio of
// at least 4.5:1 on both black and white backgrounds.
// (https://web.archive.org/web/20160214165231/trace.wisc.edu/contrast-ratio-examples/PassingMidColorSamples_4-5to1.htm)

const program = new Command()
program.version('1.0.0')
program.option('-s, --size <size>', 'size of PNG in CSS units (output is square)', '128px')
program.option('-c, --colour <colour>', 'colour of the PNG (must be valid CSS colour)', '#006aff')
program.option('-f, --frame-multiplier <multiplier>', 'determines smoothness of animation (higher is better but also larger)', '4')
program.parse()

const options = program.opts()
const size = options.size
const colour = options.colour
const frameMultiplier = parseInt(options.frameMultiplier)

// Dots animation
const values = {
  circles: [{ cx: 16, cy:32 }, {cx: 32, cy: 32}, {cx:48, cy: 32}],
  fillOpacityKeyframes: [.5, .6, .8, 1, .8, .6, .5],
  rKeyframes: [3,3,4,5,6,5,4]
}

let keyframeCount = values.fillOpacityKeyframes.length
let frameCount = keyframeCount * frameMultiplier
let animationDuration = 750 /* ms */

// Create the model for the dots in the spinner.
const dots = []
values.circles.forEach((circle, index) => {
  // Make a copy of the original opacity keyframes list.
  let fillOpacityKeyframes = [...values.fillOpacityKeyframes]
  let rKeyframes = [...values.rKeyframes]

  // Rotate the keyframe values, once per line.
  fillOpacityKeyframes = fillOpacityKeyframes.splice(fillOpacityKeyframes.length-index).concat(fillOpacityKeyframes)
  rKeyframes = rKeyframes.splice(rKeyframes.length-index).concat(rKeyframes)

  dots.push({
    circle,
    fillOpacityKeyframes,
    rKeyframes
  })
})

// Create one static SVG per frame of animation at the given size.
const svgs = []

for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
  let svg = `<svg width="${size}" height="${size}" fill="${colour}" viewBox="0 0 64 64">
    <g>`
  dots.forEach((dot, dotIndex) => {
    const attributes = attributesFor(frameIndex, dotIndex)
    svg += `<circle cx="${dot.circle.cx}" cy="${dot.circle.cy}" stroke-width="0" r="${attributes.r}" fill-opacity="${attributes.fillOpacity}"></circle>`
  })
  svg += `
    </g>
  </svg>`

  svgs.push(svg)
}

// Return the opacity (tweened, if necessary) for the given dot at the given frame.
function attributesFor (frameIndex, dotIndex) {
  const dot = dots[dotIndex]

  const keyframeIndex = frameIndex * keyframeCount / frameCount
  const previousKeyframeIndex = Math.floor(keyframeIndex)
  const nextKeyframeIndex = Math.ceil(keyframeIndex) > (keyframeCount - 1) ? 0 : Math.ceil(keyframeIndex) // animation wraps around

  const previousFillOpacityValue = Number(dot.fillOpacityKeyframes[previousKeyframeIndex])
  const nextFillOpacityValue = Number(dot.fillOpacityKeyframes[nextKeyframeIndex])
  const tweenedFillOpacityValue = previousFillOpacityValue + (nextFillOpacityValue - previousFillOpacityValue) / frameMultiplier

  const previousRValue = Number(dot.rKeyframes[previousKeyframeIndex])
  const nextRValue = Number(dot.rKeyframes[nextKeyframeIndex])
  const tweenedRValue = previousRValue + (nextRValue - previousRValue) / frameMultiplier

  let attributes

  if (keyframeIndex === previousKeyframeIndex) {
    attributes = {fillOpacity: previousFillOpacityValue, r: previousRValue}
  } else if (keyframeIndex === nextKeyframeIndex) {
    attributes = {fillOpacity: nextFillOpacityValue, r: nextRValue}
  } else {
    attributes = {fillOpacity: tweenedFillOpacityValue, r: tweenedRValue}
  }

  return attributes
}

// Convert SVGs into PNG buffers.
const pngBuffers = []

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

await asyncForEach(svgs, async (frame, index) => {
  const pngBuffer = await svg2png({
    input: frame,
    encoding: 'buffer',
    format: 'png'
  })
  pngBuffers.push(pngBuffer)
})

// Convert the PNG buffers into an animation SVG.
const animatedPngBuffer = apng(pngBuffers, index => ({ numerator: animationDuration /* in ms */ , denominator: (frameCount) * 1000 /* ms */ }))

fs.writeFileSync('dots.png', animatedPngBuffer)
