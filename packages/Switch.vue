<template>
  <label
    opal
    :class="[
      'o-switch',
      {
        'o-switch-disabled': disabled,
      },
    ]"
  >
    <span
      v-if="prefix"
      v-text="prefix"
      :class="[
        'o-switch-text',
        { 'o-switch-text-active': !price }
      ]"
    ></span>
    <input
      type="checkbox"
      :name="name"
      style="display: none"
      @change="changeBundle"
      :disabled="disabled"
      :checked="price"
      ref="input"
    >
    <span opal class="o-switch-block"></span>
    <span
      v-if="suffix"
      v-text="suffix"
      :class="[
        'o-switch-text',
        { 'o-switch-text-active': price }
      ]"
    ></span>
  </label>
</template>

<script>
export default {
  name: 'oSwitch',

  props: {
    name: {
      type: String,
      required: false,
    },
    checked: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    prefix: {
      type: String,
      required: false,
    },
    suffix: {
      type: String,
      required: false,
    },
  },

  model: {
    prop: 'checked',
    event: 'change',
  },

  data () {
    return { hasParent: false, price: false }
  },

  computed: {
    formName () {
      let { name, $vnode } = this

      return `${$vnode.componentOptions.tag}({[-]})${name}`
    }
  },

  methods: {
    changeBundle (e) {
      let { name, formName, hasParent, $parent } = this
      let { checked } = e.target
      
      this.price = checked
      this.$emit('change', checked)

      if (name && hasParent) {
        $parent.syncData(formName, checked)
      }
    },
    syncStatus (newVal) {
      this.$refs.input.checked = newVal
    }
  },

  watch: {
    checked (newVal) {
      let { name, formName, hasParent, $parent } = this
      
      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }

      this.price = newVal
    }
  },

  mounted () {
    let { $parent, name, checked, formName, syncStatus } = this
    let hasParent = $parent && $parent.name === 'opal-form-component'

    this.hasParent = hasParent
    this.price = checked

    syncStatus(checked)

    if (hasParent && name) {
      $parent.addChild(this)
      
      if (checked) {
        $parent.syncData(formName, checked)
      }
    }
  }
}
</script>