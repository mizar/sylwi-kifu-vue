<template>
  <div class="single">
    <GameSelect
      :tournament="data.tournament"
      :gameid="data.gameid"
      :gamename="data.gamename"
      @change-game="changeGame"
      @game-info="recvGameInfo"
    />
    <Kifu
      :tournament="data.tournament"
      :gameid="data.gameid"
      :gamename="data.gamename"
      :ply="data.ply"
      :lightEnd="true"
      @change-ply="changePly"
    />
  </div>
</template>

<style lang="scss">
.multi {
  height: unquote("max(97vh, 100vh - 1.5em)");
  overflow: auto;
}
</style>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import GameSelect from "@/components/GameSelect.vue";
import Kifu from "@/components/Kifu.vue";

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
    const router = useRouter();
    const data = reactive({
      tournament: props.tournament,
      gameid: props.gameid,
      gamename: props.gamename || "",
      ply: props.ply ? parseInt(props.ply, 10) : NaN,
    });
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
      router.push(`/${msg.tournament}/${msg.gameid}`);
    };
    const recvGameInfo = (msg: {
      tournament: string;
      gameid: string;
      gamename: string;
    }) => {
      [data.tournament, data.gameid, data.gamename] = [
        msg.tournament,
        msg.gameid,
        msg.gamename,
      ];
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
      router.push(
        `/${msg.tournament}/${msg.gameid}/${isNaN(msg.ply) ? `` : msg.ply}`
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
      changeGame,
      changePly,
      recvGameInfo,
    };
  },
  components: {
    GameSelect,
    Kifu,
  },
});
</script>
