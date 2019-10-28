<template>
  <button
    opal
    @click="clickBundle"
    :disabled="disabled || loading"
    :class="[
      'o-button',
      {
        'is-disabled': disabled || loading,
        'is-circle': circle,
      },
      buttonTypeClass,
      buttonSizeClass,
    ]"
    :type="nativeType"
  >
    <span v-if="icon && !loading" :class="icon"></span>
    <span v-if="loading" class="o-icon-loading"></span>
    <span v-if="$slots.default">
      <slot />
    </span>
  </button>
</template>

<script>
export default {
  name: 'oButton',

  props: {
    type: {
      type: String,
      required: false,
      default: 'default',
      validator (value) {
        return ['default', 'plain', 'success', 'warning', 'danger'].includes(value)
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
    nativeType: {
      type: String,
      required: false,
      default: 'button',
      validator (value) {
        return ['button', 'submit', 'reset'].includes(value)
      },
    },
    icon: {
      type: String,
      required: false,
    },
    circle: {
      type: Boolean,
      required: false,
    }
  },

  data () {
    return { hasParent: false }
  },

  computed: {
    buttonTypeClass () {
      return `o-button-${this.type}`
    },
    buttonSizeClass () {
      return `o-button-${this.size}`
    }
  },

  methods: {
    clickBundle (e) {
      let { hasParent, $parent, nativeType } = this

      this.$emit('click', e)

      if (hasParent && nativeType === 'reset') {
        $parent.clearData()
        e.preventDefault()
      }
    }
  },

  mounted () {
    let { $parent } = this

    this.hasParent = $parent && $parent.name === 'opal-form-component'
  }
}
</script>