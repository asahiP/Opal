<template>
<div opal :style="wrapperStyle" class="o-code-wrapper">
  <div :style="codeStyle">
    <o-scroll v-if="!isParsing" :hook="syncScrollTop">
      <pre
        class="o-code"
      >
        <code v-html="highlightedCode"></code>
      </pre>
    </o-scroll>
    <div
      v-else
      class="o-code-isparsing"
      :style="{
        ...codeStyle,
        left: 'unset',
        width: '100%',
        lineHeight: `${lodingHeight}px`,
      }">
      <span class="o-icon-loading"></span>
    </div>
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

  data () {
    return {
      code: '',
      highlightedCode: '',

      isParsing: false,
      scrollTop: 0,
      indexWidth: 0,
      indexHeight: 0,
      lodingHeight: 16 * 1.3 * 5 + 10,
    }
  },

  computed: {
    wrapperStyle () {
      let { indexHeight, isParsing, lodingHeight } = this

      return {
        height: isParsing
          ? `${lodingHeight}px`
          : `${indexHeight}px`
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

      for (let i = end - 1; i > 0; i--) {
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
    formattedCode (newVal) {
      this.highlightedCode = ''
      this.isParsing = true

      setTimeout(() => {
        let { value } = hljs.highlightAuto(newVal.join('\r'))
        this.highlightedCode = value
        this.isParsing = false
      }, 0)
    }
  },

  mounted () {
    this.code = this.$slots.default
      .filter(({ tag, text }) => tag === undefined && text)
      .map(({ text }) => text)
      .join('\r')

    this.$nextTick(() => {
      this.indexWidth = this.$refs.index.offsetWidth
      this.indexHeight = this.$refs.index.offsetHeight
    })
  }
}
</script>