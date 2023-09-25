<template>
    <div class="text-box-content">
        <div class="text-wrap" v-html="textContent.text">
        </div>
    </div>
</template>
<script>
export default {
    name: 'TextBoxContent',
    props:{
        textContent: {
            type: Object,
            default: () => {}
        }
    }
}
</script>