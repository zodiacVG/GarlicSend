<template>
  <div>
    <pdf id="PDFReview" v-for="i in numPages" :key="i" :src="src" :page="i"></pdf>
    <el-button type="primary" @click="showPDF">预览PDF文件</el-button>
  </div>
</template>

<script>
import pdf from 'vue-pdf'

export default {
  components: {
    pdf
  },
  data () {
    return {
      src: '',
      numPages: undefined,
      isClicked: false
    }
  },
  props: {
    fileInfo: {}
  },
  methods: {
    showPDF: function () {
      this.isClicked = true
      var loadingTask = pdf.createLoadingTask(this.fileInfo.data)
      this.src = loadingTask
      this.src.promise.then(pdf => {
        this.numPages = pdf.numPages
      })
      this.$emit('afterClickReviewPDF')
    }
  }
}
</script>

<style scoped>
  #PDFReview{
    display: inline-block;
    /* width: 100% */
  }
</style>
