<template>
  <div class="col s12 m8 offset-m2 offset-12">
    <div class="chat-msg-item-wrap">
      <div class="row valign-wrapper m-0">
        <div class="col w-60" v-if="speaks === 'bot'">
          <div class="chat-avatar">
            <img src="@/assets/images/genie.png" alt="" />
          </div>
        </div>
        <div class="col pl-0" v-if="speaks === 'bot'">
          <span class="msg msg-default">
            {{ text[0] }}
          </span>
        </div>
        <div class="col s12" v-if="speaks === 'me'">
          <span class="msg msg-receive">
            {{ text }}
          </span>
        </div>
        <!-- <div class="col s2" v-if="speaks === 'me'">
          <a class="btn-floating btn-large waves-effect waves-light red"
            ><i class="material-icons">{{ speaks }}</i></a
          >
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Message",
  props: {
    text: {
      default: "Hello",
    },
    speaks: {
      type: String,
      default: "Speaks",
    },
  },
};
</script>
