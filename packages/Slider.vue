<template>
  <div
    opal
    :class="[
      'o-slider-wrapper',
      { 'o-slider-wrapper-disabled': disabled }
    ]"
    :style="wrapperStyle"
    ref="wrapper"
    @mousedown.left.stop="mousedownEvent"
    @mouseenter="syncWrapperLeft"
  >
    <div
      class="o-slider-current"
      :style="currentStyle"
    ></div>
    <div
      class="o-slider-block"
      :style="blockStyle"
      ref="block"
    >
      <span
        v-if="hasTips"
        class="o-slider-tips"
        v-text="fixed"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'oSlider',

  props: {
    name: {
      type: String,
      required: false,
    },
    width: {
      type: [Number, String],
      required: false,
      default: 300,
    },
    value: {
      type: Number,
      required: false,
      default: 0,
    },
    max: {
      type: Number,
      required: false,
      default: 100,
    },
    min: {
      type: Number,
      required: false,
      default: 0,
    },
    step: {
      type: Number,
      required: false,
      default: 1,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasTips: {
      type: Boolean,
      required: false,
      default: true,
    }
  },

  model: {
    prop: 'value',
    event: 'update',
  },

  data () {
    return {
      price:0,
      blockSize: 0,
      wrapperLeft: 0,
      currentWidth: 0,
      translateX: 0,

      isMousedown: false,
      mousedownX: 0,
      mousedownTranslate: 0,
      
      hasParent: false,
    }
  },

  computed: {
    wrapperStyle () {
      let { width } = this
      
      return {
        width: `${width}px`
      }
    },
    currentStyle () {
      let { currentWidth } = this

      return {
        width: `${Math.round(currentWidth)}px`
      }
    },
    blockStyle () {
      let { translateX } = this

      return {
        transform: `translate3d(${Math.round(translateX)}px, 0, 0)`
      }
    },
    fix () {
      return this.blockSize / 2
    },
    stepArr () {
      let { step, total, max } = this

      let tmp = []
      let i = 0

      if (step === 0) return tmp
      
      while (i <= total) {
        tmp.push(i)
        i += step
      }
      
      tmp.push(max)

      return tmp
    },
    translateStep () {
      let { stepArr } = this
      let tmp = stepArr.concat()

      return tmp.map(n => this.val2translate(n))
    },
    total () {
      let { max, min } = this

      return max - min
    },
    fixed () {
      let { price, step } = this
      let precision = step.toString().split('.')[1]

      return price.toFixed(precision ? precision.length : 0)
    },
    formName () {
      let { name, $vnode } = this

      return `${$vnode.componentOptions.tag}({[-]})${name}`
    }
  },

  methods: {
    limited (val) {
      let { width, fix } = this

      return Math.max(
        fix * -1,
        Math.min(
          width - fix,
          val
        )
      )
    },
    val2translate (val, min = 0) {
      let { total, limited, width, fix } = this
      
      return limited(
        ((val - min) / total * width) - fix
      )
    },
    translate2val () {
      let { total, width, fix, min, translateX } = this
      
      return (translateX + fix) / width * total + min
    },
    mousedownEvent (e) {
      let { pageX } = e
      let { wrapperLeft, limited, fix, translateStep,
        translate2val, width, disabled, name,
        hasParent, formName, $parent } = this

      if (!disabled) {
        let translateX = pageX - wrapperLeft
  
        this.mousedownX = pageX
  
        translateX -= fix
  
        if (translateStep.length > 0) {
          let tmp = translateStep.concat()
  
          tmp.push(width - fix)
          translateX = tmp.sort((a, b) => {
            return Math.abs(a - translateX) - Math.abs(b - translateX)
          })[0]
        }
        this.translateX = this.mousedownTranslate = limited(translateX)
        this.currentWidth = translateX + fix

        let val = translate2val()

        this.$emit('update', val)
        this.price = val
        this.isMousedown = true

        if (name && hasParent) {
          $parent.syncData(formName, val)
        }
      }
    },
    mousemoveEvent (e) {
      let { isMousedown, mousedownX,
        limited, mousedownTranslate, fix,
        translateStep, translate2val,
        name, formName, hasParent, $parent } = this
      let { pageX } = e

      if (isMousedown) {
        let distance = limited(
          mousedownTranslate + pageX - mousedownX
        )

        if (translateStep.length > 0) {
          distance = translateStep.sort((a, b) => {
            return Math.abs(a - distance) - Math.abs(b - distance)
          })[0]
        }

        this.translateX = distance
        this.currentWidth = distance + fix

        let val = translate2val()

        this.$emit('update', val)
        this.price = val

        if (name && hasParent) {
          $parent.syncData(formName, val)
        }
      }
    },
    mouseupEvent () {
      this.isMousedown = false
    },
    syncWrapperLeft () {
      let { wrapper } = this.$refs

      this.wrapperLeft = wrapper.getClientRects()[0].left
    },
    syncStatus (newVal) {
      let { val2translate, fix, min } = this
      let val = val2translate(newVal, min)

      this.translateX = val
      this.currentWidth = val + fix
      this.price = newVal
    }
  },

  watch: {
    isMousedown (newVal) {
      if (newVal) {
        this.$Opal.setUserSelect('none')
      } else {
        this.$Opal.setUserSelect()
      }
    },
    value (newVal) {
      let { val2translate, fix, isMousedown, min,
        name, formName, hasParent, $parent } = this
      if (!isMousedown) {
        let val = val2translate(newVal, min)
  
        this.translateX = val
        this.currentWidth = val + fix
        this.price = newVal

        if (name && hasParent) {
          $parent.syncData(formName, newVal)
        }
      }
    },
    min () {
      let { val2translate, fix, value, min } = this
      let val = val2translate(value, min)

      this.translateX = val
      this.currentWidth = val + fix
    },
    max () {
      let { val2translate, fix, value, min } = this
      let val = val2translate(value, min)

      this.translateX = val
      this.currentWidth = val + fix
    }
  },

  mounted () {
    let { value, val2translate, $refs, min,
      mousemoveEvent, mouseupEvent, step,
      $parent, name, formName } = this
    let { block } = $refs

    this.blockSize = block.getClientRects()[0].width

    let { fix } = this
    let translate = val2translate(value, min)

    this.translateX = translate
    this.currentWidth = translate + fix
    this.step = isFinite(step) ? Math.abs(step) : 0

    let hasParent = $parent && $parent.name === 'opal-form-component'

    this.hasParent = hasParent

    if (hasParent && name) {
      $parent.addChild(this)
      
      if (value) {
        $parent.syncData(formName, value)
      }
    }

    window.addEventListener('mousemove', mousemoveEvent)
    window.addEventListener('mouseup', mouseupEvent)
  }
}
</script>