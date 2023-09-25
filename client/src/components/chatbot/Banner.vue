<template>
  <div class="chat-banner">
    <div class="chat-banner-wrapper">
      <VueSlickCarousel v-bind="settings">
        <div class="banner-image" :style="bannerList.bannerImg1">
          <div class="banner-overlay-text">
            <h6>Genie Banking</h6>
            <a href="#" class="slider-btn">Know More</a>
          </div>
        </div>
        <div class="banner-image" :style="bannerList.bannerImg2">
          <div class="banner-overlay-text">
            <h6>Online Payment</h6>
            <a href="#" class="slider-btn">Know More</a>
          </div>
        </div>

      </VueSlickCarousel>
    </div>
  </div>
</template>
<script>
import VueSlickCarousel from "vue-slick-carousel";
export default {
  name: "Banner",
  components: {
    VueSlickCarousel,
  },
  data() {
    return {
      settings: {
        edgeFriction: 0.35,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
      },
      bannerList: {
        bannerImg1: {
          backgroundImage: `url(${require('@/assets/images/banner-1.jpg')})`
        },
        bannerImg2: {
          backgroundImage: `url(${require('@/assets/images/banner-2.jpg')})`
        }
      }
    };
  },
};
</script>
