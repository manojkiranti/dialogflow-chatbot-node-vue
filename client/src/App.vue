<template>
  <div id="app">
    <main-header />
    <div class="container">
      <chat-bot />
      <router-view />
    </div>
  </div>
</template>
<script>
import MainHeader from "@/components/layouts/Header";
import ChatBot from "@/components/chatbot/Chatbot";
import "vue-slick-carousel/dist/vue-slick-carousel.css";
import "vue-slick-carousel/dist/vue-slick-carousel-theme.css";
import "@/assets/scss/style.scss"
export default {
  components: {
    MainHeader,
    ChatBot,
  },
};
</script>