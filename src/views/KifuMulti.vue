<template>
  <div class="multi">
    <h1>tournament : {{ props.tournament }}</h1>
    <PR />
    <p>
      <GameSelect :tournament="props.tournament" @change-game="changeGame" />
    </p>
    <button @click="data.showoption = !data.showoption">
      {{ data.showoption ? "-Option" : "+Option" }}
    </button>
    <ul v-show="data.showoption">
      <li>
        時間隔制限:
        <button @click="changeQuery({ limitTimeDur: 900 })">15min</button>
        <button @click="changeQuery({ limitTimeDur: 1740 })">29min</button>
        <button @click="changeQuery({ limitTimeDur: 3540 })">59min</button>
        <button @click="changeQuery({ limitTimeDur: 5340 })">89min</button>
        <button @click="changeQuery({ limitTimeDur: 7140 })">119min</button>
        <button @click="changeQuery({ limitTimeDur: 10800 })">3h</button>
        <button @click="changeQuery({ limitTimeDur: 14400 })">4h</button>
        <button @click="changeQuery({ limitTimeDur: 21600 })">6h</button>
        <button @click="changeQuery({ limitTimeDur: 28800 })">8h</button>
        <button @click="changeQuery({ limitTimeDur: 43200 })">12h</button>
        <button @click="changeQuery({ limitTimeDur: 64800 })">18h</button>
        <button @click="changeQuery({ limitTimeDur: 86400 })">24h</button>
        <button @click="changeQuery({ limitTimeDur: 172800 })">2d</button>
        <button @click="changeQuery({ limitTimeDur: 259200 })">3d</button>
        <button @click="changeQuery({ limitTimeDur: 604800 })">7d</button>
        <button @click="changeQuery({ limitTimeDur: 1029600 })">14d</button>
        <button @click="changeQuery({ limitTimeDur: Infinity })">
          Infinity
        </button>
      </li>
      <li>
        表示数:
        <button @click="changeQuery({ limitNumber: 10 })">10</button>
        <button @click="changeQuery({ limitNumber: 20 })">20</button>
        <button @click="changeQuery({ limitNumber: 30 })">30</button>
        <button @click="changeQuery({ limitNumber: 40 })">40</button>
        <button @click="changeQuery({ limitNumber: 50 })">50</button>
        <button @click="changeQuery({ limitNumber: 75 })">75</button>
        <button @click="changeQuery({ limitNumber: 100 })">100</button>
        <button @click="changeQuery({ limitNumber: 150 })">150</button>
        <button @click="changeQuery({ limitNumber: 200 })">200</button>
        <button @click="changeQuery({ limitNumber: Infinity })">
          Infinity
        </button>
      </li>
      <li>
        タグ:
        <button @click="changeQuery({ hideTags: true })">hide</button>
        <button @click="changeQuery({ hideTags: false })">show</button>
      </li>
      <li>
        グラフ:
        <button @click="changeQuery({ hideGraph: true })">hide</button>
        <button @click="changeQuery({ hideGraph: false })">show</button>
      </li>
      <li>
        ツール:
        <button @click="changeQuery({ hideTools: true })">hide</button>
        <button @click="changeQuery({ hideTools: false })">show</button>
      </li>
      <li>
        コメント:
        <button @click="changeQuery({ hideComments: true })">hide</button>
        <button @click="changeQuery({ hideComments: false })">show</button>
      </li>
      <li v-if="props.tournament !== 'floodgate'">
        名前条件:
        <button @click="changeQuery({ gameNameInclude: '' })">none</button>
        <button @click="changeQuery({ gameNameInclude: 'A級' })">A級</button>
        <button @click="changeQuery({ gameNameInclude: 'B級' })">B級</button>
        <button @click="changeQuery({ gameNameInclude: '初日' })">初日</button>
        <button @click="changeQuery({ gameNameInclude: '最終日' })">
          最終日
        </button>
        <button @click="changeQuery({ gameNameInclude: 'テスト' })">
          テスト
        </button>
        <button @click="changeQuery({ gameNameInclude: '1回戦' })">
          1回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '2回戦' })">
          2回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '3回戦' })">
          3回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '4回戦' })">
          4回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '5回戦' })">
          5回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '6回戦' })">
          6回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '7回戦' })">
          7回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '8回戦' })">
          8回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '9回戦' })">
          9回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '10回戦' })">
          10回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 1回戦' })">
          【A級】 1回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 2回戦' })">
          【A級】 2回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 3回戦' })">
          【A級】 3回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 4回戦' })">
          【A級】 4回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 5回戦' })">
          【A級】 5回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 6回戦' })">
          【A級】 6回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 7回戦' })">
          【A級】 7回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 8回戦' })">
          【A級】 8回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 9回戦' })">
          【A級】 9回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【A級】 10回戦' })">
          【A級】 10回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 1回戦' })">
          【B級】 1回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 2回戦' })">
          【B級】 2回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 3回戦' })">
          【B級】 3回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 4回戦' })">
          【B級】 4回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 5回戦' })">
          【B級】 5回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 6回戦' })">
          【B級】 6回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 7回戦' })">
          【B級】 7回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 8回戦' })">
          【B級】 8回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 9回戦' })">
          【B級】 9回戦
        </button>
        <button @click="changeQuery({ gameNameInclude: '【B級】 10回戦' })">
          【B級】 10回戦
        </button>
      </li>
      <li>
        <label><input type="checkbox" v-model="data.show" />(debug)kifu</label>
      </li>
    </ul>
    <GameFlex
      :tournament="props.tournament"
      :limitTimeDur="props.limitTimeDur"
      :limitNumber="props.limitNumber"
      v-if="data.show"
      :hideTags="props.hideTags"
      :hideGraph="props.hideGraph"
      :hideTools="props.hideTools"
      :hideComments="props.hideComments"
      :gameNameInclude="props.gameNameInclude"
    />
  </div>
</template>

<style lang="scss">
.multi {
  margin: 0 1vw;
}
</style>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";
import GameSelect from "@/components/GameSelect.vue";
import GameFlex from "@/components/GameFlex.vue";
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
  },
  setup(props) {
    const data = reactive({
      show: true,
    });
    const router = useRouter();
    const changeGame = (msg: { tournament: string; gameid: string }) => {
      router.push(`/${msg.tournament}/${msg.gameid}`);
    };
    return {
      props,
      data,
      showoption: false,
      changeGame,
      changeQuery: (newprops: Partial<typeof props>): void => {
        const p = Object.assign({}, props, newprops);
        router.push({
          name: "KifuMulti",
          params: {
            tournament: p.tournament,
          },
          query: Object.assign(
            {},
            0 < p.limitTimeDur && p.limitTimeDur < 1e9
              ? {
                  lt: `${p.limitTimeDur}`,
                }
              : {},
            0 < p.limitNumber && p.limitNumber < 1e9
              ? {
                  ln: `${p.limitNumber}`,
                }
              : {},
            p.hideTags ? { tags: "0" } : {},
            p.hideGraph ? { graph: "0" } : {},
            p.hideTools ? { tools: "0" } : {},
            p.hideComments ? { comments: "0" } : {},
            p.gameNameInclude ? { name: p.gameNameInclude } : {}
          ),
        });
      },
    };
  },
  components: {
    GameSelect,
    GameFlex,
    PR,
  },
});
</script>
