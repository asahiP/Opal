<template>
<div opal :style="wrapperStyle" class="o-code-wrapper">
  <div :style="codeStyle">
    <o-scroll :hook="syncScrollTop">
      <pre
        class="o-code"
      >
        <code v-html="isParsing ? formattedCode.join('\r') : highlightedCode"></code>
      </pre>
    </o-scroll>
  </div>
  <pre
    v-html="indexText"
    class="o-code-index"
    ref="index"
    :style="indexStyle"
  ></pre>
</div>
</template>

<script>
import hljs from 'highlight.js'

export default {
  name: 'oCode',

  props: {
    text: {
      type: String,
      required: false,
    },
    lang: {
      type: String,
      replaced: false,
    }
  },

  data () {
    return {
      code: '',
      highlightedCode: '',

      isParsing: false,
      scrollTop: 0,
      indexWidth: 0,
      indexHeight: 0,
    }
  },

  computed: {
    wrapperStyle () {
      let { indexHeight } = this

      return {
        height: `${indexHeight}px`
      }
    },
    codeStyle () {
      let { indexWidth } = this

      return {
        position: 'relative',
        left: `${indexWidth}px`,

        width: `calc(100% - ${indexWidth}px)`,
        height: '100%'
      }
    },
    indexStyle () {
      let { scrollTop } = this

      return {
        top: `${-scrollTop}px`
      }
    },
    formattedCode () {
      let { code } = this
      let lines = code.split(/[\n\r]/)
      let space = []

      let start = 0
      let end = lines.length

      for (let i = 0; i < end; i++) {
        if (/[^\s]/g.test(lines[i])) {
          start = i
          break
        }
      }

      for (let i = end - 1; i >= 0; i--) {
        if (/[^\s]/g.test(lines[i])) {
          end = i + 1
          break
        }
      }

      lines = lines.slice(start, end)

      lines.forEach(line => {
        let s = 0

        for (let i of line) {
          if (i === ' ') {
            s++
          } else {
            break
          }
        }

        if (s > 0) {
          space.push(s)
        }
      })

      space = [...new Set(space)]
      space.sort((a, b) => b - a)

      let maxCount = -Infinity, maxSize

      space.forEach(size => {
        let n = 0
        for (let line of lines) {
          if (/[^\s]/.test(line)) {
            let replaced = ' '.repeat(size) + line.slice(size)
            if (replaced === line) {
              n++
            }
          }
        }

        switch (true) {
          case n > maxCount:
            maxCount = n
            maxSize = size
            break
          case n === maxCount:
            maxSize = maxSize > size
              ? maxSize
              : size
        }
      })

      let lineLength = lines.filter(line => /[^\s]/.test(line)).length
      let tabSize = maxCount >= lineLength
        ? maxSize
        : undefined

      return tabSize
        ? lines.map(line => {
            let replaced = line.slice(tabSize)

            return replaced
          })
        : lines
    },
    indexText () {
      let { lineCount } = this

      return [...Array(lineCount).keys()]
        .map(i => i + 1)
        .join('\r')
    },
    lineCount () {
      return this.formattedCode.length
    }
  },

  methods: {
    syncScrollTop (left, top) {
      this.scrollTop = top
    }
  },

  watch: {
    text (newVal) {
      this.code = newVal

      this.$nextTick(() => {
        this.indexWidth = this.$refs.index.offsetWidth
        this.indexHeight = this.$refs.index.offsetHeight
      })
    },
    formattedCode (newVal) {
      let { lang } = this
      this.highlightedCode = ''
      this.isParsing = true
      newVal = newVal.join('\r')

      setTimeout(() => {
        let { value } = lang
          ? hljs.highlight(lang, newVal)
          : hljs.highlightAuto(newVal)
        this.highlightedCode = value
        this.isParsing = false
      }, 0)
    }
  },

  mounted () {
    let { text, $slots } = this
    let child = $slots.default && $slots.default[0]

    if (text) {
      this.code = text
    } else if (child && child.children && child.children[0]) {
      this.code = child.children[0].text
    }

    this.$nextTick(() => {
      this.indexWidth = this.$refs.index.offsetWidth
      this.indexHeight = this.$refs.index.offsetHeight
    })
  }
}
</script>