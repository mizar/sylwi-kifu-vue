<template>
  <div class="singlegl">
    <div class="gameselect">
      <GameSelect
        :tournament="data.tournament"
        :gameid="data.gameid"
        :gamename="getGameName(data.gameid)"
        @change-game="changeGame"
      />
    </div>
    <div class="kifugl">
      <KifuGL
        :tournament="data.tournament"
        :gameid="data.gameid"
        :gamename="getGameName(data.gameid)"
        :ply="data.ply"
        :lightEnd="true"
        @change-ply="changePly"
      />
    </div>
  </div>
</template>

<style lang="scss">
.gameselect {
  height: unquote("min(3vh, 1.5em)");
  width: 100vw;
  text-align: center;
  vertical-align: center;
  white-space: nowrap;
  font-size: unquote("min(2vh, 1em)");
  select,
  option {
    font-size: inherit;
  }
}
.kifugl {
  height: unquote("max(94vh, 100vh - 3em)");
  width: 100vw;
}
</style>

<script lang="ts">
import { defineComponent, reactive, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import GameSelect from "@/components/GameSelect.vue";
import KifuGL from "@/components/KifuGL.vue";

export default defineComponent({
  props: {
    tournament: {
      type: String,
      required: true,
    },
    gameid: {
      type: String,
      required: true,
    },
    gamename: {
      type: String,
      required: false,
    },
    ply: {
      type: String,
      required: false,
    },
    gameNameInclude: {
      type: String,
      required: false,
      default: () => "",
    },
  },
  setup(props) {
    const data = reactive({
      tournament: props.tournament,
      gameid: props.gameid,
      gamename: props.gamename || "",
      ply: props.ply ? parseInt(props.ply, 10) : NaN,
    });
    const router = useRouter();
    const store = useStore();
    const gameList = computed(() =>
      store.getters["shogiServer/getList"](props.tournament)
    );
    const getGameName = () => {
      const res = gameList.value.filter(
        ({ gameId }: { gameId: string }) => gameId === props.gameid
      );
      return res && res.length > 0 ? res[0].gameName : "???";
    };
    const changeGame = (msg: {
      tournament: string;
      gameid: string;
      gamename: string;
      ply: number;
    }) => {
      [data.tournament, data.gameid, data.gamename, data.ply] = [
        msg.tournament,
        msg.gameid,
        msg.gamename,
        NaN,
      ];
      router.replace(`/3d/${msg.tournament}/${msg.gameid}`);
    };
    const changePly = (msg: {
      tournament: string;
      gameid: string;
      ply: number;
    }) => {
      [data.tournament, data.gameid, data.ply] = [
        msg.tournament,
        msg.gameid,
        msg.ply,
      ];
      router.replace(
        `/3d/${msg.tournament}/${msg.gameid}/${isNaN(msg.ply) ? `` : msg.ply}`
      );
    };
    const updateProps = () => {
      [data.tournament, data.gameid, data.ply] = [
        props.tournament,
        props.gameid,
        props.ply ? parseInt(props.ply, 10) : NaN,
      ];
    };
    watch(() => props.tournament, updateProps);
    watch(() => props.gameid, updateProps);
    watch(() => props.ply, updateProps);
    return {
      props,
      data,
      getGameName,
      changeGame,
      changePly,
    };
  },
  components: {
    GameSelect,
    KifuGL,
  },
});
</script>
