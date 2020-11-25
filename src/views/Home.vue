<template>
  <div class="home">
    <PR />
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/about">About</router-link></li>
      <li><router-link to="/castle">戦型・戦法・囲い等タグ</router-link></li>
      <li><router-link to="/floodgate">Floodgate</router-link></li>
      <li><router-link to="/dr1_test1">電竜戦予行演習1</router-link></li>
      <li><router-link to="/dr1_test2">電竜戦予行演習2</router-link></li>
      <li><router-link to="/dr1_test3">電竜戦予行演習3</router-link></li>
      <li><router-link to="/dr1_test4a">電竜戦予行演習4</router-link></li>
      <li><router-link to="/dr1_production">電竜戦本戦</router-link></li>
      <li><router-link to="/3d/floodgate">Floodgate(3D)</router-link></li>
      <li><router-link to="/3d/dr1_test1">電竜戦予行演習1(3D)</router-link></li>
      <li><router-link to="/3d/dr1_test2">電竜戦予行演習2(3D)</router-link></li>
      <li><router-link to="/3d/dr1_test3">電竜戦予行演習3(3D)</router-link></li>
      <li>
        <router-link to="/3d/dr1_test4a">電竜戦予行演習4(3D)</router-link>
      </li>
      <li><router-link to="/3d/dr1_production">電竜戦本戦(3D)</router-link></li>
    </ul>
  </div>
</template>

<style lang="scss">
.home {
  margin: 0 1vw;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import PR from "@/components/PR.vue";

export default defineComponent({
  name: "Home",
  components: {
    PR,
  },
});
</script>
