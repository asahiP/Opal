import Main from './main.vue'

export default function install (Vue, config) {
  let wrapper = document.createElement('div')
  let { Toast: ToastConf } = config
  let Toast = new (Vue.extend(Main))({
    propsData: {
      duration: ToastConf && ToastConf.duration
    }
  })
  let { toast } = Toast

  document.body.appendChild(wrapper)
  
  Vue.prototype.$toast = toast
  if (ToastConf && ToastConf.alias) {
    Vue.prototype[ToastConf.alias] = toast
  }

  Toast.$mount(wrapper)
}