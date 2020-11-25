<template>
  <div class="castle">
    <h1>戦型・戦法・囲い等タグ</h1>

    <p>
      このサイトで使われている、戦型・戦法・囲い等タグの定義を公開しています。
      <a
        href="https://github.com/mizar/sylwi-kifu-vue/tree/main/src/assets/castle/"
        target="_blank"
        rel="noopener"
        >JSON形式・YAML形式のデータはGitHubでも公開しています。</a
      >
    </p>
    <p>
      後半に示す、現行のタグ定義リストで足りないもの、間違っているものなどが有りましたら、是非
      <strong
        ><a
          href="https://github.com/mizar/sylwi-kifu-vue/issues/new/choose"
          target="_blank"
          rel="noopener"
          >GitHub Issues</a
        ></strong
      >
      より提案をお寄せください。作者はあまり戦法や囲いに明るくないので、気をつける必要のある所は詳しく教えていただけると幸いです。
    </p>
    <p>
      すべての駒を駒箱に入れた状態の局面図を作りたい時は、以下のテキストをコピーして、将棋所やShogiGUIなどに貼り付けてお使いください。
    </p>
    <textarea
      class="bod"
      rows="17"
      cols="32"
      disabled
      :value="`後手の持駒：なし
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ ・ ・|一
| ・ ・ ・ ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・ ・ ・ ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：なし
`"
    ></textarea>
    <p>
      必要な駒の配置を示す局面図は、将棋所やShogiGUIでは以下のメニューからコピーする事ができます。
      提案の際には局面編集をして、局面図をコピー、提案の本文に貼付けして部分図の作成にご活用ください。
    </p>
    <p>
      <img src="@/assets/screenshots/shogidokoro_bod.png" />
    </p>
    <p>
      <img src="@/assets/screenshots/shogigui_bod.png" />
    </p>

    <h2>現行のタグ定義リスト</h2>
    <CastleList />
  </div>
</template>

<style lang="scss">
.castle {
  margin: 0 1vw;
  img {
    max-width: 100%;
  }
}
</style>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from "vue";
import CastleList from "@/components/CastleList.vue";

export default defineComponent({
  props: {},
  setup(props, ctx: SetupContext) {
    const data = reactive({});
    return {
      props,
      data,
      ctx,
    };
  },
  components: {
    CastleList,
  },
});
</script>
