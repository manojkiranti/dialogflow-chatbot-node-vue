<template>
  <div class="card-web">
    <div class="card">
      <div class="card-image" v-if="payload.fields.image">
        
        <img
          :alt="payload.fields.header.stringValue"
          :src="payload.fields.image.stringValue"
        />
        
      </div>
      <div class="card-content">
        <h6 class="card-heading" v-line-clamp:20="2" :title="payload.fields.header.stringValue">
          {{ payload.fields.header.stringValue }}
        </h6>
        <p :title="payload.fields.description.stringValue" v-line-clamp:20="2">
          {{ payload.fields.description.stringValue }}
        </p>
      </div>
      <div class="card-action">
        <card-buttons :btnList="payload.fields.buttons" @btnSelected="btnSelected" />
        <!-- <a :href="payload.fields.link.stringValue" target="_blank">Get Now</a> -->
      </div>
    </div>
  </div>
</template>

<script>
import CardButtons from './CardButtons';
export default {
  name: "Card",
  props: {
    payload: {
      type: Object,
    },
  },
  components: {
    CardButtons
  },
  data () {
    return {
      buttonType: true
    }
  },
  methods: {
    btnSelected(postback, text){
      this.$emit('btnSelected', postback, text)
    }
  }
};
</script>
