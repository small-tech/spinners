//////////////////////////////////////////////////////////////////////////////////////////
//
// Outputs a transparent animated PNG of the lines spinner by
// initially creating SVGs of each frame of the animation,
// converting them to PNGs, and stitching them together.
//
// The spinner is based on the spinner SVG from the Ionic Framework
// (https://ionicframework.com/docs/api/spinner via https://codepen.io/ionic/pen/GgwVON)
//
// Usage:
//
// node lines --help
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
program.option('-f, --frame-multiplier <multiplier>', 'determines smoothness of animation (higher is better but also larger)', '2')
program.parse()

const options = program.opts()
const size = options.size
const colour = options.colour
const frameMultiplier = parseInt(options.frameMultiplier)

// Lines animation
const values = {
  angles: [180, 210, 240, 270, 300, 330, 0, 30, 60, 90, 120, 150],
  opacityKeyframes: [1, .85, .7, .65, .55, .45, .35, .25, .15, .1, 0]
}

let keyframeCount = values.opacityKeyframes.length
let frameCount = keyframeCount * frameMultiplier
let animationDuration = 750 /* ms */

// Create the model for the lines in the spinner.
const lines = []
values.angles.forEach((angle, index) => {
  // Make a copy of the original opacity keyframes list.
  let opacityKeyframes = [...values.opacityKeyframes]

  // Rotate the opacity keyframe values, once per line.
  opacityKeyframes = opacityKeyframes.splice(opacityKeyframes.length-index).concat(opacityKeyframes)

  lines.push({
    angle,
    opacityKeyframes
  })
})

// Create one static SVG per frame of animation at the given size.
const svgs = []

for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
  let svg = `<svg width="${size}" height="${size}" stroke="${colour}" viewBox="0 0 64 64">
    <g stroke-width="4" stroke-linecap="round">`
  lines.forEach((line, lineIndex) => {
    svg += `<line y1="12" y2="20" transform="translate(32,32) rotate(${line.angle})" stroke-opacity="${opacityFor(frameIndex, lineIndex)}"></line>`
  })
  svg += `
    </g>
  </svg>`

  svgs.push(svg)
}

