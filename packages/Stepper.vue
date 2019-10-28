<template>
  <label
    opal
    :class="[
      'o-stepper-wrapper',
      { 'o-stepper-disabled': disabled }
    ]"
  >
    <input
      type="text"
      :value="price.toFixed(precision)"
      :class="[
        'o-stepper',
        { 'o-stepper-single': single }
      ]"
      :style="`width: ${width}px`"
      :disabled="disabled"
      @change="valueChange"
    >
    <span
      v-if="!single"
      :class="[
        'o-icon-plus',
        'o-stepper-button-right',
        { 'o-stepper-button-disabled': price === max }
      ]"
      @mousedown.left.stop="add(step)"
    ></span>
    <span
      v-else
      :class="[
        'o-icon-arrow-up',
        'o-stepper-button-right',
        { 'o-stepper-button-disabled': price === max }
      ]"
      @mousedown.left.stop="add(step)"
    ></span>
    <span
      v-if="!single"
      :class="[
        'o-icon-minus',
        'o-stepper-button-left',
        { 'o-stepper-button-disabled': price === min }
      ]"
      @mousedown.left.stop="add(-step)"
    ></span>
    <span
      v-else
      :class="[
        'o-icon-arrow-down',
        'o-stepper-button-left',
        { 'o-stepper-button-disabled': price === min }
      ]"
      @mousedown.left.stop="add(-step)"
    ></span>
  </label>
</template>

<script>
export default {
  name: 'oStepper',

  props: {
    name: {
      type: String,
      required: false,
    },
    width: {
      type: [Number, String],
      required: false,
      default: 80,
    },
    single: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    value: {
      type: Number,
      required: false,
      default: 0,
    },
    step: {
      type: Number,
      required: false,
      default: 1,
    },
    min: {
      type: Number,
      required: false,
      default: -Infinity,
    },
    max: {
      type: Number,
      required: false,
      default: Infinity,
    },
    precision: {
      type: Number,
      required: false,
      default: 0,
    }
  },

  model: {
    prop: 'value',
    event: 'update'
  },

  data () {
    return {
      price: 0,
      addID: 0,

      hasParent: false,
    }
  },

  computed: {
    formName () {
      let { name, $vnode } = this

      return `${$vnode.componentOptions.tag}({[-]})${name}`
    }
  },

  methods: {
    add (step) {
      let { price, limited, add, disabled } = this

      if (!disabled) {
        this.price = limited(price + step)
        this.addID = setTimeout(() => {
          add(step)
        }, 150)
        this.$Opal.setUserSelect('none')
      }
    },
    valueChange (e) {
      let { value } = e.target
      let { limited, precision, toFixed } = this

      value = parseFloat(value)
      value = toFixed(limited(isNaN(value) ? 0 : value), precision)
      this.price = value
      e.target.value = value.toFixed(precision)
    },
    limited (val) {
      let { min, max } = this

      return Math.max(
        min,
        Math.min(
          max,
          val
        )
      )
    },
    toFixed (num, precision) {
      let multiple = Math.pow(10, precision)

      return Math.round(num * multiple) / multiple
    },
    syncStatus (newVal) {
      this.price = this.limited(newVal)
    }
  },

  watch: {
    value (newVal) {
      let { name, formName, hasParent, $parent } = this
      
      this.price = this.limited(newVal)
      
      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    },
    price (newVal) {
      let { name, formName, hasParent, $parent } = this

      this.$emit('update', newVal)

      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    }
  },

  mounted () {
    let { $parent, name, formName, value } = this

    this.price = value

    window.addEventListener('mouseup', () => {
      clearTimeout(this.addID)
      this.$Opal.setUserSelect()
    })

    let hasParent = $parent && $parent.name === 'opal-form-component'

    this.hasParent = hasParent

    if (hasParent && name) {
      $parent.addChild(this)
      
      if (value) {
        $parent.syncData(formName, value)
      }
    }
  }
}
</script>