<template>
  <div class="tournamentgl">
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
    <GameList :tournament="props.tournament" :gl="true" />
  </div>
</template>

<style lang="scss">
.tournamentgl {
  margin: 1vw;
}
</style>

<script lang="ts">
import { defineComponent, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import GameSelect from "@/components/GameSelect.vue";
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
    GameList,
    PR,
  },
});
</script>
