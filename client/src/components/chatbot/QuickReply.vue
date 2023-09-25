<template>
  <div v-if="reply.structValue.fields.payload" class="btn-list">
    <a
      href="/"
      class="chat-btn"
      @click.prevent="replyBtnClicked($event, reply.structValue.fields.payload.stringValue, reply.structValue.fields.text.stringValue)"
    >
      {{ reply.structValue.fields.text.stringValue }}
    </a>
  </div>
  <div v-else class="btn-list">
    <a
      :href="reply.structValue.fields.link.stringValue"
      class="chat-btn"
      target="_blank"
    >
      {{ reply.structValue.fields.text.stringValue }}
    </a>
  </div>
</template>
<script>
export default {
  name: "QuickReply",
  props: {
    reply: {
      type: Object,
      default: () => {}
    },
  },
  methods: {
    replyBtnClicked(event, payload, text) {
        this.$emit('replyClick', event, payload, text )
    },
  },
};
</script>