// Return the opacity (tweened, if necessary) for the given line at the given frame.
function opacityFor (frameIndex, lineIndex) {
  const line = lines[lineIndex]

  const keyframeIndex = frameIndex * keyframeCount / frameCount
  const previousKeyframeIndex = Math.floor(keyframeIndex)
  const nextKeyframeIndex = Math.ceil(keyframeIndex) > (keyframeCount - 1) ? 0 : Math.ceil(keyframeIndex) // animation wraps around

  const previousAttributeValue = Number(line.opacityKeyframes[previousKeyframeIndex])
  const nextAttributeValue = Number(line.opacityKeyframes[nextKeyframeIndex])
  const tweenedAttributeValue = previousAttributeValue + (nextAttributeValue - previousAttributeValue) / frameMultiplier

  let opacity

  if (keyframeIndex === previousKeyframeIndex) {
    opacity = previousAttributeValue
  } else if (keyframeIndex === nextKeyframeIndex) {
    opacity = nextAttributeValue
  } else {
    opacity = tweenedAttributeValue
  }

  return opacity
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

fs.writeFileSync('lines.png', animatedPngBuffer)


const dotValues = [
  {
    circles: [{ cx: 16, cy:32 }, {cx: 32, cy: 32}, {cx:48, cy: 32}],
    fillOpacityKeyframes: [.5, .6, .8, 1, .8, .6, .5],
    rKeyframes: [3,3,4,5,6,5,4]
  }
]

// Create the model for the dots in the spinner.
const dots = []
dotValues.circles.forEach((circle, index) => {
  // Make a copy of the original opacity keyframes list.
  let fillOpacityKeyframes = [...dotValues.fillOpacityKeyframes]
  let rKeyframes = [...dotValues.rKeyframes]

  // Rotate the keyframe values, once per line.
  fillOpacityKeyframes = fillOpacityKeyframes.splice(fillOpacityKeyframes.length-index).concat(fillOpacityKeyframes)
  rKeyframes = rKeyframes.splice(rKeyframes.length-index).concat(rKeyframes)

  dots.push({
    circle,
    fillOpacityKeyframes,
    rKeyframes
  })
})

```<svg height={size} fill={colour} viewBox="0 0 64 64">
     <g>
       <circle cx="16" cy="32" stroke-width="0" >
     </g>
   </svg>
```

const dots = [
  ```<svg height={size} fill={colour} viewBox="0 0 64 64">
  <g>
    <circle cx="16" cy="32" stroke-width="0">
      <animate attributeName="fill-opacity" dur="750ms" values=".5;.6;.8;1;.8;.6;.5;.5" repeatCount="indefinite"></animate>
      <animate attributeName="r" dur="750ms" values="3;3;4;5;6;5;4;3" repeatCount="indefinite"></animate>
    </circle>
    <circle cx="32" cy="32" stroke-width="0">
      <animate attributeName="fill-opacity" dur="750ms" values=".5;.5;.6;.8;1;.8;.6;.5" repeatCount="indefinite"></animate>
      <animate attributeName="r" dur="750ms" values="4;3;3;4;5;6;5;4" repeatCount="indefinite"></animate>
    </circle>
    <circle cx="48" cy="32" stroke-width="0">
      <animate attributeName="fill-opacity" dur="750ms" values=".6;.5;.5;.6;.8;1;.8;.6" repeatCount="indefinite"></animate>
      <animate attributeName="r" dur="750ms" values="5;4;3;3;4;5;6;5" repeatCount="indefinite"></animate>
    </circle>
  </g>
  </svg>```,
  ```<svg height={size} fill={colour} viewBox="0 0 64 64">
<g>
  <circle cx="16" cy="32" stroke-width="0">
    <animate attributeName="fill-opacity" dur="750ms" values=".5;.6;.8;1;.8;.6;.5;.5" repeatCount="indefinite"></animate>
    <animate attributeName="r" dur="750ms" values="3;3;4;5;6;5;4;3" repeatCount="indefinite"></animate>
  </circle>
  <circle cx="32" cy="32" stroke-width="0">
    <animate attributeName="fill-opacity" dur="750ms" values=".5;.5;.6;.8;1;.8;.6;.5" repeatCount="indefinite"></animate>
    <animate attributeName="r" dur="750ms" values="4;3;3;4;5;6;5;4" repeatCount="indefinite"></animate>
  </circle>
  <circle cx="48" cy="32" stroke-width="0">
    <animate attributeName="fill-opacity" dur="750ms" values=".6;.5;.5;.6;.8;1;.8;.6" repeatCount="indefinite"></animate>
    <animate attributeName="r" dur="750ms" values="5;4;3;3;4;5;6;5" repeatCount="indefinite"></animate>
  </circle>
</g>
</svg>```,
```<svg height={size} fill={colour} viewBox="0 0 64 64">
<g>
  <circle cx="16" cy="32" stroke-width="0">
    <animate attributeName="fill-opacity" dur="750ms" values=".5;.6;.8;1;.8;.6;.5;.5" repeatCount="indefinite"></animate>
    <animate attributeName="r" dur="750ms" values="3;3;4;5;6;5;4;3" repeatCount="indefinite"></animate>
  </circle>
  <circle cx="32" cy="32" stroke-width="0">
    <animate attributeName="fill-opacity" dur="750ms" values=".5;.5;.6;.8;1;.8;.6;.5" repeatCount="indefinite"></animate>
    <animate attributeName="r" dur="750ms" values="4;3;3;4;5;6;5;4" repeatCount="indefinite"></animate>
  </circle>
  <circle cx="48" cy="32" stroke-width="0">
    <animate attributeName="fill-opacity" dur="750ms" values=".6;.5;.5;.6;.8;1;.8;.6" repeatCount="indefinite"></animate>
    <animate attributeName="r" dur="750ms" values="5;4;3;3;4;5;6;5" repeatCount="indefinite"></animate>
  </circle>
</g>
</svg>```
]