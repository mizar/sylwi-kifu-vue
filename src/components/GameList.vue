<script lang="ts">
import { defineComponent, VNode, reactive, h, SetupContext, watch } from "vue";
import { RouterLink } from "vue-router";
import iconLinkRaw from "!!raw-loader!tabler-icons/icons/link.svg";
import { getKifuOrgUrl, fetchGameListMirrorUrl } from "@/modules/kifuurl";

type GameObjType = {
  gameId: string;
  gameName: string;
};

export default defineComponent({
  props: {
    tournament: {
      type: String,
      required: true,
    },
    limitNumber: {
      type: Number,
      required: false,
      default: () => Infinity,
    },
    limitTimeDur: {
      type: Number,
      required: false,
      default: () => Infinity,
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
    gl: {
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
  setup(props, ctx: SetupContext) {
    const data = reactive({
      intervalId: 0,
      gameList: [] as GameObjType[],
      error: "",
    });
    const loadKifuList = () => {
      const tournament = props.tournament;
      const fetchGameListUrl = fetchGameListMirrorUrl(tournament);
      return fetch(fetchGameListUrl)
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
            const gameIdToDtValue = (gameid: string): number => {
              return new Date(
                Number.parseInt(
                  gameid.substring(gameid.length - 14, gameid.length - 10),
                  10
                ),
                Number.parseInt(
                  gameid.substring(gameid.length - 10, gameid.length - 8),
                  10
                ),
                Number.parseInt(
                  gameid.substring(gameid.length - 8, gameid.length - 6),
                  10
                ),
                Number.parseInt(
                  gameid.substring(gameid.length - 6, gameid.length - 4),
                  10
                ),
                Number.parseInt(
                  gameid.substring(gameid.length - 4, gameid.length - 2),
                  10
                ),
                Number.parseInt(
                  gameid.substring(gameid.length - 2, gameid.length),
                  10
                )
              ).valueOf();
            };
            if (props.gameNameInclude) {
              data.gameList = data.gameList.filter(
                (e) => e.gameName.indexOf(props.gameNameInclude) >= 0
              );
            }
            const lastGameIdDtValue = gameIdToDtValue(data.gameList[0].gameId);
            const limitTimeDur = props.limitTimeDur;
            if (limitTimeDur) {
              data.gameList = data.gameList.filter(
                (e) =>
                  (lastGameIdDtValue - gameIdToDtValue(e.gameId)) / 1000 <=
                  limitTimeDur
              );
            }
            const limitNumber = props.limitNumber;
            if (limitNumber && data.gameList.length > limitNumber) {
              data.gameList.length = limitNumber;
            }
            ctx.emit("game-list", data.gameList);
          }
          return { tournament, gameList: data.gameList };
        });
    };
    const execInterval = () => {
      loadKifuList();
    };
    watch(
      () => props.tournament,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          data.gameList = [];
          execInterval();
        }
      }
    );
    watch(() => props.limitTimeDur, loadKifuList);
    watch(() => props.limitNumber, loadKifuList);
    execInterval();
    data.intervalId = window.setInterval(execInterval, 60000);
    return {
      props,
      data,
    };
  },
  beforeUnmount() {
    if (this.data.intervalId) {
      clearInterval(this.data.intervalId);
      this.data.intervalId = 0;
    }
  },
  render() {
    const tournament = this.props.tournament;
    return h(
      "ul",
      {
        className: "boardset-container",
      },
      [
        this.data.gameList
          .map((gameObj): VNode[] => {
            const kifuOrgUrl = getKifuOrgUrl(tournament, gameObj.gameId);
            return [
              h(
                "li",
                {
                  className: "boardset",
                },
                [
                  // 棋譜URLコピーボタン
                  h("button", {
                    innerHTML: iconLinkRaw,
                    title: "棋譜のURLをクリップボードにコピー",
                    onClick: () => {
                      if (navigator?.clipboard) {
                        (navigator?.clipboard as
                          | undefined
                          | {
                              writeText(str: string): Promise<unknown>;
                            })?.writeText(kifuOrgUrl);
                      }
                    },
                  }),
                  h(
                    RouterLink,
                    {
                      to: `${this.props.gl ? `/3d` : ``}/${tournament}/${
                        gameObj.gameId
                      }`,
                    },
                    { default: () => gameObj.gameName }
                  ),
                ]
              ),
            ];
          })
          .reduce((p, c) => [...p, ...c], [] as VNode[]),
        Array.from({ length: 32 }).map(() =>
          h("div", {
            className: "boardempty",
          })
        ),
      ].reduce((p, c) => [...p, ...c], [] as VNode[])
    );
  },
  components: {
    RouterLink,
  },
});
</script>
