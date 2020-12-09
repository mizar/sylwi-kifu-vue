import {
  fetchGameBuoyTableUrl,
  fetchGameListMirrorUrl,
  getKifuMirrorUrl,
} from "@/modules/kifuurl";
import { JKFPlayer } from "json-kifu-format";
import { createStore } from "vuex";

export default createStore({
  modules: {
    shogiServer: {
      namespaced: true,
      state: () => ({
        gameList: {},
        buoyTable: {},
        csa: {},
      }),
      getters: {
        getRawList: (state) => (tournament: string) => {
          return state.gameList[tournament]?.raw;
        },
        getList: (state) => (tournament: string) => {
          return [
            ...(state.gameList[tournament]?.list ?? []).map(
              (e: Record<string, unknown>) => ({
                ...e,
              })
            ),
          ];
        },
        getListJson: (state) => (tournament: string) => {
          return state.gameList[tournament]?.listjson;
        },
        getRawBuoy: (state) => (tournament: string) => {
          return state.buoyTable[tournament]?.raw;
        },
        getBuoy: (state) => (tournament: string, buoyid: string) => {
          const f: string[][] = state.buoyTable[tournament]?.table.filter(
            (line: string[]) => line[0] === buoyid
          );
          return f && f.length > 0 ? [...f[0]] : [];
        },
        getRawCsa: (state) => (tournament: string, gameId: string) => {
          return state.csa[`${tournament}/${gameId}`]?.csa;
        },
        getJkf: (state) => (tournament: string, gameId: string) => {
          return (
            state.csa[`${tournament}/${gameId}`]?.jkf ??
            `{"header":{},"moves":[{}]}`
          );
        },
      },
      mutations: {
        mutList(state, { tournament, rawlist }) {
          const list = (tournament === "floodgate"
            ? rawlist
                .split("\n")
                .map((s: string) =>
                  s.match(
                    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d \[INFO\] game (?:started|finished) ((?:[\w.-]+\+){4}\d+)/
                  )
                )
                .filter((s: RegExpMatchArray | null) => s)
                .map((s: RegExpMatchArray) => ({
                  gameId: s[1],
                  gameName: `☗${s[1].split("+")[2]} ☖${
                    s[1].split("+")[3]
                  } (${s[1].split("+")[4].substring(0, 4)}-${s[1]
                    .split("+")[4]
                    .substring(4, 6)}-${s[1]
                    .split("+")[4]
                    .substring(6, 8)} ${s[1]
                    .split("+")[4]
                    .substring(8, 10)}:${s[1]
                    .split("+")[4]
                    .substring(10, 12)}:${s[1]
                    .split("+")[4]
                    .substring(12, 14)})`,
                }))
            : rawlist
                .split("\n")
                .map((s: string) =>
                  s.match(
                    /^<div><a href="\.\/kifujs\/((?:[\w.-]+\+){4}\d+)\.html"[^>]*>([^<]+)<\/a>/
                  )
                )
                .filter((s: RegExpMatchArray | null) => s)
                .map((s: RegExpMatchArray) => ({
                  gameId: (s as string[])[1],
                  gameName: (s as string[])[2]
                    .replace(/▲/g, "☗")
                    .replace(/△/g, "☖"),
                }))
          )
            .filter(
              (
                x: { gameId: string; gameName: string },
                i: number,
                self: { gameId: string; gameName: string }[]
              ) => !self.some((s, j) => j < i && s.gameId === x.gameId)
            )
            .sort(
              (
                a: { gameId: string; gameName: string },
                b: { gameId: string; gameName: string }
              ) =>
                parseFloat(b.gameId.substring(b.gameId.length - 14)) -
                parseFloat(a.gameId.substring(a.gameId.length - 14))
            );
          state.gameList[tournament] = {
            raw: rawlist,
            list,
            listjson: JSON.stringify(list),
            updated: new Date().valueOf(),
          };
        },
        mutBuoy(state, { tournament, rawbuoy }) {
          state.buoyTable[tournament] = {
            raw: rawbuoy,
            table: rawbuoy.split("\n").map((s: string) => s.split("|")),
            updated: new Date().valueOf(),
          };
        },
        mutCsa(state, { tournament, gameId, csa }) {
          state.csa[`${tournament}/${gameId}`] = {
            csa,
            jkf: JKFPlayer.parseCSA(csa).toJKF(),
            updated: new Date().valueOf(),
          };
        },
      },
      actions: {
        async fetchList({ commit }, { tournament }: { tournament: string }) {
          fetch(fetchGameListMirrorUrl(tournament))
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
            .then((rawlist) => {
              commit("mutList", { tournament, rawlist });
            });
        },
        async fetchBuoy({ commit }, { tournament }: { tournament: string }) {
          fetch(fetchGameBuoyTableUrl(tournament))
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(
                  [
                    `Fetch Response was not ok : ${response.status} ${response.statusText}`,
                  ].join("\n")
                );
              }
              const readAsText = (blob: Blob, encoding?: string) =>
                new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    resolve(reader.result);
                  };
                  reader.readAsText(blob, encoding);
                });
              const blob = await response.blob();
              return readAsText(blob /*, "shift_jis"*/);
            })
            .then((rawbuoy) => {
              commit("mutBuoy", { tournament, rawbuoy });
            });
        },
        async fetchCsa(
          { commit },
          { tournament, gameId }: { tournament: string; gameId: string }
        ) {
          fetch(getKifuMirrorUrl(tournament, gameId))
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
            .then((csa) => {
              commit("mutCsa", { tournament, gameId, csa });
            });
        },
      },
    },
  },
  strict: process.env.NODE_ENV !== "production",
});
