import Main from './main.vue'
import Sub from './Viewer.vue'

export default function install (Vue, config) {
  Vue.component(Main.name, Main)

  let wrapper = document.createElement('div')
  let { Image: ImageConf } = config
  let Viewer = new (Vue.extend(Sub))({
    propsData: {
      useViewer: ImageConf && ImageConf.useViewer
    }
  })
  let { lazy } = Viewer

  document.body.appendChild(wrapper)
  
  Vue.prototype.$Opal.Viewer = Viewer
  Vue.prototype.$lazy = lazy
  if (ImageConf && ImageConf.alias) {
    Vue.prototype[ImageConf.alias] = lazy
  }

  Viewer.$mount(wrapper)
}