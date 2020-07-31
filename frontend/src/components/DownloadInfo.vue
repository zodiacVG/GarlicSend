<template>
  <div>
    <h4 id="titleText">{{fileInfo.name}}</h4>
    <el-image id="imageReview" :src="fileInfo.data" :preview-src-list="[fileInfo.data]"
      v-show="fileInfo.type === 'image/jpeg'">
    </el-image>
    <audio :src="fileInfo.data" v-show="fileInfo.type === 'audio/mpeg'" controls></audio>
    <div id="videoShow" v-show="fileInfo.type === 'video/mp4'">
      <video id="myVideo" controls>
        <source :src="fileInfo.data" type="video/mp4">
      </video>
    </div>
    <el-card id="cardShow" shadow="hover">
    <el-row id="downloadTimes" justify="center" type="flex">
      <el-col :span=15>
        <h3 class="infoText">剩余下载次数: {{fileInfo.limitDownloadTimes}}</h3>
      </el-col>
    </el-row>
    <el-row id="dueDateShow" justify="center" type="flex">
      <el-col :span=25>
        <h3 class="infoText">
          过期时间：{{fileInfo.dueDateTemp.getFullYear()}}年{{fileInfo.dueDateTemp.getMonth()+1}}月{{fileInfo.dueDateTemp.getDate()}}
          日0点</h3>
      </el-col>
    </el-row>
    <el-row id="fileSize" justify="center" type="flex">
      <el-col :span=15>
        <h4>文件大小：{{fileInfo.size}}M</h4>
      </el-col>
    </el-row>
    <el-row justify="center" type="flex" v-show="fileInfo.fileDescription !== ''">
      <el-col :span=15>
        <p id="fileDescription">文件描述：{{fileInfo.fileDescription}}</p>
      </el-col>
    </el-row>
    <el-button @click="DownloadClick" type="success">下载 <i class="el-icon-download"></i></el-button>
    </el-card>
    <el-progress id="progressLine" :text-inside="true" :stroke-width="26" :percentage="downloadProgress" v-show="downloadProgress !== 0">
    </el-progress>
    <PDFReview id="DownloadPDFReview" :fileInfo="fileInfo" v-show="fileInfo.type === 'application/pdf'"></PDFReview>
  </div>
</template>

<script>
import PDFReview from '../components/PDFReview'

export default {
  name: 'DownloadInfo',
  components: {
    PDFReview
  },
  data () {
    return {
      date: '',
      url: '',
      srcList: []
    }
  },
  props: {
    fileInfo: {},
    downloadProgress: Number
  },
  methods: {
    DownloadClick () {
      this.$emit('DownloadFile')
    }
  }
}
</script>

<style>
  audio {
    margin-top: 20px;
  }

  .el-progress {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 20px;
    width: 80%;
  }

  .videoReview {
    width: 100%;
  }

  .infoText {
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  }

  .el-image {
    padding-top: 30px;
  }

  .el-button {
    margin-bottom: 20px;
  }

  #imageReview {
    width: 100px;
    height: 100px
  }

  #downloadTimes {
    height: 30px;
  }

  #dueDateShow {
    height: 30px;
  }

  #fizeSize {
    margin-bottom: 10px;
  }

  #DownloadPDFReview {
    overflow: auto;
    height: 300px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
  }

  #progressLine{
    margin-top: 10px;
  }

  #titleText {
    margin-top: 0;
    margin-bottom: 0;
  }

  #fileDescription {
    margin-top: -10px;
  }

  #Infobtn {
    display: block;
    width: 100px;
  }

  #myVideo{
    margin-top: 10px;
    width: 70%;
    height: 150px;
  }

  #cardShow{
    margin-top: 10px;
    width: 80%;
    margin-left: auto;
    margin-right: auto;
    border-radius: 15px;
    background-color: rgba(168, 208, 230, 0.9);
    border: 0px;
  }

</style>
