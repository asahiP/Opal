import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $confirm (config: string): void
  }
}

export default function install (Vue: any, config: any): void