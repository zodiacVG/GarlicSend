<template>
  <div id="mainContainerComppnents">
    <el-form ref="form" :model="form" label-width="140px">
      <el-form-item label="下载次数限制">
        <el-col id="numberSelect" :span=15>
          <el-input-number v-model="form.limitDownloadTimes" size="medium" :step="5" min=1 max=100 style="width:105%"></el-input-number>
        </el-col>
      </el-form-item>
      <el-form-item label="截止下载时间">
        <el-col :span=16>
          <el-date-picker id="datePicker" type="date" size="medium" placeholder="选择日期" v-model="form.dueDate" @change="pickDate">
          </el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="设置密码">
        <el-col :span=1>
          <el-switch v-model="hasPassword"></el-switch>
        </el-col>
      </el-form-item>
      <el-form-item label="密码" prop="pass" v-show="hasPassword">
        <el-col :span=18>
          <el-input type="password" v-model="form.password" size="medium" autocomplete="off" placeholder="最多6位密码" maxlength=6>
          </el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="文件描述">
        <el-col :span=18>
          <el-input id="descriptionInput" type="textarea" autosize v-model="form.fileDescription" placeholder="选填，最多20字符"
            maxlength=20></el-input>
        </el-col>
      </el-form-item>
      <el-row :justify="center">
        <el-col>
          <el-button type="primary" @click="onSubmitFile" round id="uploadbtn">上传</el-button>
          <el-button type="info" @click="refreshPage" round>取消</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      hasPassword: false,
      form: {
        limitDownloadTimes: 10,
        dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 截止时间选择器默认为7天
        fileDescription: '', // 文件描述
        password: ''
      }
    }
  },
  methods: {
    pickDate () {
      const myDate = new Date()
      if (myDate.getTime() + 7 * 24 * 60 * 60 * 1000 < this.form.dueDate.getTime()) { // 若超过七天将日期重设为七天
        this.$alert('请将截止日期设置在7天之内', '错误', {
          type: 'warning',
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'warning',
              message: '已将截止日期重设为7天'
            })
          }
        })
        this.form.dueDate = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    },
    onSubmitFile () {
      this.$emit('FileFormSumbmit', this.form)
    },
    refreshPage () {
      location.reload()
    }
  }
}
</script>

<style>
  #datePicker{
    width:75%;
  }

  #descriptionInput{
    width: 100%;
  }

  #numberSelect{
    width: 70%;
  }
</style>
