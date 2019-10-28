<template>
  <label
    opal
    :class="[
      'o-select-wrapper',
      { 'o-select-wrapper-active': droplistActive },
      { 'o-select-wrapper-disabled': disabled },
    ]"
    :style="`width: ${width}px`"
  >
    <o-droplist
      v-model="droplistActive"
      :style="droplistStyle"
      :datalist="dataList"
      :current="price"
      :isLoading="isLoading"
      wrapperClass="o-select-wrapper"
      @click="pickItem"
    />
    <div
      @click.stop="clickBundle"
      :style="{
        width: '100%',
        height: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }"
    >
      <span
        v-if="price.toString()"
        v-text="price"
        class="o-select-price"
      ></span>
      <span
        v-else
        v-text="placeholder"
        class="o-select-placeholder"
      ></span>
      <span
        :class="[
          'o-select-icon',
          { 'o-icon-arrow-down': !droplistActive },
          { 'o-icon-arrow-up': droplistActive },
        ]"
      ></span>
    </div>
  </label>
</template>

<script>
export default {
  name: 'oSelect',

  props: {
    width: {
      type: [Number, String],
      required: false,
      default: 200,
    },
    value: {
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
      default: '请选择',
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
  },

  model: {
    prop: 'value',
    event: 'update',
  },

  data () {
    return {
      dataList: [],
      droplistActive: false,
      price: '',
      isLoading: false,
      isFunction: false,

      hasParent: false,
    }
  },

  computed: {
    droplistStyle () {
      let { width, dataList, isLoading } = this

      return {
        width: `${width}px`,
        height: `${isLoading ? 40 : Math.min(dataList.length * 40, 200)}px`,
        textAlign: 'center',
      }
    },
    formName () {
      let { name, $vnode } = this

      return `${$vnode.componentOptions.tag}({[-]})${name}`
    }
  },

  methods: {
    pickItem (newVal) {
      let { name, formName, hasParent, $parent } = this
      this.price = newVal

      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    },
    clickBundle () {
      let { isFunction, datalist, isLoading, disabled, droplistActive } = this

      if (!disabled) {
        this.droplistActive = !droplistActive
      }

      if (isFunction && !isLoading && !droplistActive && !disabled) {
        this.dataList = []

        let async = datalist()

        if (async instanceof Promise) {
          this.isLoading = true

          async.then(datalist => {
            this.dataList = datalist.map(i => ({ ...i, value: i.value.toString() }))
            this.isLoading = false
          })
        }
      }
    },
    syncStatus (newVal) {
      this.price = newVal
    }
  },

  watch: {
    value (newVal) {
      let { name, formName, hasParent, $parent } = this

      this.price = newVal

      if (name && hasParent) {
        $parent.syncData(formName, newVal)
      }
    },
    price (newVal) {
      this.$emit('update', newVal)
    }
  },

  mounted () {
    let { datalist, $parent, name, formName, value } = this
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