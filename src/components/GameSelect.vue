<template>
  <select class="kifulist" v-model="data.gameId" @change="changeGameEvent">
    <option v-for="game in gameList" :key="game.gameId" :value="game.gameId">
      {{ game.gameName }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive, watch, computed } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    tournament: {
      type: String,
      required: true,
    },
    gameid: {
      type: String,
      required: false,
    },
    gamename: {
      type: String,
      required: false,
    },
  },
  setup(props, ctx: SetupContext) {
    const data = reactive({
      intervalId: 0,
      selectedIndex: NaN,
      gameId: props.gameid || "",
      gameName: props.gamename || "",
      error: "",
    });
    const store = useStore();
    const gameList = computed(() =>
      store.getters["shogiServer/getList"](props.tournament)
    );
    const getGameName = (gameId: string): string => {
      const gameNameList = gameList.value.filter(
        (v: { gameId: string; gameName: string }) => v.gameId === gameId
      );
      const gameName = gameNameList.length > 0 ? gameNameList[0].gameName : "";
      return gameName;
    };
    const loadStream = () => {
      store.dispatch("shogiServer/fetchList", { tournament: props.tournament });
    };
    const changeGame = (newGameId: string) => {
      data.gameId = newGameId;
      data.gameName = getGameName(newGameId);
      ctx.emit("change-game", {
        tournament: props.tournament,
        gameid: data.gameId,
        gamename: data.gameName,
      });
      ctx.emit("game-info", {
        tournament: props.tournament,
        gameid: data.gameId,
        gamename: data.gameName,
      });
    };
    const changeGameEvent = (event: Event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement
      ) {
        changeGame(event.target.value);
      }
    };
    const execInterval = () => {
      loadStream();
    };
    loadStream();
    watch(
      () => props.tournament,
      () => {
        data.gameId = "";
        data.gameName = "";
        loadStream();
      }
    );
    data.intervalId = window.setInterval(execInterval, 60000);
    return {
      props,
      data,
      gameList,
      changeGame,
      changeGameEvent,
    };
  },
  beforeUnmount() {
    if (this.data.intervalId) {
      clearInterval(this.data.intervalId);
      this.data.intervalId = 0;
    }
  },
});
</script>
