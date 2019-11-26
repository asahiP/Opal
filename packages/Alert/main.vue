<template>
  <div
    opal
    :class="[
      'o-alert-wrapper',
      { 'o-alert-wrapper-active': active }
    ]">
    <div class="o-alert-mask"></div>
    <div
      :class="[
        'o-alert',
        {
          'o-alert-turnup': status === 'created',
        }
      ]"
      v-show="current"
    >
      <p class="o-alert-title" v-text="current.title"></p>
      <pre
        class="o-alert-msg"
        v-text="current.msg"
      ></pre>
      <o-button v-if="current.isConfirm" @click="current.cancelHandle" size="small" type="plain" class="o-alert-button">{{ current.cancel }}</o-button>
      <o-button @click="current.confirmHandle" size="small" class="o-alert-button">{{ current.confirm }}</o-button>
      <span
        v-if="current.type"
        :class="[
          'o-alert-icon',
          iconType,
        ]"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'oAlert',

  data () {
    return {
      task: [],
      status: '',
      active: false,
      delay: 200,
    }
  },

  methods: {
    push ({ title, msg, type, confirm, cancel }, { isAlert, isConfirm }) {
      let { pickTitle, $nextTick, delay } = this
      let self = this

      return new Promise((res, rej) => {
        title = pickTitle(title, type)
        confirm = confirm || 'OK'
        cancel = cancel || 'CANCEL'

        let handle = (callback) => {
          this.status = ''

          setTimeout(() => {
            this.task = this.task.slice(1)

            $nextTick(() => {
              this.status = this.task.length === 0
                ? ''
                : 'created'
              if (this.task.length <= 1) {
                this.active = false
              }
            })

            callback()
          }, delay)
        }

        this.active = true

        switch (true) {
          case isAlert:
            this.task.push({
              title,
              msg,
              type,
              confirm,
              isAlert,
              confirmHandle: handle.bind(self, res),
            })
            break
          case isConfirm:
            this.task.push({
              title,
              msg,
              type,
              confirm,
              cancel,
              isConfirm,
              confirmHandle: handle.bind(self, res),
              cancelHandle: handle.bind(self, rej),
            })
        }

        $nextTick(() => {
          this.status = 'created'
        })
      })
    },

    alert (isConfirm, config = '') {
      let { push } = this
      let promise

      if (typeof config === 'string') {
        promise = push({ msg: config }, { isAlert: !isConfirm, isConfirm })
      } else {
        promise = push(config, { isAlert: !isConfirm, isConfirm })
      }

      return promise
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
  },

  computed: {
    current () {
      let { task } = this

      return task.length > 0
        ? task[0]
        : {
          confirmHandle () {},
          cancelHandle () {},
        }
    },
    iconType () {
      let { current } = this
      let iconClass = ''

      if (current) {
        let { type } = current
        
        switch (type) {
          case 'info':
            iconClass = 'o-icon-info o-alert-icon-info'
            break
          case 'success':
            iconClass = 'o-icon-success o-alert-icon-success'
            break
          case 'warning':
            iconClass = 'o-icon-warning o-alert-icon-warning'
            break
          case 'error':
            iconClass = 'o-icon-error o-alert-icon-error'
        }
      }

      return iconClass
    },
  },

  mounted () {
    window.addEventListener('popstate', () => {
      let { delay } = this
      this.status = ''

      setTimeout(() => {
        this.task = []
        this.active = false
      }, delay)
    })
  }
}
</script>