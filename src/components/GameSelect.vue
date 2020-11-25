<template>
  <select class="kifulist" v-model="data.gameId" @change="changeGameEvent">
    <option
      v-for="game in data.gameList"
      :key="game.gameId"
      :value="game.gameId"
    >
      {{ game.gameName }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive, watch } from "vue";
import { fetchGameListMirrorUrl } from "@/modules/kifuurl";
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
      gameList: [] as { gameId: string; gameName: string }[],
      gameId: props.gameid || "",
      gameName: props.gamename || "",
      error: "",
    });
    const getGameName = (gameId: string): string => {
      const gameNameList = data.gameList.filter((v) => v.gameId === gameId);
      const gameName = gameNameList.length > 0 ? gameNameList[0].gameName : "";
      return gameName;
    };
    const loadStream = () => {
      const tournament = props.tournament;
      const fetchGameListUrl = fetchGameListMirrorUrl(tournament);
      fetch(fetchGameListUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              [
                `Fetch Response was not ok : ${response.status} ${response.statusText}`,
              ].join("\n")
            );
          }
          return response.text();
        })
        .then((log) => {
          if (tournament === props.tournament) {
            data.error = "";
            data.gameList = (tournament === "floodgate"
              ? log
                  .split("\n")
                  .map(
                    (s) =>
                      (s.match(
                        /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d \[INFO\] game (?:started|finished) ((?:[\w.-]+\+){4}\d+)/
                      ) || { 1: "" })[1]
                  )
                  .filter((s) => s)
                  .map((s) => ({
                    gameId: s,
                    gameName: `☗${s.split("+")[2]} ☖${
                      s.split("+")[3]
                    } (${s.split("+")[4].substring(0, 4)}-${s
                      .split("+")[4]
                      .substring(4, 6)}-${s
                      .split("+")[4]
                      .substring(6, 8)} ${s
                      .split("+")[4]
                      .substring(8, 10)}:${s
                      .split("+")[4]
                      .substring(10, 12)}:${s
                      .split("+")[4]
                      .substring(12, 14)})`,
                  }))
              : log
                  .split("\n")
                  .map((s) =>
                    s.match(
                      /^<div><a href="\.\/kifujs\/((?:[\w.-]+\+){4}\d+)\.html"[^>]*>([^<]+)<\/a>/
                    )
                  )
                  .filter((s) => s)
                  .map((s) => ({
                    gameId: (s as string[])[1],
                    gameName: (s as string[])[2]
                      .replace(/▲/g, "☗")
                      .replace(/△/g, "☖"),
                  }))
            )
              .filter(
                (x, i, self) =>
                  self.map((s) => s.gameId).lastIndexOf(x.gameId) === i
              )
              .sort(
                (a, b) =>
                  parseFloat(b.gameId.substring(b.gameId.length - 14)) -
                  parseFloat(a.gameId.substring(a.gameId.length - 14))
              );
            ctx.emit("game-list", data.gameList);
            data.gameName = getGameName(data.gameId);
            ctx.emit("game-info", {
              tournament: props.tournament,
              gameid: data.gameId,
              gamename: data.gameName,
            });
          }
        });
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
        data.gameList = [];
        data.gameId = "";
        data.gameName = "";
        loadStream();
      }
    );
    data.intervalId = window.setInterval(execInterval, 60000);
    return {
      props,
      data,
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
