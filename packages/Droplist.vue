<template>
  <div
    opal
    :class="[
      'o-droplist-wrapper',
      { 'o-droplist-wrapper-hide': !active || (datalist.length === 0 && !isLoading) }
    ]"
    @drag="e => e.preventDefault()"
  >
  <o-scroll>
    <ul @click.stop="clickBundle">
      <li
        v-for="({ value, disabled }, index) in datalist"
        :key="value + index"
        v-text="value"
        :class="{
          'o-droplist-item-current': current === value,
          'o-droplist-item-disabled': disabled,
        }"
        :item-index="index"
        :style="{
          visibility: isLoading ? 'hidden' : '',
        }"
      ></li>
    </ul>
    <span
      class="o-icon-loading"
      :style="{
        visibility: !isLoading ? 'hidden' : '',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        height: '35px',
        margin: 'auto',
        lineHeight: '35px',
        textAlign: 'center',
      }"
    ></span>
  </o-scroll>
  <div class="o-droplist-arrow"></div>
</div>
</template>

<script>
export default {
  name: 'oDroplist',

  props: {
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    datalist: {
      type: Array,
      required: false,
      default: () => ([]),
    },
    current: {
      required: false,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    wrapperClass: {
      type: String,
      required: true,
    }
  },
  
  model: {
    prop: 'active',
    event: 'update',
  },

  methods: {
    clickBundle (e) {
      let { target } = e
      let { datalist } = this

      while (target.parentNode) {
        let index = target.getAttribute('item-index')

        if (index) {
          let item = datalist[index]

          if (!item.disabled) {
            this.$emit('click', item.value)
            this.$emit('update', false)
          }
          break
        }

        target = target.parentNode
      }
    }
  },

  mounted () {
    let { wrapperClass } = this
    window.addEventListener('mousedown', (e) => {
      let { target } = e
      let hit = false

      while_loop:
      while (target.parentNode) {

        let { className } = target

        let classArr = className.split(' ')
        for (let i of classArr) {
          if (i === wrapperClass) {
            hit = true
            break while_loop
          }
        }

        target = target.parentNode
      }

      if (!hit) {
        this.$emit('update', false)
      }
    })
  }
}
</script>