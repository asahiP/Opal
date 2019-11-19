<template>
  <label opal class="o-input-wrapper">
    <span v-if="prefix" :class="['o-input-prefix-icon', prefix]"></span>
    <input
      :type="passwordVisivility"
      :style="`width: ${width}px`"
      :class="[
        'o-input',
        {
          'o-input-has-prefix': prefix,
          'o-input-has-suffix': suffix || clearable || password,
          'o-input-matched': matched && !mismatched,
          'o-input-mismatched': !matched && mismatched,
          'o-input-disabled': disabled,
        }
      ]"
      :name="name"
      :disabled="disabled"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :minlength="minlength"
      @blur="blurBundle"
      @input="inputBundle"
      :value="price"
      v-model="price"
    >
    <span v-if="suffix" :class="['o-input-suffix-icon', suffix]"></span>
    <span
      v-else-if="password"
      :class="[
        'o-input-suffix-icon',
        'o-input-icon-auto-hide',
        {
          'o-icon-password-hidden': passwordVisivility === 'password',
          'o-icon-password-visible': passwordVisivility === 'text',
        }
      ]"
      style="cursor: pointer"
      @click="passwordVisible = !passwordVisible"
    ></span>
    <span
      v-else-if="clearable"
      class="o-input-suffix-icon o-icon-clear o-input-icon-auto-hide"
      :style="{
        visibility: price.length > 0 ? '' : 'hidden',
        cursor: 'pointer',
      }"
      @click="clean"
    ></span>
    <o-droplist
      v-model="droplistActive"
      :style="droplistStyle"
      :datalist="filteredDataList"
      :current="price"
      :isLoading="isLoading"
      wrapperClass="o-input-wrapper"
      @click="pickItem"
    />
  </label>
</template>

<script>
export default {
  name: 'oInput',

  props: {
    width: {
      type: [Number, String],
      required: false,
      default: 200,
    },
    value: {
      type: String,
      required: false,
      default: ''
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: '请输入内容',
    },
    password: {
      type: Boolean,
      required: false,
      default: false,
    },
    clearable: {
      type: Boolean,
      required: false,
      default: false,
    },
    name: {
      type: String,
      required: false,
    },
    datalist: {
      type: [Array, Function],
      required: false,
      default: () => ([]),
    },
    prefix: {
      type: String,
      required: false,
    },
    suffix: {
      type: String,
      required: false,
    },
    matched: {
      type: Boolean,
      required: false,
      default: false,
    },
    mismatched: {
      type: Boolean,
      required: false,
      default: false,
    },
    maxlength: {
      type: Number,
      required: false,
    },
    minlength: {
      type: Number,
      required: false,
    },
    delay: {
      type: Number,
      required: false,
      default: 300,
    },
    filter: {
      type: Boolean,
      required: false,
      default: true,
    }
  },

  model: {
    prop: 'value',
    event: 'input',
  },

  data () {
    return {
      passwordVisible: false,
      dataList: [],
      droplistActive: false,
      price: '',
      isLoading: false,
      isFunction: false,
      debounceID: 0,

      hasParent: false,
    }
  },

  computed: {
    passwordVisivility () {
      let { passwordVisible, password } = this

      return password
        ? passwordVisible
          ? 'text'
          : 'password'
        : 'text'
    },
    droplistStyle () {
      let { width, filteredDataList, isLoading } = this

      return {
        width: `${width}px`,
        height: `${isLoading ? 40 : Math.min(filteredDataList.length * 40, 200)}px`,
      }
    },
    filteredDataList () {
      let { dataList, priceHasValue, price, filter } = this

      return filter
        ? priceHasValue
          ? dataList.filter(({ value }) => typeof value === 'string' && value.includes(price))
          : []
        : dataList
    },
    priceHasValue () {
      return this.price.length > 0
    },
    formName () {
      let { name, $vnode } = this

      return `${$vnode.componentOptions.tag}({[-]})${name}`
    }
  },

  methods: {
    blurBundle () {
      let { price, name, formName, hasParent, $parent } = this
      
      this.$emit('blur', price)

      if (name && hasParent) {
        $parent.syncData(formName, price)
      }
    },
    pickItem (newVal) {
      let { name, formName, hasParent, $parent } = this
      
      this.price = newVal
      this.$emit('blur', newVal)

      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    },
    inputBundle () {
      let { isFunction, datalist, isLoading, debounceID, priceHasValue, delay,
        name, formName, hasParent, price, $parent } = this

      this.droplistActive = priceHasValue

      if (isFunction && !isLoading && priceHasValue) {
        this.dataList = []

        clearTimeout(debounceID)

        this.debounceID = setTimeout(() => {
          let async = datalist()

          if (async instanceof Promise) {
            this.isLoading = true

            async.then(datalist => {
              this.dataList = datalist.map(i => ({ ...i, value: i.value.toString() }))
              this.isLoading = false
            })
          }
        }, delay)
      }

      if (name && hasParent) {
        $parent.syncData(formName, price)
      }

      this.$emit('input', price)
    },
    clean () {
      let { name, hasParent, formName, $parent } = this

      this.price = ''
      this.$emit('input', '')

      if (name && hasParent) {
        $parent.syncData(formName, '')
      }
    },
    syncStatus (newVal) {
      this.price = newVal
      this.$emit('blur', newVal)
    }
  },

  watch: {
    value (newVal) {
      let { name, formName, hasParent, $parent } = this
      
      this.price = newVal

      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    }
  },

  mounted () {
    let { datalist, $parent, name, value, formName } = this
    let isFunction = typeof datalist === 'function'

    this.isFunction = isFunction
    if (!isFunction) {
      this.dataList = datalist.map(i => ({ ...i, value: i.value.toString() }))
    }
    this.price = value

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