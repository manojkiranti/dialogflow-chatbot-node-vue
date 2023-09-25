<template>
  <div class="chat-box-header">
    <div class="main-chat-header">
      <div class="header-aside-left">
        <span class="sathi-icon">
          <img src="@/assets/images/genie.png" alt="" />
        </span>
        <span class="icon-title">
          ASK GENIE
        </span>
      </div>
      <div class="header-icon-wrap">
        <span class="header-icon">
          <i class="material-icons">
            notifications
          </i>
        </span>
        <span class="header-icon">
          <i class="material-icons">
            call_received
          </i>
        </span>
        <span class="header-icon chat-box-toggle" @click="closeChat"><i class="material-icons">close</i></span>
      </div>
    </div>

    <div class="chat-heading-content">
      <h1>HI !</h1>
      <p>
        This is GENIE, your personal digital assistant for anything and
        everything related to Genie Bank
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "Header",
  data() {
    return {};
  },
  methods: {
    closeChat() {
      this.$emit('closeChat')
    }
  }
};
</script>
