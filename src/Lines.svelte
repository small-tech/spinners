<script>
  // Spinner is based on the Ionic Framework
  // (https://ionicframework.com/docs/api/spinner via https://codepen.io/ionic/pen/GgwVON)
  export let size = '32px'
  export let colour = 'currentColor'
  export let show = true

  // Lines animation
  const values = {
    angles: [180, 210, 240, 270, 300, 330, 0, 30, 60, 90, 120, 150],
    opacityKeyframes: [1, .85, .7, .65, .55, .45, .35, .25, .15, .1, 0]
  }
  const lines = []
  values.angles.forEach((angle, index) => {
    let opacityKeyframes = [...values.opacityKeyframes]
    opacityKeyframes = opacityKeyframes.splice(opacityKeyframes.length-index).concat(opacityKeyframes) // Rotate the opacity keyframe values, once per line.
    opacityKeyframes.push(opacityKeyframes[0])                                           // Repeat the initial opacity.
    opacityKeyframes = opacityKeyframes.join(';')
    lines.push({
      angle,
      opacityKeyframes
    })
  })
</script>

{#if show}
  <svg height={size} stroke={colour} viewBox="0 0 64 64">
    <g stroke-width="6" stroke-linecap="round">
      {#each lines as line}
        <line y1="18" y2="29" transform="translate(32,32) rotate({line.angle})">
          <animate attributeName="stroke-opacity" dur="750ms" values={line.opacityKeyframes} repeatCount="indefinite"></animate>
        </line>
      {/each}
    </g>
  </svg>
{/if}
