<template>
   <div id="mainContainer">
     <div id="blurdiv"></div>
     <div id="innerContainer">
        <div id="tokenCode" v-show="!isTokenCorrect&&hasTokenCode">
          <h2>请输入6位提取码</h2>
          <el-input v-model="tokenCode" placeholder="XXXXXX" id="tokenInput"
            size="medium" maxlength=6 ></el-input>
          <el-button type="success" icon="el-icon-check" circle @click="submitToken"></el-button>
        </div>
        <PasswordInput v-show="(isTokenCorrect||!hasTokenCode)&&(!isPasswordCorrect&&hasPassword)" :fileInfo="fileInfo"
         @passwordSuccess="passwordCorrect"></PasswordInput>
        <DownloadInfo v-show="(isTokenCorrect&&isPasswordCorrect)||(!hasTokenCode&&isPasswordCorrect)||(!hasTokenCode&&!hasPassword)||(isTokenCorrect&&!hasPassword)"
         :fileInfo="fileInfo" :downloadProgress="progress" @DownloadFile="downloadFile" ></DownloadInfo>
      </div>
   </div>
</template>

<script>
import Gun from 'gun'
import 'crypto-js'
import DownloadInfo from '../components/DownloadInfo'
import PasswordInput from '../components/PasswordInput'

require('gun/lib/not.js')
require('gun/lib/path.js')
require('gun/lib/radix.js')
require('gun/lib/radisk.js')
require('gun/lib/store.js')
require('gun/lib/rindexed.js')

const crypto = require('crypto-js')
const gun = Gun('http://123.57.255.60:8765/gun', { localStorage: false })
var _this
// 公用的固定盐
const salts = 'zjfdhwa8203eufdvjc8iuyjhwqoe9dsf8civujhfo9v8d7yh4jkr'

