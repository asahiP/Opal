<template>
  <div opal class="o-toast-wrapper">
    <div
      v-for="({ type, title, msg, status }, index) in task"
      :key="`o-toast-${type}-${index}`"
      :class="[
        'o-toast',
        {
          'o-toast-fade-out': status === 'destroyed'
        }
      ]"
    >
      <span
        :class="[
          'o-toast-icon',
          {
            'o-icon-info o-toast-icon-info': type === 'info',
            'o-icon-success o-toast-icon-success': type === 'success',
            'o-icon-warning o-toast-icon-warning': type === 'warning',
            'o-icon-error o-toast-icon-error': type === 'error',
          }
        ]"
      ></span>
      <p class="o-toast-title" v-text="title"></p>
      <pre class="o-toast-msg" v-text="msg"></pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'oToast',

  props: {
    duration: {
      type: Number,
      required: false,
      default: 4000,
    }
  },

  data () {
    return { task: [], id: 0 }
  },

  methods: {
    push ({ type = 'info', title, msg }) {
      let { id, duration, pickTitle } = this

      this.task.push({
        id,
        type,
        title: pickTitle(title, type),
        msg,
        status: 'mounted'
      })

      setTimeout(() => {
        this.task = this.task.map(item => {
          let { id: itemID } = item

          if (itemID === id) {
            item.status = 'destroyed'
          }

          return item
        })
      }, duration)

      this.id += 1
    },
    toast (config = '') {
      let { push } = this

      if (typeof config === 'string') {
        push({ msg: config })
      } else {
        push(config)
      }
    },
    pickTitle (title, type) {
      let picked = 'NOTICE'

      if (type) {
        switch (type.toLowerCase()) {
          case 'success':
            picked = 'SUCCESS'
            break
          case 'warning':
            picked = 'WARNING'
            break
          case 'error':
            picked = 'ERROR'
            break
        }
      }

      return title
        ? title
        : picked
    },
    emptyDestroyed () {
      let { emptyDestroyed, task } = this
      let liveCount = task.filter(({ status }) => status !== 'destroyed').length

      if (liveCount === 0 && task.length > 0) {
        this.task = []
      }

      setTimeout(emptyDestroyed, 1000 * 10)
    }
  },

  mounted () {
    this.emptyDestroyed()
  }
}
</script>