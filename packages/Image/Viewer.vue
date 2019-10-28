<template>
  <div
    opal
    :class="[
      'o-viewer-wrapper',
      { 'o-viewer-wrapper-active': active }
    ]"
  >
    <div class="o-viewer-toolbar">
      <div class="o-viewer-toolbar-left">
        <span class="o-icon-arrow-left o-viewer-button" @click.left.stop="changeIndex(-1)"></span>
        <span class="o-icon-arrow-right o-viewer-button" @click.left.stop="changeIndex(1)"></span>
      </div>
      <div class="o-viewer-toolbar-right">
        <span class="o-icon-zoom-in o-viewer-button" @click.left.stop="setCurrentScale(10)"></span>
        <span class="o-icon-zoom-out o-viewer-button" @click.left.stop="setCurrentScale(-10)"></span>
        <span class="o-icon-origin-scale o-viewer-button" @click.left.stop="setOriginScale"></span>
        <span class="o-icon-fullscreen o-viewer-button" style="font-weight: bold"  @click.left.stop="bestFit"></span>
        <span class="o-icon-rotate-left o-viewer-button" @click.left.stop="rotate -= 90"></span>
        <span class="o-icon-rotate-right o-viewer-button" @click.left.stop="rotate += 90"></span>
        <span class="o-icon-leave o-viewer-button" @click.left.stop="active = false"></span>
      </div>
    </div>
    <div class="o-viewer" ref="viewer" @wheel="wheelScale">
      <img
        v-show="(current && current.status === 'ready') || status === 'ready'"
        class="o-viewer-image"
        :src="getSrc"
        :style="imgStyle"
        height="100%"
        @dragstart="e => e.preventDefault()"
        @mousedown.left.stop="mousedownHandle"
      >
      <div
        v-show="status !== 'ready'"
        class="o-viewer-unready"
      >
        <span
          :class="[
            'o-icon-image',
            { 'o-icon-image-error': (current && current.status === 'error') || status === 'error' }
          ]"
        >
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'oViewer',

  props: {
    useViewer: {
      type: Boolean,
      required: false,
      default: true,
    }
  },

  data () {
    return {
      active: false,
      id: 0,
      task: [],
      throttle: false,
      status: '',

      imgWidth: 0,
      imgHeight: 0,

      currentIndex: -1,
      rotate: 0,
      fixScale: 0,
      currentScale: 0,
      maxScale: 500,
      minScale: 10,

      mouseEvent: false,
      currentTop: 0,
      currentLeft: 0,
      mousedownTop: 0,
      mousedownLeft: 0,
      mousedownX: 0,
      mousedownY: 0,
    }
  },

  computed: {
    current () {
      let { undestroyed, currentIndex } = this
      let currentImg = undestroyed[currentIndex]

      return currentIndex >= 0 && currentImg
        ? currentImg
        : null
    },
    getSrc () {
      let { current, getImage } = this
      return current
        ? getImage(current.hrSrc, current.src)
        : ''
    },
    imgStyle () {
      let { rotate, mouseEvent, currentScale, fixScale, currentTop, currentLeft } = this

      currentScale = currentScale / 100 * fixScale
      
      return {
        transform: `rotate(${rotate}deg)`
          + ` scale(${currentScale})`
          + ` translate3d(${Math.floor(currentLeft / currentScale)}px, ${Math.floor(currentTop / currentScale)}px, 0)`,
        transition: mouseEvent ? '' : 'transform .3s ease-out',
      }
    },
    undestroyed: {
      cache: false,
      get () {
        let { task } = this

        return task.filter(({ status }) => status !== 'destroyed')
      }
    }
  },

  methods: {
    push (instance) {
      let { id } = this

      this.task.push(instance)
      this.id += 1

      return id
    },

    lazy () {
      let { task, throttle } = this

      if (!throttle) {
        this.throttle = true

        task.forEach(instance => {
          if (instance.lazy && instance.status === 'mounted') {
            instance.syncVisibility()
          }
        })

        setTimeout(() => {
          this.throttle = false
        }, 30)
      }
    },

    emptyDestroyed () {
      let { emptyDestroyed, task, undestroyed } = this
      let { length: len } = task

      if (undestroyed.length !== len) {
        this.task = undestroyed
      }

      setTimeout(emptyDestroyed, 1000 * 10)
    },

    getImage (hrSrc, src) {
      this.status = 'loading'
      src = hrSrc || src

      let img = new Image()

      img.addEventListener('load', () => {
        let { width: imgWidth, height: imgHeight } = img

        this.status = 'ready'
        this.imgWidth = imgWidth
        this.imgHeight = imgHeight
      })
      img.addEventListener('error', () => {
        this.status = 'error'
      })

      img.src = src

      let { width: imgWidth, height: imgHeight } = img
      this.imgWidth = imgWidth
      this.imgHeight = imgHeight

      return src
    },

    activationViewer (e) {
      let { target } = e
      let catched = false
      
      while (target.parentNode && !catched) {
        if (target.className.includes('o-image-wrapper')) {
          catched = true
          break
        } else {
          target = target.parentNode
        }
      }

      if (catched) {
        let status = target.getAttribute('status')

        if (status === 'ready') {
          let id = target.getAttribute('item-id')

          this.undestroyed.forEach(({ id: instanceID }, index) => {
            if (instanceID == id) {
              this.currentIndex = index
              this.active = true
              this.$nextTick(this.bestFit)
            }
          })
        }
      }
    },

    changeIndex (n) {
      let { undestroyed, currentIndex } = this
      let { length } = undestroyed

      length -= 1
      currentIndex += n

      this.currentIndex =  n > 0
        ? currentIndex > length
          ? 0
          : currentIndex
        : currentIndex < 0
          ? length
          : currentIndex
      this.$nextTick(this.bestFit)
    },
    bestFit () {
      let { imgWidth, imgHeight, rotate, $refs } = this
      let { clientWidth, clientHeight } = $refs.viewer

      this.fixScale = imgHeight / clientHeight
      this.currentTop = 0
      this.currentLeft = 0
      this.rotate = Math.round(rotate / 360) * 360

      if (imgWidth > clientWidth) {
        let scale = clientWidth / imgWidth
        if (scale * imgHeight <= clientHeight) {
          scale *= 100
          this.currentScale = scale
          return
        }
      }

      if (imgHeight > clientHeight) {
        let scale = clientHeight / imgHeight
        if (scale * imgWidth <= clientWidth) {
          scale *= 100
          this.currentScale = scale
          return
        }
      }

      this.currentScale = 100
    },
    setCurrentScale (addend) {
      let { maxScale, minScale, currentScale } = this

      this.currentScale = Math.max(
        minScale,
        Math.min(
          maxScale,
          currentScale + addend
        )
      )
    },
    wheelScale (e) {
      let { deltaY } = e
      let { setCurrentScale } = this
      
      if (deltaY > 0) {
        setCurrentScale(-2)
      } else {
        setCurrentScale(2)
      }
    },
    setOriginScale () {
      this.currentScale = 100
      this.currentLeft = 0
      this.currentTop = 0
    },
    mousedownHandle (e) {
      let { currentTop, currentLeft } = this
      let { pageX, pageY } = e

      this.mouseEvent = true
      this.mousedownTop = currentTop
      this.mousedownLeft = currentLeft
      this.mousedownX = pageX
      this.mousedownY = pageY
    },
    mousemoveHandle (e) {
      let { mousedownTop, mousedownLeft, mousedownX, mousedownY, mouseEvent, rotate } = this

      if (mouseEvent) {
        let { pageX, pageY } = e
        let distanceX = pageX - mousedownX
        let distanceY = pageY - mousedownY

        rotate = rotate % 360
        rotate = rotate < 0
          ? rotate + 360
          : rotate

        switch (rotate) {
          case 0:
            this.currentLeft = mousedownLeft + distanceX
            this.currentTop = mousedownTop + distanceY
            break
          case 90:
            this.currentLeft = mousedownLeft + distanceY
            this.currentTop = mousedownTop - distanceX
            break
          case 180:
            this.currentLeft = mousedownLeft - distanceX
            this.currentTop = mousedownTop - distanceY
            break
          case 270:
            this.currentLeft = mousedownLeft - distanceY
            this.currentTop = mousedownTop + distanceX
        }
      }

    },
    mouseupHandle () {
      this.mouseEvent = false
    }
  },

  mounted () {
    let { emptyDestroyed, activationViewer, mousemoveHandle, mouseupHandle } = this

    emptyDestroyed()

    window.addEventListener('click', activationViewer)
    window.addEventListener('mousemove', mousemoveHandle)
    window.addEventListener('mouseup', mouseupHandle)
  }
}
</script>