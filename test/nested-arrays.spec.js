import 'regenerator-runtime/runtime'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/lib/components/index.mjs'
import * as directives from 'vuetify/lib/directives/index.mjs'
import { mount } from '@vue/test-utils'
import VJsf from '../lib/VJsfNoDeps.js'

// OUW-4905: datastream with arrays of objects nested in arrays of objects, whose existing items
// lack an array property (postalCodes). Rendering it used to freeze the browser.
const KEY = 'provision.onfieldDeployments.fa.location'
const schema = {
  type: 'object',
  properties: {
    [KEY]: {
      type: 'array',
      title: 'Countries',
      items: {
        type: 'object',
        title: 'Countries',
        properties: {
          name: { type: 'string', title: 'Country name' },
          regions: {
            type: 'array',
            title: 'Regions',
            items: {
              type: 'object',
              title: 'Region',
              properties: {
                name: { type: 'string', title: 'Region name' },
                provinces: {
                  type: 'array',
                  title: 'Provinces',
                  items: {
                    type: 'object',
                    title: 'Province',
                    properties: {
                      name: { type: 'string', title: 'Province name' },
                      postalCodes: { type: 'array', title: 'Postal codes', items: { type: 'string', title: 'Postal code' } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

test('renders existing nested arrays of objects without re-emitting the model', async () => {
  const value = require('./fixtures-ouw4905.json')
  const emits = []
  const errors = []
  const vuetify = createVuetify({ components, directives })
  const wrapper = mount({
    components: { VJsf },
    data: () => ({ model: { [KEY]: JSON.parse(JSON.stringify(value)) }, schema, options: {} }),
    methods: { onUpdate(v) { emits.push(v); this.model = v } },
    template: '<v-jsf :model-value="model" @update:model-value="onUpdate" :schema="schema" :options="options" />'
  }, {
    global: {
      plugins: [vuetify],
      provide: { theme: {} },
      config: { errorHandler: e => errors.push(String(e)) }
    }
  })

  await wait(500)
  const html = wrapper.html()
  await wait(300)
  expect(errors).toEqual([])
  expect(emits).toEqual([])
  expect(wrapper.vm.model[KEY]).toEqual(value)
  expect(wrapper.html()).toBe(html)
  expect(html).toContain('Balearics')
  expect(html).toContain('Zaragoza')
}, 20000)
