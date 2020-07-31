<template>
  <div id="ShowInfo">
    <h2 id="tokenCode">提取码</h2>
    <el-button type="primary" id="tokenCodebtn" @click="copyCode" plain>{{fileInfo.tokenCode}}</el-button>
    <h2>提取链接</h2>
    <el-button type="primary" id="tokenCodebtn" size="mini" @click="copyLink" plain>{{fileInfo.fileLink}}</el-button>
    <p id="hintDay">
      过期时间为{{fileInfo.dueDate.getFullYear()}}年{{fileInfo.dueDate.getMonth()+1}}月{{fileInfo.dueDate.getDate()}}日0点</p>
    <el-button id="backHomebtn" type="primary" @click="backHome">回到主页</el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {

    }
  },
  props: {
    fileInfo: {}
  },
  methods: {
    copyCode: function () {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.setAttribute('value', this.fileInfo.tokenCode)
      input.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      document.body.removeChild(input)

      const h = this.$createElement // * 后面用来实现弹窗提示
      this.$notify({
        title: 'GarlicSend',
        message: h('i', { style: 'color: teal' }, '复制成功')
      })
    },
    copyLink: function () {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.setAttribute('value', this.fileInfo.fileLink)
      input.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      document.body.removeChild(input)

      const h = this.$createElement // * 后面用来实现弹窗提示
      this.$notify({
        title: 'GarlicSend',
        message: h('i', { style: 'color: teal' }, '复制成功')
      })
    },
    backHome: function () {
      location.reload()
    }

  }
}
</script>

<style scoped>
  #backHomebtn{
    margin-bottom: 10px;
    margin-top: 0px;
  }

  #hintDay{
    font-weight: 700;
  }

  #tokenCode{
    margin-top: 0px;
  }

  .el-tag{
    margin-top: 50px;
  }
</style>
