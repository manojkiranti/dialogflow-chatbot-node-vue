<template>
  <div class="col s12 m8 offset-m2 16 offset-13">
    <div class="card-panel card-panel-normal">
      <!-- <div class="row valign-wrapper">
        <a class="btn-floating btn-large waves-effect waves-light red"
          ><i class="material-icons">{{ speaks }}</i></a
        >
      </div> -->
      <div id="quick-replies" class="col s10 quick-replies">
        <template v-if="text && text.stringValue">
          <div class="msg msg-default">
             <p>{{ text.stringValue }}</p>
          </div>
        </template>
        <template v-if="payload">
          <template v-for="(reply, index) in payload">
            <QuickReply @replyClick="replyClick" :reply="reply" :key="index" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import QuickReply from "./QuickReply";
export default {
  name: "QuickReplies",
  components: {
    QuickReply,
  },
  props: {
    payload: {
      type: Array,
      default: () => []
    },
    text: {},
    speaks: {
      type: String,
      default: "Bot",
    },
  },
  methods: {
    replyClick(event, payload, text) {
       this.$emit('replyClick', event, payload, text )
    },
  },
};
</script>
