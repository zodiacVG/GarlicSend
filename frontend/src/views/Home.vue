<template>
  <div id="mainContainer">
    <div id="blurdiv"></div>
    <div id="innerContainer">
      <div id="beautyInput" v-show="!isSelected&&!isUploaded">
        <p id="inputText">发送文件</p>
        <input type="file" id='selectFileile' @change="selectFile" multiple=true v-show="!isUploaded">
      </div>
      <div id="downloadBtn" v-show="!isSelected&&!isUploaded" @click="jumptoDownload">
        <p id="downloadText">接收文件</p>
      </div>
      <i class="el-icon-folder-checked" v-show="isSelected&&!isUploaded"></i>
      <p id="fileName" v-show="isSelected&&!isUploaded">{{file.name}}</p>
      <br>
      <div class="demo-image__preview">
        <el-image id="imagesShow" :class="isSelected ? 'thumb' :'nothumb'" :src="url"
          :preview-src-list="srcList" v-show="isJpeg" style="padding-top:7px">
        </el-image>
        <div id="PDFShow" v-show="isSelected&&!isUploaded&&isPDF">
          <PDFReview id="PDFReview" :class="clickReviewPDF? 'PDFShow' : 'noPDFShow'" :fileInfo="file"
            @afterClickReviewPDF="changePDFReviewSize"></PDFReview>
        </div>
        <p id="fileSize" v-show="isSelected">文件大小： {{file.size}}M</p>
        <FileForm @FileFormSumbmit='submitFileForm' id="fileForm" v-show="isSelected"></FileForm>
      </div>
      <div>
        <ShowInfo :fileInfo="file" v-show="isUploaded" id="ShowInfo"></ShowInfo>
      </div>
    </div>
  </div>
</template>

<script>
import Gun from 'gun'
import 'crypto-js'
import BMF from 'browser-md5-file'
import FileForm from '../components/FileForm'
import ShowInfo from '../components/ShowInfo'
import PDFReview from '../components/PDFReview'

require('gun/lib/not.js')
require('gun/lib/path.js')
require('gun/lib/radix.js')
require('gun/lib/radisk.js')
require('gun/lib/store.js')
require('gun/lib/rindexed.js')

const gun = Gun('http://123.57.255.60:8765/gun', { localStorage: false })
const crypto = require('crypto-js')
const bmf = new BMF()

