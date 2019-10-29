import Vue from 'vue'

type type = 'info' | 'success' | 'warning' | 'error'

interface toastArgs {
  title?: string
  msg: string
  type?: type
}

interface alertArgs extends toastArgs {
  confirm?: string
  cancel?: string
}

declare module 'vue/types/vue' {
  interface Vue {
    $alert (arg: string | alertArgs): Promise<void>
    $confirm (arg: string | alertArgs): Promise<void>
    $lazy (): void
    $toast (arg: string | toastArgs): void
  }
}

export default function install (Vue: any, config: any): void