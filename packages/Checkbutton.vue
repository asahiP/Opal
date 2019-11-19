<template>
  <div
    style="display: inline-block; position: relative"
    @click.prevent="clickBundle"
  >
    <input
      :type="type"
      :name="name"
      style="display: none"
      ref="input"
    >
    <div
      opal
      :disabled="disabled || loading"
      :class="[
        'o-checkbutton',
        {
          'is-disabled': disabled || loading,
          'is-circle': circle,
        },
        buttonSizeClass,
      ]"
    >
      <span v-if="icon && !loading" :class="icon"></span>
      <span v-if="loading" class="o-icon-loading"></span>
      <span v-if="$slots.default && !circle" style="position: relative">
        <slot />
      </span>
      <span v-else-if="!circle" v-text="price"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'oCheckbutton',

  props: {
    name: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
      default: 'checkbox',
      validator (value) {
        return ['checkbox', 'radio'].includes(value)
      },
    },
    size: {
      type: String,
      required: false,
      default: 'normal',
      validator (value) {
        return ['small', 'normal', 'large'].includes(value)
      },
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    icon: {
      type: String,
      required: false,
    },
    circle: {
      type: Boolean,
      required: false,
    },
    value: {
      type: [String, Number, Boolean, Array],
      required: false,
      default: () => ([]),
    },
    price: {
      type: [String, Number, Boolean],
      required: false,
    },
  },

  model: {
    prop: 'value',
    event: 'click',
  },

  data () {
    return { hasParent: false }
  },

  computed: {
    buttonSizeClass () {
      return `o-checkbutton-${this.size}`
    },
    formName () {
      let { name, $vnode, type } = this

      return `${$vnode.componentOptions.tag}-${type}({[-]})${name}`
    }
  },

  methods: {
    clickBundle () {
      let { loading, disabled, value, price, type,
        $refs, name, formName, hasParent, $parent } = this
      let { input } = $refs
      let { checked } = input
      if (!loading && !disabled) {
        input.checked = !checked

        if (type !== 'radio' && Array.isArray(value)) {
          let currentValue

          if (name && hasParent) {
            currentValue = new Set($parent.getData(formName))
          } else {
            currentValue = new Set(value)
          }

          if (checked) {
            currentValue.delete(price)
          } else {
            currentValue.add(price)
          }

          let newVal = [...currentValue]

          this.$emit('click', newVal)
          
          if (name && hasParent) {
            $parent.syncData(formName, newVal)
          }
        } else {
          let newVal = checked ? undefined : price

          this.$emit('click', price)
          
          if (name && hasParent) {
            $parent.syncData(formName, newVal)
          }
        }
      }
    },
    syncChecked (newVal) {
      let { price, $refs } = this
      let { input } = $refs

      if (Array.isArray(newVal)) {
        input.checked = newVal.includes(price)
      } else {
        input.checked = newVal === price
      }
    },
    syncStatus (newVal) {
      this.syncChecked(newVal)
    }
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
    let { syncChecked, value, $parent, name, formName } = this

    syncChecked(value)

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