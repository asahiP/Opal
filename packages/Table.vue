<template>
<div :style="wrapperStyle">
  <o-scroll>
    <table
      opal
      :class="[
        'o-table',
        {
          'o-table-has-border': border,
          'o-table-has-stripe': stripe,
        }
      ]"
    >
      <slot v-if="$slots.default"/>
      <template v-else>
        <thead v-if="data.head">
          <tr>
            <th
              v-for="({ prop, label, sortable, width }, index) in data.head"
              :key="label + index"
              :style="{
                width: width ? `${width}px` : '',
                cursor: sortable ? 'pointer' : '',
              }"
              @click.left.stop="getSort(prop, sortable)"
            >
              {{ label }}
              <div
                v-if="sortable"
                :class="[
                  'o-table-sort',
                  {
                    'o-table-sort-asce': sortProp === prop && sortStatus === 'asce',
                    'o-table-sort-desc': sortProp === prop && sortStatus === 'desc',
                  }
                ]"
              >
                <div class="o-table-sort-icon-left">
                  <span class="o-icon-sort"></span>
                </div>
                <div class="o-table-sort-icon-right">
                  <span class="o-icon-sort"></span>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-if="data.body">
          <tr
            v-for="(item, index) in body"
            :key="'tr-item-' + index"
          >
            <td
              v-for="(prop, bIndex) in head"
              :key="'td-item-' + bIndex"
              v-text="item[prop]"
            ></td>
          </tr>
        </tbody>
      </template>
    </table>
  </o-scroll>

</div>
</template>

<script>
export default {
  name: 'oTable',

  props: {
    width: {
      required: false,
    },
    height: {
      required: false,
    },
    border: {
      type: Boolean,
      required: false,
      default: false,
    },
    stripe: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * 格式: { head, body }
     * head 格式: [{ prop, label, sortable, width }, ...]
     */
    data: {
      required: false,
    }
  },

  data () {
    return {
      sortProp: '',
      /**
       * sortStatus = 'none' | 'asce' | 'desc'
       * 排序状态 = '不排序' | '升序' | '降序'
       */
      sortStatus: 'none',
    }
  },

  computed: {
    wrapperStyle () {
      let { width, height } = this

      return {
        display: 'inline-block',

        width: width ? `${width}px` : '',
        height: height ? `${height}px` : ''
      }
    },
    head () {
      let { head, body } = this.data

      return head
        ? head.map(({ prop }) => prop)
        : Array.isArray(body[0])
          ? Object.keys(body[0])
          : []
    },
    body () {
      let { data, sortProp, sortStatus } = this
      let bodyCopy = []

      if (Array.isArray(data.body)) {
        bodyCopy = data.body.concat()

        switch (sortStatus) {
          case 'asce':
            bodyCopy.sort((a, b) => {
              let valA = a[sortProp].toString()
              let valB = b[sortProp].toString()
  
              return valA.localeCompare(valB)
            })
            break
          case 'desc':
            bodyCopy.sort((a, b) => {
              let valA = a[sortProp].toString()
              let valB = b[sortProp].toString()
  
              return valB.localeCompare(valA)
            })
        }

      }

      return bodyCopy
    }
  },

  methods: {
    getSort (prop, sortable) {
      if (sortable) {
        let { sortProp, sortStatus } = this
        let status = ''
  
        this.sortProp = prop
  
        switch (sortStatus) {
          case 'none':
            status = 'asce'
            break
          case 'asce':
            status = sortProp === prop
              ? 'desc'
              : 'asce'
            break
          case 'desc':
            status = sortProp === prop
              ? 'none'
              : 'asce'
        }
  
        this.sortStatus = status
      }
    }
  }
}
</script>