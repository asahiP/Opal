<template>
  <div
    opal
    :class="[
      'o-pagination-wrapper',
      { 'o-pagination-wrapper-small': small }
    ]"
  >
    <span
      :class="[
        'o-pagination-number',
        {
          'o-pagination-number-disabled': value <= 1,
          'o-icon-arrow-left': icon,
        }
      ]"
      @click.left.stop="clickHandle('prev')"
      v-text="icon ? '' : 'Prev'"
    >
    </span>
    <span
      v-for="(page, index) in pageNumbers"
      :key="'o-pagination-' + page + index"
      v-text="page === 'jump' ? '' : page"
      :class="[
        'o-pagination-number',
        {
          'o-pagination-number-active': value === page,
          'o-icon-ellipsis': page === 'jump'
        }
      ]"
      @click.left.stop="clickHandle(page, index)"
    ></span>
    <span
      :class="[
        'o-pagination-number',
        {
          'o-pagination-number-disabled': value >= Math.max(total, 1),
          'o-icon-arrow-right': icon,
        }
      ]"
      @click.left.stop="clickHandle('next')"
      v-text="icon ? '' : 'Next'"
    >
    </span>
  </div>
</template>


<script>
function isPosiInt (value) {
  return value > 0
    && value % 1 === 0
}

const PUBLIC_PROP_CONF = {
  type: Number,
  required: false,
  default: 1,
  validator: isPosiInt,
}

const PUBLIC_PROP_CONF2 = {
  type: Boolean,
  required: false,
  default: false,
}

export default {
  name: 'oPagination',

  props: {
    value: PUBLIC_PROP_CONF,
    total: PUBLIC_PROP_CONF,
    length: Object.assign({}, PUBLIC_PROP_CONF, { default: 5 }),
    small: PUBLIC_PROP_CONF2,
    icon: PUBLIC_PROP_CONF2,
  },

  model: {
    prop: 'value',
    event: 'update'
  },

  computed: {
    pageNumbers () {
      let { value, total, length } = this
      let tmp = []

      length = length % 2 === 0 ? length - 1 : length
      total = Math.max(total, 1)

      if (total - value <= 1 && total - length <= 1) {
        return [...Array(total).keys()].map(i => i + 1)
      }

      switch (true) {
        case value < length:
          tmp = [...Array(total).keys()].map(i => i + 1).slice(0, length)

          if (Math.abs(tmp.length - total) > 1) {
            tmp.push('jump')
          }

          tmp.push(total)
          break

        case total - value < length:
          tmp.push(
            1,
            'jump',
            ...[...Array(total).keys()].map(i => i + 1).slice(total - length, total)
          )
          break

        case value >= length:
          tmp.push(1, 'jump')

          for (let i = Math.floor(length / 2); i > 0; i--) {
            tmp.push(value - i)
          }

          for (let i = 0, len = Math.floor(length / 2); i <= len; i++) {
            tmp.push(value + i)
          }

          tmp.push('jump', total)
      }

      let result = []
      
      for (let i of tmp) {
        if (typeof i === 'string') {
          result.push(i)
        } else {
          if (!result.includes(i)) {
            result.push(i)
          }
        }
      }

      return result
    }
  },

  methods: {
    clickHandle (val, index = -1) {
      let { value, pageNumbers, length, total } = this
      let currentIndex = pageNumbers.indexOf(value)

      let newVal = val
      total = Math.max(total, 1)

      if (typeof val === 'string') {
        switch (val) {
          case 'jump':
            if (currentIndex > index) {
              newVal = Math.max(value - length, 1)
            } else if (currentIndex < index) {
              newVal = Math.min(value + length, total)
            }
            break
          case 'prev':
            newVal = Math.max(value - 1, 1)
            break
          case 'next':
            newVal = Math.min(value + 1, total)
        }
      }

      this.$emit('update', newVal)
    }
  }
}
</script>