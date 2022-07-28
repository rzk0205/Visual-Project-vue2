<template>
  <div class="com-page">
    <Seller></Seller>
  </div>
</template>
<script>
export default {
  name: 'SellerPage',
  data() {
    return {}
  },
  methods: {},
  components: {
    Seller: () => import('../components/Seller.vue')
  },
  created() {}
}
</script>
<style lang="scss" scoped></style>
