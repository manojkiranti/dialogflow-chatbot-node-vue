<template>
    <div class="card-buttons">
        <template v-for="(item, index) in cardButtons">
            <a :href="item.postback" :key="index" v-if="item.isLink" target="_blank" class="card-btn">{{ item.text }}</a>
            <a :href="`tel:${item.postback}`" :key="index" v-else-if="item.isPhone" target="_blank" class="card-btn">{{ item.text }}</a>
            <a :key="index" @click.prevent="btnSelected(item.postback, item.text)" v-else class="card-btn">{{ item.text }}</a>
        </template>
    </div>
</template>
<script>
const {value} = require('pb-util');
export default {
    name: 'CardButtons',
    props: {
        btnList: {
            type: Object,
            default: () => {},
        },        
    },
 
    data() {
        return {
            cardButtons: []
        }
    },
    mounted() {
        this.setButtonValues();
    },
    methods: {
        setButtonValues() {
            let btnListing = value.decode(this.btnList);
            this.cardButtons = btnListing;
            this.cardButtons.forEach(element => {
                let isLink =
                element.postback.substring(0, 4) === "http";
                let isPhone =
                element.postback.substring(0, 4) === "+977";
                if(isLink) {
                    element.isLink = true;
                    element.isPhone = false;
                } else if(isPhone) {
                    element.isLink = false;
                    element.isPhone = true;
                } else {
                   element.isLink = false;
                   element.isPhone = false; 
                }
            });
        },
        btnSelected(postback, text){
            this.$emit('btnSelected', postback, text)
        },
    }
}
</script>