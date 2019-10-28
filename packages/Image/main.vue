<template>
  <div
    opal
    class="o-image-wrapper"
    :title="title"
    :style="wrapperStyle"
    :status="status"
    :item-id="id"
    ref="img"
  >
    <img
      v-if="status === 'ready'"
      :src="src"
      :width="width"
      :height="height"
    />
    <div v-else class="o-image-unready">
      <span
        :class="{
          'o-icon-image': status === 'mounted',
          'o-icon-image-error': status === 'error',
        }"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'oImage',

  props: {
    width: {
      type: [String, Number],
      required: false,
    },
    height: {
      type: [String, Number],
      required: false,
    },
    src: {
      type: String,
      required: false,
    },
    hrSrc: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    lazy: {
      type: Boolean,
      required: false,
      default: false,
    }
  },

  data () {
    return {
      id: 0,

      imgWidth: 0,
      imgHeight: 0,

      wrapperWidth: 0,
      wrapperHeight: 0,

      status: '',
      visible: null,
      useViewer: undefined,
    }
  },

  computed: {
    wrapperStyle () {
      let { wrapperWidth, wrapperHeight, useViewer, status } = this
      let isReady = status === 'ready'

      return {
        width: isReady ? '' : `${wrapperWidth}px`,
        height: isReady ? '' : `${wrapperHeight}px`,

        cursor: isReady && useViewer ? 'zoom-in' : ''
      }
    }
  },

  methods: {
    getImage () {
      let { src } = this
      let img = new Image()

      img.addEventListener('load', () => {
        this.status = 'ready'
      })
      img.addEventListener('error', () => {
        this.status = 'error'
      })

      img.src = src
    },
    syncVisibility (lazy) {
      if (lazy !== undefined && !lazy) {
        this.visible = true
      }


      let { visible } = this

      if (!visible) {
        let { wrapperWidth, wrapperHeight, $refs } = this
        let { img } = $refs
        let { innerWidth, innerHeight } = window
        let { x, y } = img.getClientRects()[0]
        let includesX = x - innerWidth < 0 && x > wrapperWidth * -1
        let includesY = y - innerHeight < 0 && y > wrapperHeight * -1
  
        this.visible = includesX && includesY
      }
    }
  },

  watch: {
    visible (newVal) {
      if (newVal === true) {
        this.getImage()
      }
    }
  },

  mounted () {
    let { width, height, lazy, syncVisibility, $Opal, $nextTick } = this
    let { Viewer } = $Opal

    this.wrapperWidth = width || height || 200
    this.wrapperHeight = height || width || 200
    this.status = 'mounted'
    this.useViewer = Viewer.useViewer
    this.id = Viewer.push(this)

    $nextTick(() => {
      syncVisibility(lazy)
    })
  },

  destroyed () {
    this.status = 'destroyed'
  }
}
</script>