<template>
  <label
    opal
    :class="[
      'o-checkbox',
      {
        'is-disabled': disabled,
      },
      checkboxSizeClass,
    ]"
  >
    <input
      type="checkbox"
      :name="name"
      :value="price"
      style="display: none"
      @change="changeBundle"
      :disabled="disabled"
      v-model="checked"
    >
    <span opal class="o-checkbox-block"></span>
    <span v-if="$slots.default">
      <slot />
    </span>
    <span v-else v-text="price"></span>
  </label>
</template>

<script>
export default {
  name: 'oCheckbox',

  props: {
    name: {
      type: String,
      required: false,
    },
    value: {
      type: Array,
      required: false,
      default: () => ([]),
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
    return {
      checked: false,
      hasParent: false,
    }
  },

  computed: {
    checkboxSizeClass () {
      return `o-checkbox-${this.size}`
    },
    formName () {
      let { name, $vnode } = this

      return `${$vnode.componentOptions.tag}({[-]})${name}`
    }
  },

  methods: {
    changeBundle () {
      let { price, value, checked, formName,
        name, $parent, hasParent } = this

      let currentValue

      if (name && hasParent) {
        currentValue = new Set($parent.getData(formName))
      } else {
        currentValue = new Set(value)
      }

      if (!checked) {
        currentValue.delete(price)
      } else {
        currentValue.add(price)
      }

      let newVal = [...currentValue]

      this.$emit('change', newVal)

      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    },
    syncChecked (newVal) {
      let { price } = this

      if (Array.isArray(newVal)) {
        this.checked = newVal.includes(price)
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