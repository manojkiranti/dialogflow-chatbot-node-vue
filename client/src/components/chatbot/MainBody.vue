<template>
  <div class="chat-info-content">
    <div class="chat-info-heading" v-if="!hideChatInfoHeader">
      <h6>How can I help you today?</h6>
      <p>Get started by asking</p>
    </div>
    <div class="btn-wrappers">
      <a class="chat-btn" :class="{'hot':btn.hot}" v-for="(btn, index) in quickBtns" :key="index" @click.prevent="initialBtnClick(btn.payload, btn.title)">
        {{ btn.title }}
      </a>
    </div>
  </div>
</template>
<script> 
export default {
  name: "MainBody",
  props: {
    hideChatInfoHeader: { 
      type: Boolean,
      default: false 
    } 
  },
  data() {
    return {
      quickBtns: [],
    };
  },
  mounted() {
    this.getQuickBtns();
  },
  methods: {
    getQuickBtns() {
      let btns = [
        
        {
          title: "Apply Online",
          payload: 'apply_online',
          hot: true,
        },
        {
          title: "Account & Deposits",
          payload: 'account_deposits',
          hot: false,
        },
         {
          title: "Cards",
          payload: 'card_types',
          hot: false,
        },
        {
          title: "Internet Banking",
          payload: 'Internet Banking',
          hot: false,
        },
        
        {
          title: "Mobile Banking",
          payload: 'mobile_banking',
          hot: false,
        },
        {
          title: "Ways To Bank",
          payload: 'Ways To Bank',
          hot: false,
        },
        {
          title: "Other Services",
          payload: 'Other Services',
          hot: false,
        },

        // Custom
        {
          title: "Locate Branch",
          payload: "locate-branch"
        },
        {
          title: "Locate ATM",
          payload: "locate-atm"
        }
      ];
      this.quickBtns = btns;
    },
    initialBtnClick(payload, text) {
      this.$emit('initialBtnClick',payload, text )
    }
  },
};
</script>
