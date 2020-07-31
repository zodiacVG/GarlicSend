
<template>
  <div id="app">
    <div class="note" :style="note">
      <div id="nav">
        <h1>GarlicSend</h1>
        <h3 id="littleTitle">Powered by Gun</h3>
        <router-link to="/" class="tab">发送 </router-link>
        <router-link to="/download" class="tab">接收</router-link>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      note: {
        backgroundAttachment: 'fixed',
        backgroundImage: 'url(' + require('./assets/bk6.jpg') + ')',
        backgroundPosition: 'center center',
        backgroundRepeat: 'repeat',
        backgroundSize: '100% 100%'
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Red+Rose:wght@700&display=swap');
h1{
  color: azure;
  font-size: 70px;
  font-family:'Red Rose', cursive;
}

#littleTitle{
  color: azure;
  font-size: 20px;
  font-family:'Red Rose', cursive;
  margin-top: -50px;
  margin-bottom: 40px;
}
#app {
  height: 1080px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-size: 20px;
  font-weight: bold;
  color:#f1f2f6;

}

#nav a.router-link-exact-active {
  color: #374785;
}

#taber{
  background-color: rgba(248,233,161,1);
  margin-left: auto;
  margin-right: auto;
  width: 170px;
  height: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.note{
  height: 1080px;
}
</style>
