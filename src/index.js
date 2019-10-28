import './styles/default.scss'
import './styles/monokai-sublime.css'

import Navy from 'navy-scheme'

import Button from '../packages/Button.vue'
import Checkbox from '../packages/Checkbox.vue'
import Checkbutton from '../packages/Checkbutton.vue'
import Code from '../packages/Code.vue'
import Droplist from '../packages/Droplist.vue'
import Form from '../packages/Form.vue'
import Input from '../packages/Input.vue'
import Pagination from '../packages/Pagination.vue'
import Radio from '../packages/Radio.vue'
import Scroll from '../packages/Scroll.vue'
import Select from '../packages/Select.vue'
import Slider from '../packages/Slider.vue'
import Stepper from '../packages/Stepper.vue'
import Switch from '../packages/Switch.vue'
import Table from '../packages/Table.vue'
import Tips from '../packages/Tips.vue'

import Alert from '../packages/Alert'
import Image from '../packages/Image'
import Toast from '../packages/Toast'

const components = [
  Button,
  Checkbox,
  Checkbutton,
  Code,
  Droplist,
  Form,
  Input,
  Pagination,
  Radio,
  Scroll,
  Select,
  Slider,
  Stepper,
  Switch,
  Table,
  Tips,
]

const methods = [
  Alert,
  Image,
  Toast,
]

export default function install (Vue, config = {}) {
  if (!Vue.prototype.$Opal) {
    Vue.prototype.$Opal = {
      setUserSelect (val) {
        if (val) {
          document.body.setAttribute('user-select', 'none')
        } else {
          if (document.body.getAttribute('user-select')) {
            document.body.removeAttribute('user-select')
          }
        }
      }
    }
    Vue.prototype.$Navy = Navy
  }

  components.forEach(component => Vue.component(component.name, component))
  methods.forEach(method => Vue.use(method, config))
}