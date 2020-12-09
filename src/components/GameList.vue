<script lang="ts">
import { defineComponent, VNode, reactive, h, watch, computed } from "vue";
import { RouterLink } from "vue-router";
import iconLinkRaw from "!!raw-loader!@tabler/icons/icons/link.svg";
import { getKifuOrgUrl } from "@/modules/kifuurl";
import { useStore } from "vuex";

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
  setup(props) {
    const data = reactive({
      intervalId: 0,
      error: "",
    });
    const store = useStore();
    const filterGameList = (gameList: GameObjType[]): GameObjType[] => {
      let _gameList = [...gameList];
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
        _gameList = _gameList.filter(
          (e) => e.gameName.indexOf(props.gameNameInclude) >= 0
        );
      }
      const lastGameIdDtValue =
        _gameList.length > 0 ? gameIdToDtValue(_gameList[0].gameId) : 0;
      const limitTimeDur = props.limitTimeDur;
      if (limitTimeDur) {
        _gameList = _gameList.filter(
          (e) =>
            (lastGameIdDtValue - gameIdToDtValue(e.gameId)) / 1000 <=
            limitTimeDur
        );
      }
      const limitNumber = props.limitNumber;
      if (limitNumber && _gameList.length > limitNumber) {
        _gameList.length = limitNumber;
      }
      return _gameList;
    };
    const gameList = computed(() =>
      filterGameList(store.getters["shogiServer/getList"](props.tournament))
    );
    const loadKifuList = () => {
      store.dispatch("shogiServer/fetchList", { tournament: props.tournament });
    };
    const execInterval = () => {
      loadKifuList();
    };
    watch(
      () => props.tournament,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
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
      gameList,
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
        className: "gamelist-container",
      },
      this.gameList
        .map((gameObj): VNode[] => {
          const kifuOrgUrl = getKifuOrgUrl(tournament, gameObj.gameId);
          return [
            h(
              "li",
              {
                className: "gameentry",
                key: gameObj.gameId,
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
        .reduce((p, c) => [...p, ...c], [] as VNode[])
    );
  },
  components: {
    RouterLink,
  },
});
</script>
