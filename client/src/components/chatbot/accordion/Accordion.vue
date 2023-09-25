<template>
  <div class="accordion card-panel card-panel-normal">
    <vsa-list>
      <!-- Here you can use v-for to loop through items  -->
      <vsa-item v-for="(item, index) in contentList" :key="index">
        <vsa-heading>
          {{item.header}}
        </vsa-heading>

        <vsa-content>
           <div class="accordion-content " v-html="item.description"></div>
        </vsa-content>
      </vsa-item>
    </vsa-list>
  </div>
</template>
<script>
const { value } = require("pb-util");
export default {
  name: "Accordion",
  props: {
    payload: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      contentList: [],
    };
  },
  mounted() {
    this.getPayload();
  },
  methods: {
    getPayload() {
      let contentList = value.decode(this.payload);
      this.contentList = contentList;
    },
  },
};
</script>
