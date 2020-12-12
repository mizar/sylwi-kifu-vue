<template>
  <div class="tournament">
    <PR />
    <h1>tournament : {{ props.tournament }}</h1>
    <p>
      <GameSelect :tournament="props.tournament" @change-game="changeGame" />
    </p>
    <p>
      <a
        :href="
          props.tournament === 'floodgate'
            ? `http://wdoor.c.u-tokyo.ac.jp/shogi/floodgate.html`
            : `https://golan.sakura.ne.jp/denryusen/${props.tournament}/dr1_live.php`
        "
        target="_blank"
        >⇒ 棋戦サイト</a
      >
    </p>
    <p>
      <router-link
        :to="{
          path: data.linkKifuMulti,
          query: { lt: 3540, ln: 50 },
        }"
        replace
        >⇒ 盤面複数表示(最新59分,最大50件)</router-link
      >
    </p>
    <p>
      <router-link :to="{ path: data.linkKifuMulti }" replace
        >⇒ 盤面複数表示(全棋譜)</router-link
      >
    </p>
    <p>
      <router-link :to="{ path: data.linkKifuMulti, query: { s: 1 } }" replace
        >⇒ 盤面複数表示(全棋譜,軽量)</router-link
      >
    </p>
    <p>↓ : 盤面複数表示(最大20件)</p>
    <GameFlex
      :tournament="props.tournament"
      :limitTimeDur="props.limitTimeDur"
      :limitNumber="props.limitNumber"
      :hideTags="props.hideTags"
      :hideGraph="props.hideGraph"
      :hideTools="props.hideTools"
      :hideComments="props.hideComments"
      :gameNameInclude="props.gameNameInclude"
    />
    <GameList :tournament="props.tournament" />
  </div>
</template>

<style lang="scss">
.tournament {
  margin: 0 1vw;
}
</style>

<script lang="ts">
import { defineComponent, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import GameSelect from "@/components/GameSelect.vue";
import GameFlex from "@/components/GameFlex.vue";
import GameList from "@/components/GameList.vue";
import PR from "@/components/PR.vue";

export default defineComponent({
  props: {
    tournament: {
      type: String,
      required: true,
    },
    limitTimeDur: {
      type: Number,
      required: false,
      default: () => Infinity,
    },
    limitNumber: {
      type: Number,
      required: false,
      default: () => 20,
    },
    hideTags: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    hideGraph: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    hideTools: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    hideComments: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    gameNameInclude: {
      type: String,
      required: false,
      default: () => "",
    },
  },
  setup(props) {
    const router = useRouter();
    const data = reactive({
      linkKifuMulti: computed(() => `/${props.tournament}/multi`),
      linkKifuMultiAll: computed(() => `/${props.tournament}/multiall`),
    });
    const changeGame = (msg: { tournament: string; gameid: string }) => {
      router.replace(`/${msg.tournament}/${msg.gameid}`);
    };
    return {
      props,
      data,
      changeGame,
    };
  },
  components: {
    GameSelect,
    GameFlex,
    GameList,
    PR,
  },
});
</script>