var _this = {}
const digit = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const salts = 'zjfdhwa8203eufdvjc8iuyjhwqoe9dsf8civujhfo9v8d7yh4jkr'
for (let i = 10; i <= 35; i++) {
  digit[i] = String.fromCharCode(i + 55)
  digit[i + 26] = String.fromCharCode(i + 87)
}
// 公用的固定盐,用于提取码生成
export default {
  components: {
    FileForm,
    ShowInfo,
    PDFReview
  },
  data () {
    return {
      isSelected: false,
      isUploaded: false,
      showCode: false,
      isPDF: false,
      isJpeg: false,
      isMP4: false,
      clickReviewPDF: false,
      url: '', // *图片展示所用url,并非文件的
      srcList: ['https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg'],
      file: {
        fileLink: '',
        fileHash: '',
        data: '',
        name: '',
        size: '',
        type: '',
        date: '',
        limitDownloadTimes: 20,
        dueDate: '',
        fileDescription: '',
        password: '',
        tokenCode: '',
        salt: '' // 盐
      }
    }
  },
  beforeCreate () {
    _this = this
  },
  mounted: function () {
    gun.get('count').not(function (key) {
      gun.get('count').put({
        num: 0
      })
    })
  },
  methods: {
    // * 从电脑选择文件
    selectFile: function () {
      const loading2 = this.$loading({
        lock: true,
        text: '正在导入',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,1)'
      })

      var reader = new FileReader()
      const uploader = document.querySelector('#selectFileile')
      _this.file.tokenCode = _this.getTokenCode() // * 与文件无关，根据公共盐值和数据库中数据生成提取码
      _this.file.fileHash = _this.getIdByFC(_this.file.tokenCode) // * 根据提取码获取到id
      const file = uploader.files[0]
      if (file) {
        const fileDataURL = reader.readAsDataURL(file)
        console.log(fileDataURL) // ! 此console是为了应对eslint，非代码风格问题
        const myDate = new Date()
        const dateString = myDate.toString()
        _this.file.name = file.name
        _this.file.size = (file.size / (1024 * 1024)).toFixed(2)
        _this.file.type = file.type
        _this.file.date = dateString
      }
      reader.onload = function () {
        _this.file.data = reader.result
        _this.isSelected = true
        loading2.close()
        _this.$options.methods.showImage() //* 展示文件信息
      }
      _this.bigFileAllert()
      _this.file.fileLink = 'http://localhost:8080/#/download?id=' + _this.file.fileHash
      _this.typeJudge()
    },
    // * 收到子组件传来的文件信息表单，准备上传
    submitFileForm: function (result) {
      const loading = this.$loading({
        lock: true,
        text: '正在上传',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,1)'
      })
      _this.file.dueDate = result.dueDate // 单独记录此项用于后面下载信息的展示
      if (result.password !== '') {
        _this.file.salt = _this.getSalt() // 若有密码，存储盐值
        _this.file.password = _this.saltedHash(result.password, _this.file.salt)
      }
      const dueDateSeconds = result.dueDate.getTime()
      gun.get('uploadfiles').get(_this.file.fileHash).put({
        data: _this.file.data,
        name: _this.file.name,
        size: _this.file.size,
        type: _this.file.type,
        date: _this.file.date,
        salt: _this.file.salt,
        tokenCode: _this.file.tokenCode,
        limitDownloadTimes: result.limitDownloadTimes,
        dueDate: dueDateSeconds,
        fileDescription: result.fileDescription,
        password: _this.file.password
      })
      gun.get('uploadfiles').get(_this.file.fileHash).once(function (node) {
        if (node.dueDate !== undefined) {
          loading.close()
        }
        _this.isSelected = false
        _this.isUploaded = true
      })
    },

    // * 提供图片url
    showImage: function () {
      _this.url = _this.file.data
      _this.srcList[0] = _this.file.data
    },

    // salted hash函数，迭代9次
    saltedHash: function (str, salt) {
      let hashes = str
      for (let i = 0; i < 9; i++) {
        hashes = hashes + salt
        hashes = crypto.SHA256(hashes).toString()
      }
      return hashes
    },

    // 生成一个长度为9的由数字和字母组成的随机序列作为salt值
    getSalt: function () {
      const arr = new Array(9)
      for (let i = 0; i < 9; i++) {
        const char = Math.floor(Math.random() * 62)
        arr[i] = digit[char]
      }
      return arr.join('')
    },

    // fileList是由输入的文件对象组成的数组
    getId: function (fileList) {
      const len = fileList.length
      let str = ''
      for (let i = 0; i < len; i++) {
        bmf.md5(
          fileList[i],
          (err, md5) => {
            if (err) {
              return console.error(err)
            }
            str = str + md5.toString()
          }
        )
      }
      const salt = this.getSalt()
      let hashes = this.saltedHash(str, salt)
      hashes = crypto.MD5(hashes).toString()
      return hashes
    },

    // BKDR哈希函数，用以将字符串哈希为一个不大于2147483647的十进制整数
    BKDRHash: function (str) {
      const sup = 0x7FFFFFFF
      let hashes = 0
      for (let i = 0; i < str.length; i++) {
        hashes = (hashes << 7) + (hashes << 2) - hashes + str[i].charCodeAt()
        if (hashes > sup) {
          hashes %= sup
        }
      }
      return (hashes & sup)
    },

    // * 生成提取码
    getTokenCode: function () {
      const _this = this
      let count = 0
      const date = new Date()
      const hour = date.getHours().toString()
      const minutes = date.getMinutes().toString()
      let day = date.getDate().toString()
      day = day[day.length - 1]
      const proto = day + hour + minutes
      let fetchCode = ''
      gun.get('count').once(function (node) {
        count = parseInt(node.num)
        let next = count + 1
        if (next > 99999) {
          next = 0
        }
        gun.get('count').get('num').put(next)
        fetchCode = Math.floor(Math.random() * 5) + count.toString() + proto
        fetchCode = _this.converseNumberBase(fetchCode, 61)
        while (fetchCode.length < 6) {
          fetchCode += 'z'
        }
        fetchCode = _this.reConsist(fetchCode)
      })

      return fetchCode
    },

    // * 判断文件类型，显示不同预览界面
    typeJudge: function () {
      switch (this.file.type) {
        case 'application/pdf':
          _this.isPDF = true
          break
        case 'image/jpeg':
          _this.isJpeg = true
          break
        case 'video/mp4':
          _this.isMP4 = true
          break
      }
    },

    // * 上传大文件时弹出警告
    bigFileAllert: function () {
      if (_this.file.size > 30) {
        this.$alert('注意到你想要上传大于30M的文件，你可以继续上传，但是部分页面可能会出现卡顿的情况，甚至上传失败，请谅解！', '提示', {
          confirmButtonText: '确定',
          type: 'warning'
        })
      }
    },

    // * 改变PDF预览区域的大小
    changePDFReviewSize: function () {
      _this.clickReviewPDF = true
    },
    // * 跳转到下载界面
    jumptoDownload: function () {
      this.$router.push({ path: '/download' })
    },

    // * 以下为密码/id相关
    // * 输入提取码，返回分享事件的id
    getIdByFC: function (fetchCode) {
      return crypto.MD5(crypto.SHA256(fetchCode + fetchCode + salts).toString()).toString()
    },

    // * 将p(小于61)进制数转换为十进制数
    converseNumberBaseToTen: function (num, p) {
      num = num.toString()
      p = parseInt(p)
      let sum = 0
      for (let i = 0; i < num.length; i++) {
        let digit = -1
        const ascii = num[i].charCodeAt()
        if (ascii >= 65 && ascii <= 90) {
          digit = ascii - 55
        } else if (ascii >= 48 && ascii <= 57) {
          digit = ascii - 48
        } else if (ascii >= 97 && ascii <= 121) {
          digit = ascii - 61
        }
        if (digit >= 0) {
          sum = sum * p + digit
        }
      }
      return sum.toString()
    },

    // * 将十进制整数num转换成p进制数
    converseNumberBase: function (num, p) {
      num = parseInt(num)
      p = parseInt(p)
      let result = ''
      while (num) {
        const remainder = num % p
        num = Math.floor(num / p)
        result += digit[remainder].toString()
      }
      result = result.split('').reverse().join('')
      return result
    },

    // * 将字符串按特定顺序重新排列
    reConsist: function (fetchCode) {
      let str = ''
      str += fetchCode[3]
      str += fetchCode[4]
      str += fetchCode[0]
      str += fetchCode[5]
      str += fetchCode[2]
      str += fetchCode[1]
      return str
    }
  }
}
</script>

