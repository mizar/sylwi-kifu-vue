<template>
  <ul class="castlelist">
    <li v-for="centry in castleOrgData" :key="centry.id">
      <h3>{{ centry.id }} {{ centry.name }}</h3>
      <dl>
        <template v-for="(cprop, key) in centry" :key="key">
          <template v-if="key !== 'id' && key !== 'name'">
            <dt>{{ key }} ({{ keyTips[key] }}) :</dt>
            <dd>{{ cprop }}</dd>
            <dd v-if="key === 'pieces'">
              {{ cprop.map(conv_readable_pieces) }}
            </dd>
            <dd v-if="key === 'moves'">{{ cprop.map(conv_readable_moves) }}</dd>
            <dd v-if="key === 'capture'">
              {{ cprop.map(conv_readable_capture) }}
            </dd>
            <dd v-if="key === 'hand' || key === 'hand_exclude'">
              {{ cprop.map(conv_readable_hand) }}
            </dd>
          </template>
        </template>
      </dl>
    </li>
  </ul>
</template>

<style lang="scss">
.castlelist {
  h3 {
    font-weight: bold;
    background-color: #eee;
    padding: 0.2em 0;
  }
  dl {
    margin-block-start: 0;
    margin-block-end: 0;
    dt {
      font-weight: bold;
      background-color: #eee;
      padding: 0.2em 0;
      margin: 0.2em 0;
    }
    dd {
      display: block;
      margin-inline-start: 10px;
      word-wrap: break-word;
    }
  }
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import {
  castleOrgData,
  conv_readable_pieces,
  conv_readable_moves,
  conv_readable_capture,
  conv_readable_hand,
} from "@/modules/castle";

export default defineComponent({
  props: {},
  setup(props) {
    return {
      props,
      castleOrgData,
      keyTips: {
        pieces: "盤上の駒[AND条件]",
        hand: "駒台の駒[AND条件]",
        hand_exclude: "駒台にあってはいけない駒[NOT OR条件]",
        moves: "指し手[OR条件]",
        capture: "捕獲した駒[OR条件]",
        tags_required: "成立に必要なタグ[AND条件]",
        tags_exclude:
          "そのタグが既に存在していたら成立扱いにしない[NOT OR条件]",
        tags_disable: "無効化させるタグ",
        special: "特殊",
        tesuu_max: "最大手数制限",
        hide: "非表示",
        noturn: "先手番/後手番のルール対生成をしない",
      },
    };
  },
  methods: {
    conv_readable_pieces,
    conv_readable_moves,
    conv_readable_capture,
    conv_readable_hand,
  },
  components: {},
});
</script>
