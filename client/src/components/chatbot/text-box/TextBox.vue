<template>
    <div class="text-box card-panel card-panel-normal">
        <div class="text-content">
            <template v-for="(item, index) in textContent">
                <text-box-content :key="index" :textContent="item" />
            </template>
        </div>
    </div>
</template>
<script>
const { value } = require("pb-util");
import TextBoxContent from "./TextBoxContent";
export default {
    name: 'TextBox',
    props: {
        payload:{
            type: Object,
            default: () => {}
        }
    },
    components: {
        TextBoxContent
    },
     mounted() {
    this.getPayload();
  },
    data () {
        return {
            textContent: ''
        }
    },
    methods: {
        getPayload() {
            let textContent = value.decode(this.payload);
            this.textContent = textContent;
        }
    }
}
</script>