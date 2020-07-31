<template>
  <div>
    <h2>请输入密码</h2>
    <el-input v-model="PasswordInput" placeholder="输入密码" id="passwordInput" size="medium" maxlength=6 show-password>
    </el-input>
    <el-button type="success" icon="el-icon-check" circle @click="submitPassword"></el-button>
  </div>
</template>

<script>
import 'crypto-js'
const crypto = require('crypto-js')
var errorCounter = 0 // * 计算密码输入错误次数

export default {
  data () {
    return {
      PasswordInput: ''
    }
  },
  props: {
    fileInfo: {} // 传来的文件信息，包含盐值和加密后的密码
  },
  methods: {
    submitPassword: function () { // * 进行比对
      if (errorCounter >= 3) {
        this.$message.error('密码超过三次，返回首页')
        this.$router.push({ path: '/home' })
      }
      const passwordTrans = this.saltedHash(this.PasswordInput, this.fileInfo.salt)
      if (this.fileInfo.password === passwordTrans) {
        this.$message({
          message: '密码正确',
          type: 'success'
        })
        this.$emit('passwordSuccess')
      } else {
        if (errorCounter >= 3) {
          this.$message.error('密码超过三次，返回首页')
          this.$router.push({ path: '/' })
        } else {
          this.$message.error('密码错误，请重试')
          this.PasswordInput = ''
          errorCounter++
        }
      }
    },
    saltedHash: function (str, salt) {
      let hashes = str
      for (let i = 0; i < 9; i++) {
        hashes = hashes + salt
        hashes = crypto.SHA256(hashes).toString()
      }
      return hashes
    }
  }
}
</script>

<style scoped>
  h2{
    padding-top: 50px;
  }

  .el-input{
    height: 80px;
    width:150px;
    margin-right: 10px;
}
</style>
