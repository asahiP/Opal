<template>
  <label
    opal
    :class="[
      'o-radio',
      {
        'is-disabled': disabled,
      },
      radioSizeClass,
    ]"
  >
    <input
      type="radio"
      :name="name"
      :value="price"
      style="display: none"
      @change="changeBundle"
      :disabled="disabled"
      ref="input"
    >
    <span opal class="o-radio-block"></span>
    <span v-if="$slots.default">
      <slot />
    </span>
    <span v-else v-text="price"></span>
  </label>
</template>

<script>
export default {
  name: 'oRadio',

  props: {
    name: {
      type: String,
      required: false,
    },
    value: {
      type: [String, Number, Boolean],
      required: false,
    },
    price: {
      type: [String, Number, Boolean],
      required: false,
    },
    size: {
      type: String,
      required: false,
      default: 'normal',
      validator (value) {
        return ['normal', 'large'].includes(value)
      },
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  model: {
    prop: 'value',
    event: 'change',
  },

  data () {
    return { hasParent: false }
  },

  computed: {
    radioSizeClass () {
      return `o-radio-${this.size}`
    },
    formName () {
      let { name, $vnode } = this

      return `${$vnode.componentOptions.tag}({[-]})${name}`
    }
  },

  methods: {
    changeBundle () {
      let { price, name, formName, hasParent, $parent } = this

      this.$emit('change', price)

      if (name && hasParent) {
        $parent.syncData(formName, price)
      }
    },
    syncChecked (newVal) {
      let { price, $refs } = this

      $refs.input.checked = newVal === price
    },
    syncStatus (newVal) {
      this.syncChecked(newVal)
    },
  },

  watch: {
    value (newVal) {
      let { name, formName, hasParent, $parent } = this

      this.syncChecked(newVal)

      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    }
  },

  mounted () {
    let { syncChecked, value, $parent, name, formName, price } = this

    syncChecked(value)

    let hasParent = $parent && $parent.name === 'opal-form-component'

    this.hasParent = hasParent

    if (hasParent && name) {
      $parent.addChild(this)
      
      if (value === price) {
        $parent.syncData(formName, price)
      }
    }
  }
}
</script>