import Main from './main.vue'

export default function install (Vue, config) {
  let wrapper = document.createElement('div')
  let { Alert: AlertConf, Confirm: ConfirmConf } = config
  let Alert = new (Vue.extend(Main))()
  let { alert } = Alert

  document.body.appendChild(wrapper)
  
  let confirm = alert.bind(Alert, true)
  alert = alert.bind(Alert, false)
  
  Vue.prototype.$alert = alert
  Vue.prototype.$confirm = confirm
  if (AlertConf && AlertConf.alias) {
    Vue.prototype[AlertConf.alias] = alert
  }
  if (ConfirmConf && ConfirmConf.alias) {
    Vue.prototype[ConfirmConf.alias] = confirm
  }

  Alert.$mount(wrapper)
}