<template>
  <div
    opal
    :class="[
      'o-tips',
      mainStyle
    ]"
  >
    <h3 class="o-tips-title" v-text="pickedTitle"></h3>
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'oTips',

  props: {
    warning: {
      type: Boolean,
      required: false,
      default: false
    },
    danger: {
      type: Boolean,
      required: false,
      default: false
    },
    title: {
      type: String,
      required: false,
    }
  },

  computed: {
    mainStyle () {
      let { warning, danger } = this

      return danger
        ? 'o-tips-danger'
        : warning
          ? 'o-tips-warning'
          : 'o-tips-info'
    },
    pickedTitle () {
      let { warning, danger, title } = this

      return title
        ? title
        : danger
          ? 'DANGER'
          : warning
            ? 'WARNING'
            : 'TIPS'
    },
  }
}
</script>