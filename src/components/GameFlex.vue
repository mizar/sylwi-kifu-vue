<style lang="scss">
div.boardset-container {
  width: 96vw;
  margin: 2vw auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  div.kifu {
    flex: 0 1 570px;
  }
  div.boardempty {
    flex: 0 1 570px;
    height: 0;
  }
}
</style>

<script lang="ts">
import { defineComponent, VNode, reactive, h, watch, computed } from "vue";
import Kifu from "@/components/Kifu.vue";
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
    gameNameInclude: {
      type: String,
      required: false,
      default: () => "",
    },
    gameIdInclude: {
      type: String,
      required: false,
      default: () => "",
    },
  },
  setup(props) {
    const data = reactive({
      intervalId: 0,
      gameList: [] as GameObjType[],
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
      if (props.gameIdInclude) {
        _gameList = _gameList.filter(
          (e) => e.gameId.indexOf(props.gameIdInclude) >= 0
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
    watch(
      [
        () => props.limitTimeDur,
        () => props.limitNumber,
        () => props.gameNameInclude,
      ],
      loadKifuList
    );
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
      "div",
      {
        className: "boardset-container",
      },
      [
        this.gameList
          .map((gameObj): VNode[] => {
            return [
              h(Kifu, {
                tournament: tournament,
                gameid: gameObj.gameId,
                gamename: gameObj.gameName,
                ply: NaN,
                hideTags: this.props.hideTags,
                hideGraph: this.props.hideGraph,
                hideTools: this.props.hideTools,
                hideComments: this.props.hideComments,
                disableNonGame: true,
                onChangePly: () => undefined,
              }),
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
    Kifu,
  },
});
</script>