<style>
 .PDFShow {
  width: 90%;
  height: 230px;
  overflow: auto;
  box-shadow: 15px 15px 15px 0 rgba(0, 0, 0, 0.1);
}

.noPDFShow {
  height: 70px;
}

#imagesShow{
  width: 100px;
  height: 100px;
}

#inputText {
  padding-top: 10px;
  font-size: 30px;
  font-weight: 600;
}

#downloadText {
  padding-top: 10px;
  font-size: 30px;
  font-weight: 600;
}

#fileForm {
  margin-left: auto;
  margin-right: auto;
  padding-top: 25px;
  padding-bottom: 20px;
  width: 80%;
  background-color: rgba(168, 208, 230, 0.9);
  border-radius: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

#ShowInfo {
  padding-bottom: 60px;
}

#mainContainer {
  margin-left: auto;
  margin-right: auto;
  background: inherit;
  width: 30%;
  min-width: 450px;
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
  filter: blur(30px);
  filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=4, MakeShadow=false);
}

#innerContainer {
  margin-top: -620px;
  padding-bottom: 20px;
  position: relative;
}

#beautyInput {
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  width: 60%;
  background-color: #87CEFA;
  border-radius: 45px;
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
  height: 60px;
}

#downloadBtn {
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  height: 60px;
  width: 60%;
  background-color: rgba(240, 230, 140, 0.8);
  border-radius: 45px;
  box-shadow: 5px 5px 15px 0 rgba(0, 0, 0, 0.1);
}

#beautyInput:hover {
  cursor: pointer;
  background-color: #1E90FF;
}

#downloadBtn:hover {
  cursor: pointer;
  background-color: #FFD700;
}

#selectFileile {
  position: absolute;
  top: 0;
  left: 0;
  height: 60px;
  width: 500px;
  background-color: #DDBF7A;
  border-radius: 45px;
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
  opacity: 0;

}

#fileSize {
  margin-top: 10px;
}

#fileName {
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 20px;
}

.el-icon-folder-checked {
  color: #F0E68C;
  font-size: 50px;
  font-weight: 600;
}

.nothumb {
  display: none;
}

.thumb {
  /* margin-top: 20px; */
}

</style>
