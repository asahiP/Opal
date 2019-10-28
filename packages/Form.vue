<template>
  <form>
    <slot/>
  </form>
</template>

<script>
export default {
  name: 'oForm',

  props: {
    formdata: {
      required: false
    }
  },

  model: {
    prop: 'formdata',
    event: 'updata'
  },

  data () {
    return { formData: {}, children: {} }
  },
  
  computed: {
    name () {
      return 'opal-form-component'
    },
    fixedNameData () {
      let { formData } = this
      let result = {}

      Object.keys(formData).forEach(key => {
        let name = key.split('({[-]})')[1]
        result[name] = formData[key]
      })

      return result
    }
  },

  methods: {
    syncData (name, val) {
      let { formData, children, getValidate } = this
      let newData = Object.assign({ ...formData }, { [name]: val })

      this.formData = newData
      this.$emit('updata', this.fixedNameData)
      this.$emit('validate', getValidate)

      children[name].forEach(child => child.syncStatus(val))
    },
    getData (name) {
      return this.formData[name]
    },
    clearData () {
      let { formData, getValidate, children } = this

      Object.keys(formData).forEach(name => {
        let constructor = formData[name].constructor
        
        children[name].forEach(child => child.syncStatus(new constructor().valueOf()))
      })

      this.formData = {}
      this.$emit('updata', {})
      this.$emit('validate', getValidate)
    },
    addChild (newChild) {
      let { children } = this
      let { formName } = newChild

      let queue = (children[formName] || []).concat()

      queue.push(newChild)
      this.children[formName] = queue
    },
    /**
     * @param {object} rules - 格式 { [name]: [{ rule, matchedText, mismatchedText }] }
     */
    getValidate (rules) {
      let { $Navy, fixedNameData } = this
      let result = {}
        
      Object.keys(fixedNameData).forEach(key => {
        if (rules.hasOwnProperty(key) && Array.isArray(rules[key])) {
          result[key] = {}

          let navy = new $Navy()
  
          for (let item of rules[key]) {
            let { rule, matchedText, mismatchedText } = item

            navy.rule([
              fixedNameData[key],
              rule,
              [matchedText, mismatchedText]
            ])
          }

          let results = navy.judge()
          let matched = results.filter(({ status }) => status === 'matched')
          let mismatched = results.filter(({ status }) => status === 'mismatched')

          if (mismatched.length > 0) {
            result[key].status = 'mismatched'
            result[key].rule = mismatched[0].rule
            result[key].text = mismatched[0].text
          } else {
            let last = matched.length - 1
            result[key].status = 'matched'
            result[key].rule = matched[last].rule
            result[key].text = matched[last].text
          }
        }
      })

      return result
    },
  },
}
</script>