export default {
  name: 'DownloadPage',
  components: {
    DownloadInfo,
    PasswordInput
  },
  data () {
    return {
      tokenCode: '', // 提取码
      isTokenCorrect: false, // 提取码是否正确
      hasTokenCode: false, // 是否采用提取码
      hasPassword: false, // 是否有密码
      isPasswordCorrect: false, // 密码是否正确
      dueDateTemp: '',
      isPDF: false,
      isImage: false,
      isMP4: false,
      progress: 0,
      fileInfo: {
        name: '',
        fileHash: '',
        password: '',
        salt: '',
        dueDate: '',
        size: '',
        limitDownloadTimes: '',
        type: '',
        fileDescription: ''
      },
      fullscreenLoading: false
    }
  },
  created: function () {
    _this = this
  },
  mounted: function () {
    if (this.$route.fullPath === '/download') {
      this.hasTokenCode = true
      return // * 如果是采用提取码提取的，直接进入文件信息显示页面
    }
    // * 加载界面
    const loading = this.$loading({
      lock: true,
      text: '正在加载文件信息',
      spinner: 'el-icon-loading',
      background: 'rgba(0,0,0,1)'
    })
    // *超时提醒
    setTimeout(() => {
      if (_this.fileInfo.dueDate === undefined) {
        this.$confirm('加载超时, 是否继续等待?（部分大文件需加载较长时间）', 'Oops！', {
          confirmButtonText: '等待',
          cancelButtonText: '返回',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '请耐心等待'
          })
        }).catch(() => {
          this.$router.push({ path: '/' })
          this.$message({
            type: 'info',
            message: '返回首页'
          })
        })
      }
    }, 20000)
    // * 如果是采用链接提取的，开始取数据并进行是否符合条件的判断
    this.fileInfo.fileHash = this.$route.query.id
    gun.get('uploadfiles').get(this.fileInfo.fileHash).on(function (node) {
      _this.fileInfo.name = node.name
      _this.fileInfo.dueDate = node.dueDate
      _this.fileInfo.dueDateTemp = new Date(node.dueDate)
      _this.fileInfo.limitDownloadTimes = node.limitDownloadTimes
      _this.fileInfo.size = node.size
      _this.fileInfo.password = node.password
      _this.fileInfo.salt = node.salt
      _this.fileInfo.data = node.data
      _this.fileInfo.type = node.type
      _this.fileInfo.fileDescription = node.fileDescription
      if (_this.fileInfo.dueDate !== undefined) {
        if (_this.checkDueDate() === true && _this.checkDownloadTimes() === true) { // * 如果时间与下载次数的检查通过,开始加载文件
          if (_this.fileInfo.password !== '') { // * 如果有密码的话，改变密码状态，存入密码和盐值
            _this.hasPassword = true
          } else {
            _this.hasPassword = false
          }
          loading.close()
        }
        return 0
      }
    })
  },
  methods: {
    // * 使用提取码提取
    submitToken: function () { // * 如果输入提取码进行查找，先按照提取码转化哈希值
      _this.fileInfo.fileHash = _this.getIdByTokenCode(_this.tokenCode) // * 按照提取码转化成哈希值用于查找文件
      //* 没有此提取码报错
      let isTokenCodeExist = true
      gun.get('uploadfiles').get(_this.fileInfo.fileHash).once(function (key) {
        if (key === undefined) {
          isTokenCodeExist = false
          _this.tokenCode = ''
          _this.$message.warning('提取码不存在')
          _this.$router.push({ path: '/download' })
        }
      })
      setTimeout(() => {
        if (isTokenCodeExist === false) {
          location.reload()
        }
      }, 500)

      // *
      gun.get('uploadfiles').get(_this.fileInfo.fileHash).get('size').on(function (size) {
        if (size > 30) {
          _this.$alert('文件大小超过30M，可能会需要较长加载时间', '提示', {
            confirmButtonText: '确定'
          })
        }
      })
      const loading = this.$loading({
        lock: true,
        text: '正在加载文件信息。如长时间无反应可尝试刷新',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,1)'
      })
      setTimeout(() => { // *超时提醒
        if (_this.fileInfo.dueDate === '') {
          this.$confirm('加载超时, 是否继续等待?（部分大文件需加载较长时间, 也有可能是服务器的问题，你可以刷新或继续等待）', 'Oops！', {
            confirmButtonText: '等待',
            cancelButtonText: '返回',
            type: 'warning'
          }).then(() => {
            this.$message({
              type: 'success',
              message: '请耐心等待'
            })
          }).catch(() => {
            this.$router.push({ path: '/' })
            this.$message({
              type: 'info',
              message: '返回首页'
            })
          })
        }
      }, 20000)

      gun.get('uploadfiles').get(_this.fileInfo.fileHash).on(function (node) {
        _this.isTokenCorrect = true // ? 如果提取码正确,改变状态
        _this.fileInfo.name = node.name
        _this.fileInfo.dueDate = node.dueDate
        _this.fileInfo.dueDateTemp = new Date(node.dueDate)
        _this.fileInfo.limitDownloadTimes = node.limitDownloadTimes // !只设置一个下载次数，每下载一次都-1
        _this.fileInfo.size = node.size
        _this.fileInfo.password = node.password
        _this.fileInfo.salt = node.salt
        _this.fileInfo.data = node.data
        _this.fileInfo.type = node.type
        _this.fileInfo.fileDescription = node.fileDescription
        if (_this.fileInfo.dueDate !== undefined) { //! 如果已经赋值，就执行下面的
          loading.close() // !修改了loading关闭的位置，检测到信息获取就会停止
          if (_this.checkDueDate() === true && _this.checkDownloadTimes() === true) { // * 如果时间与下载次数的检查通过,开始加载文件
            if (_this.fileInfo.password !== '') { // * 如果有密码的话，改变密码状态，存入密码和盐值
              _this.hasPassword = true
            } else {
              _this.hasPassword = false
            }
          }
          return 0
        }
      })
    },

    // * 下载文件
    downloadFile: function () {
      if (_this.checkDownloadTimes() === false) { // * 下载前检查剩余下载次数
        return
      }
      var xhr = new XMLHttpRequest()
      xhr.open('GET', _this.fileInfo.data, true)
      xhr.responseType = 'blob'
      xhr.onprogress = function (event) {
        if (event.lengthComputable) {
          _this.progress = (event.loaded / event.total) * 100
        }
      }
      xhr.onload = () => {
        if (xhr.status === 200) {
          _this.saveAs(xhr.response, _this.fileInfo.name)
        }
      }
      xhr.send()
      gun.get('uploadfiles').get(_this.fileInfo.fileHash).get('limitDownloadTimes').put(_this.fileInfo.limitDownloadTimes - 1)
    },

    // * 检查截止日期是否符合要求
    checkDueDate: function () {
      const myDate = new Date().getTime()
      if (myDate > _this.fileInfo.dueDate) { // !这里的duedate是字符串型的，这个判断很可能不能用
        this.$alert('超过截止日期，即将返回首页', '时间超期', {
          confirmButtonText: '确定',
          type: 'warning',
          callback: action => {
            _this.$router.push({ path: '/' })
            this.$message({
              type: 'action',
              message: '返回首页'
            })
          }
        })
        return false
      }
      return true
    },

    // * 检查下载次数是否超额
    checkDownloadTimes: function () {
      if (_this.fileInfo.limitDownloadTimes <= 0) {
        this.$alert('超过限制下载次数，即将返回首页', '超过下载次数限制', {
          confirmButtonText: '确定',
          type: 'warning',
          callback: action => {
            _this.$router.push({ path: '/' })
            this.$message({
              type: 'action',
              message: '返回首页'
            })
          }
        })
        return false
      }
      return true
    },

    // * 保存文件
    saveAs: function (data, name) {
      var urlObject = window.URL || window.webkitURL || window
      var exportBlob = new Blob([data])
      var saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      saveLink.href = urlObject.createObjectURL(exportBlob)
      saveLink.download = name
      saveLink.click()
    },

    // * 子组件返回的密码正确
    passwordCorrect: function () { // * 密码输入正确
      _this.isPasswordCorrect = true
    },

    // * 由id获取提取码
    getIdByTokenCode: function (tokenCode) {
      return crypto.MD5(crypto.SHA256(tokenCode + tokenCode + salts).toString()).toString()
    }
  }
}
</script>

<style scoped>
  h2 {
    padding-top: 50px;
  }

  .el-input {
    margin-right: 10px;
    height: 80px;
    width: 89px;
  }

  .PDFReview {
    position: absolute;
  }

    #tokenCode {
    margin-left: auto;
    margin-right: auto;
    width: 60%;
    background-color: rgba(168, 208, 230, 0.9);
    border-radius: 15px;
    box-shadow: 8px 8px 12px 2px rgba(0, 0, 0, 0.2);
  }

  #mainContainer {
    margin-left: auto;
    margin-right: auto;
    background: inherit;
    width: 30%;
    border-radius: 15px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  #blurdiv {
    width: 100%;
    height: 650px;
    background: inherit;
    -webkit-filter: blur(15px);
    -moz-filter: blur(15px);
    -ms-filter: blur(15px);
    -o-filter: blur(15px);
    filter: blur(15px);
    filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=4, MakeShadow=false);
  }

  #innerContainer {
    position: relative;
    margin-top: -600px;
    padding-bottom: 20px;
  }
</style>
