import { shallowMount, mount } from '@vue/test-utils'
import FileForm from '@/components/FileForm.vue'
import ShowInfo from '@/components/ShowInfo.vue'
import DownloadInfo from '@/components/DownloadInfo.vue'
import PasswordInput from '@/components/PasswordInput.vue'

describe('FileForm', () => {
  const wrapper = shallowMount(FileForm)
  it('completed show all the elements', () => {
    expect(wrapper.html()).toContain('<el-form-item label="下载次数限制">')
    expect(wrapper.html()).toContain('<el-form-item label="截止下载时间">')
    expect(wrapper.html()).toContain('<el-form-item label="截止下载时间">')
    expect(wrapper.html()).toContain('<el-form-item label="设置密码">')
    expect(wrapper.html()).toContain('<el-form-item label="文件描述">')
  })
  it('initialized correct functions', () => {
    expect(typeof FileForm.methods.onSubmitFile).toBe('function')
    expect(typeof FileForm.methods.refreshPage).toBe('function')
  })
  it('its functions return correct default data', () => {
    const defaultData = FileForm.data()
    expect(defaultData.hasPassword).toBe(false)
    expect(defaultData.form.limitDownloadTimes).toBe(10)
  })
  it('initialized the correct data in an istance', () => {
    expect(wrapper.vm.$data.form.limitDownloadTimes).toBe(10)
    expect(wrapper.vm.$data.hasPassword).toBe(false)
  })
  it('test refreshPage', () => {
    expect(wrapper.vm.refreshPage()).toBe(undefined)
  })
})

describe('ShowInfo', () => {
  it('initialized correct functions', () => {
    expect(typeof ShowInfo.methods.copyCode).toBe('function')
  })
})
it('sets the correct default data', () => {
  expect(typeof ShowInfo.data()).toBe('object')
})

describe('DownloadInfo', () => {
  it('sets the correct default data', () => {
    expect(typeof DownloadInfo.data()).toBe('object')
  })
  it('initialized correct DLIfunctions', () => {
    expect(typeof DownloadInfo.methods.DownloadClick).toBe('function')
  })
})

describe('PasswordInput', () => {
  const wrapper = mount(PasswordInput, {
    data () {
      return {
        PasswordInput: '123564'
      }
    }
  })
  it('renders counter html', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('set correct data', () => {
    expect(wrapper.vm.$data.PasswordInput).toBe('123564')
  })
  it('test saltedHash', () => {
    expect(wrapper.vm.saltedHash(1, 2) === 1).toBe(false)
  })
})
