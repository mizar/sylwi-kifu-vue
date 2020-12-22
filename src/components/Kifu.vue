<template>
  <div
    class="kifu"
    v-if="!props.disableNonGame || data.tesuuMax > data.buoyTesuu"
  >
    <div class="kifuheader">
      <div class="gamename">
        <button
          @click="doCopyURL"
          v-html="iconLinkRaw"
          title="棋譜URLをクリップボードにコピー"
          v-if="data.hasClipboard"
        />
        <router-link
          :to="{ path: `/${props.tournament}/${props.gameid}` }"
          replace
          >{{ props.gamename }}</router-link
        >
      </div>
    </div>
    <div v-if="data.activated">
      <TagBar
        :tournament="props.tournament"
        :gameid="props.gameid"
        :jkfstr="data.jkfstr"
        @tesuu-change="tesuuChange"
        v-if="!props.hideTags"
      />
      <ScoreGraph
        :jkf="data.jkfstr"
        :tesuu="data.tesuu"
        :tournament="props.tournament"
        :gameid="props.gameid"
        :gamename="props.gamename"
        :kifuurl="data.kifuurl"
        :kifuorgurl="data.kifuorgurl"
        @tesuu-change="tesuuChange"
        v-if="!props.hideGraph"
      />
      <div class="kifuforjs">
        <div
          :class="
            props.lightEnd ||
            (data.tesuuMax > data.buoyTesuu &&
              data.tesuu >= Math.max(data.buoyTesuu, 1) &&
              data.inGame) ||
            (data.tesuu < data.tesuuMax &&
              data.tesuu >= Math.max(data.buoyTesuu, 1))
              ? `banset`
              : `banset end`
          "
        >
          <div>
            <div class="inlineblock players">
              <Mochi
                :jkf="data.jkfstr"
                :tesuu="data.tesuu"
                :rotated="data.rotated"
                :side="1"
              />
              <div class="mochi panel tesuu">
                <TesuuSel
                  :jkf="data.jkfstr"
                  :tesuu="data.tesuu"
                  :updated="data.updated"
                  @tesuu-change="tesuuChange"
                />
              </div>
            </div>
          </div>
          <Ban :jkf="data.jkfstr" :tesuu="data.tesuu" :rotated="data.rotated" />
          <div>
            <div class="inlineblock players">
              <div class="mochi info">
                <Info
                  :jkf="data.jkfstr"
                  :head="
                    JSON.stringify(
                      data.buoyName
                        ? { 指定局面: `[${data.buoyName}] ${data.buoyComment}` }
                        : {}
                    )
                  "
                />
              </div>
              <Mochi
                :jkf="data.jkfstr"
                :tesuu="data.tesuu"
                :rotated="data.rotated"
                :side="0"
              />
            </div>
          </div>
        </div>
        <div class="kifutools" v-if="!props.hideTools">
          <button
            @click="plyGo(-Infinity)"
            v-html="iconArrowBarToLeftRaw"
            title="初手に戻る"
          />
          <button
            @click="plyGo(-10)"
            v-html="iconChevronsLeftRaw"
            title="10手戻る"
          />
          <button
            @click="plyGo(-1)"
            v-html="iconCaretLeftRaw"
            title="1手戻る"
          />
          <input
            class="tesuu"
            type="number"
            min="0"
            :max="data.tesuuMax"
            :value="data.tesuu"
            @change="tesuuChangeEvent"
          />
          <button
            @click="plyGo(1)"
            v-html="iconCaretRightRaw"
            title="1手進む"
          />
          <button
            @click="plyGo(10)"
            title="10手進む"
            v-html="iconChevronsRightRaw"
          />
          <button
            @click="plyGo(Infinity)"
            v-html="iconArrowBarToRightRaw"
            title="最新に進む"
          />
          <button @click="doRotate" v-html="iconRotateRaw" title="盤面反転" />
          <button
            @click="doCopy"
            v-html="iconCopyRaw"
            title="棋譜をクリップボードにコピー"
            v-if="data.hasClipboard"
          />
          <button
            @click="doDownload"
            v-html="iconDownloadRaw"
            title="棋譜をダウンロード"
          />
          <button @click="doTweet" v-html="iconTwitterRaw" title="ツイート" />
          <button @click="doDiag" v-html="iconBrushRaw" title="局面図" />
        </div>
        <div v-if="data.showDiag && props.tournament !== 'floodgate'">
          <img
            class="diag"
            :src="`https://sylwi.mzr.jp/cimg_denryu.php?p=${getPSfenWB64()}&p1=${encodeURIComponent(
              data.p1
            )}&p2=${encodeURIComponent(data.p2)}`"
          />
        </div>
        <div v-if="data.showDiag && props.tournament === 'floodgate'">
          <img
            class="diag"
            :src="`https://sylwi.mzr.jp/cimg_floodgate.php?p=${getPSfenWB64()}&p1=${encodeURIComponent(
              data.p1
            )}&p2=${encodeURIComponent(data.p2)}`"
          />
        </div>
        <div v-if="!props.hideComments">
          <textarea :value="getComment()" class="comments" disabled></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
div.kifu {
  width: 570px;
  margin: 1em 0;
  div.kifuheader {
    button {
      img,
      svg {
        height: 1em;
        width: 1em;
      }
    }
    .gamename,
    .gameid {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }
  div.kifuforjs {
    width: 570px;
    div.banset {
      .players {
        .mochi {
          .mochimain {
            background-color: #eee;
            span.mochigoma.from {
              background-color: #f90;
            }
            span.mochigoma.capture {
              background-color: #0c9;
            }
          }
        }
      }
      .ban {
        .square {
          background-color: #fdd775;
        }
        .square.fromsq {
          background-color: #f90;
        }
        .square.tosq {
          background-color: #0c9;
        }
      }
    }
    div.banset.end {
      .players {
        .mochi {
          .mochimain {
            background-color: #ddd;
            span.mochigoma.from {
              background-color: #e80;
            }
            span.mochigoma.capture {
              background-color: #0a7;
            }
            img {
              opacity: 1;
            }
          }
        }
      }
      .ban {
        .square {
          background-color: #a6832a;
        }
        .square.fromsq {
          background-color: #e80;
        }
        .square.tosq {
          background-color: #0a7;
        }
        img {
          opacity: 1;
        }
      }
    }
    div.banset {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
      .inlineblock {
        display: inline-block;
      }
      .players {
        height: 100%;
        width: 120px;
        .mochi {
          width: 120px;
          .tebanname {
            font-size: 14px;
            text-align: center;
            background-color: silver;
            margin-bottom: 0;
            margin-top: auto;
            width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .points {
            text-align: center;
            background-color: #ddd;
          }
          .mochimain {
            width: 100%;
            height: 152px;
            margin-top: auto;
            margin-bottom: 0;
            img {
              width: 32px;
              height: 36px;
            }
            span.mochigoma {
              position: relative;
              display: none;
              height: 36px;
              padding: 0;
              border-spacing: 0;
            }
            span.mochigoma.fu {
              display: inline-block;
              width: 120px;
            }
            span.mochigoma.fu-else {
              display: inline-block;
              width: 60px;
            }
          }
          .panel {
            display: flex;
            flex-direction: column;
          }
          select.tesuu {
            font-size: 12px;
            width: 100%;
            height: 100%;
          }
          ul.lines {
            margin: 0;
            padding-left: 0;
            padding-top: 2px;
            list-style: none;
            li {
              display: list-item;
              text-align: -webkit-match-parent;
              padding: 1px;
              list-style: none;
            }
            button,
            select {
              width: 100%;
              height: 12%;
              padding: 1px;
            }
          }
        }
        .mochi.panel {
          height: 160px;
        }
        .mochi.info {
          overflow-y: scroll;
          font-size: 13px;
          height: 160px;
          dl {
            margin-block-start: 0;
            margin-block-end: 0;
            dt {
              font-weight: bold;
              clear: both;
              float: left;
              margin-right: 5px;
              background-color: #eee;
            }
            dd {
              display: block;
              margin-inline-start: 10px;
              word-wrap: break-word;
            }
          }
        }
      }
      .ban {
        display: table;
        border-collapse: collapse;
        .rank {
          display: table-row;
          flex-direction: row;
        }
        .square {
          display: table-cell;
          border: 1px #000 solid;
          border-spacing: 0;
          padding: 0;
          text-align: center;
          vertical-align: middle;
        }
        .square,
        .square div,
        .square img {
          width: 32px;
          height: 36px;
        }
        .filenum {
          display: table-cell;
          width: 32px;
          height: 1.2em;
          vertical-align: middle;
          text-align: center;
          font-weight: bold;
        }
        .ranknum {
          display: table-cell;
          width: 1.2em;
          height: 36px;
          vertical-align: middle;
          text-align: center;
          font-weight: bold;
        }
      }
    }
    div.kifutools {
      margin: 4px 0;
      button {
        img,
        svg {
          height: 24px;
          width: 24px;
        }
        .icon-tabler-brand-twitter {
          color: #1da1f2;
        }
      }
      input[type="number"].tesuu {
        border: 1px solid black;
        border-radius: 2px;
        text-align: center;
        font-size: 24px;
        height: 26px;
        width: 84px;
      }
    }
    textarea.comments {
      width: 100%;
      height: 16em;
    }
    .tebanname {
      overflow: hidden;
    }
    img.diag {
      max-width: 570px;
    }
    textarea,
    textarea:disabled {
      color: #000;
      box-sizing: border-box;
      background-color: #fff;
      -webkit-text-fill-color: #000;
      opacity: 1;
      overflow: scroll;
    }
  }
}
</style>

<script lang="ts">
import { defineComponent, reactive, SetupContext, watch } from "vue";
import { useStore } from "vuex";
import { JKFPlayer } from "json-kifu-format";
import { IMoveFormat } from "json-kifu-format/dist/src/Formats";
import { getKifuMirrorUrl, getKifuOrgUrl } from "@/modules/kifuurl";
import { toPackedSfenWeb } from "@/modules/psfenw";
import ScoreGraph from "@/modules/scoregraph";
import TagBar from "@/components/TagBar.vue";
import Info from "@/components/Kifu/Info.vue";
import Ban from "@/components/Kifu/Ban.vue";
import Mochi from "@/components/Kifu/Mochi.vue";
import TesuuSel from "@/components/Kifu/TesuuSel.vue";
import iconCaretLeftRaw from "!!raw-loader!@tabler/icons/icons/caret-left.svg";
import iconChevronsLeftRaw from "!!raw-loader!@tabler/icons/icons/chevrons-left.svg";
import iconArrowBarToLeftRaw from "!!raw-loader!@tabler/icons/icons/arrow-bar-to-left.svg";
import iconCaretRightRaw from "!!raw-loader!@tabler/icons/icons/caret-right.svg";
import iconChevronsRightRaw from "!!raw-loader!@tabler/icons/icons/chevrons-right.svg";
import iconArrowBarToRightRaw from "!!raw-loader!@tabler/icons/icons/arrow-bar-to-right.svg";
import iconRotateRaw from "!!raw-loader!@tabler/icons/icons/rotate.svg";
import iconTwitterRaw from "!!raw-loader!@tabler/icons/icons/brand-twitter.svg";
import iconCopyRaw from "!!raw-loader!@tabler/icons/icons/copy.svg";
import iconDownloadRaw from "!!raw-loader!@tabler/icons/icons/download.svg";
import iconLogoutRaw from "!!raw-loader!@tabler/icons/icons/logout.svg";
import iconLinkRaw from "!!raw-loader!@tabler/icons/icons/link.svg";
import iconBrushRaw from "!!raw-loader!@tabler/icons/icons/brush.svg";

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
      type: Number,
      required: true,
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
    lightEnd: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    disableNonGame: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  setup(props, ctx: SetupContext) {
    const data = reactive({
      jkfstr: `{"header":{},"moves":[{}]}`,
      tesuu: 0,
      tesuuMax: 0,
      buoyName: "",
      buoyComment: "",
      buoyTesuu: 0,
      kifustr: "",
      ply: props.ply,
      error: "",
      rotated: false,
      intervalId: 0,
      inGame: false,
      hasClipboard: !!navigator?.clipboard,
      activated: false,
      updated: 0,
      showDiag: false,
      p1: "",
      p2: "",
    });
    const store = useStore();
    const getPSfenWB64 = (): string => {
      const player = JKFPlayer.parseJKF(data.jkfstr);
      player.goto(data.tesuu);
      let mvply = { move: player.getMove(), tesuu: player.tesuu };
      if (player.tesuu > 0 && !mvply.move) {
        mvply = {
          move: player.getMove(player.tesuu - 1),
          tesuu: player.tesuu - 1,
        };
      }
      if (player.tesuu > 1 && !mvply.move) {
        mvply = {
          move: player.getMove(player.tesuu - 2),
          tesuu: player.tesuu - 2,
        };
      }
      return toPackedSfenWeb(player.shogi, mvply.move, mvply.tesuu).toB64();
    };
    const getComment = (): string =>
      [data.error, ...JKFPlayer.parseJKF(data.jkfstr).getComments(data.tesuu)]
        .filter((e) => e)
        .join("\n");
    const getKifuurl = (): string =>
      getKifuMirrorUrl(props.tournament, props.gameid);
    const getKifuorgurl = (): string =>
      getKifuOrgUrl(props.tournament, props.gameid);
    const plyGo = (plyRel: number | string) => {
      const oldTesuu = data.tesuu;
      const newTesuu = Math.max(Math.min(oldTesuu + +plyRel, data.tesuuMax), 0);
      const newDataPly = newTesuu !== data.tesuuMax ? newTesuu : NaN;
      data.tesuu = newTesuu;
      data.ply = newDataPly;
      if (oldTesuu !== newTesuu) {
        ctx.emit("change-ply", {
          tournament: props.tournament,
          gameid: props.gameid,
          gamename: props.gamename,
          ply: newDataPly,
        });
      }
    };
    const plyGoto = (plyAbs: number | string) => {
      const oldTesuu = data.tesuu;
      const newTesuu = Math.max(Math.min(+plyAbs, data.tesuuMax), 0);
      const newDataPly = newTesuu !== data.tesuuMax ? newTesuu : NaN;
      data.tesuu = newTesuu;
      data.ply = newDataPly;
      if (oldTesuu !== newTesuu) {
        ctx.emit("change-ply", {
          tournament: props.tournament,
          gameid: props.gameid,
          gamename: props.gamename,
          ply: newDataPly,
        });
      }
    };
    const tesuuChange = (msg: { ply: number }) => {
      plyGoto(msg.ply);
    };
    const tesuuChangeEvent = (event: Event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement
      ) {
        plyGoto(event.target.value);
      }
    };
    const loadEmpty = () => {
      data.jkfstr = `{"header":{},"moves":[{}]}`;
      data.kifustr = "";
      data.tesuuMax = 0;
      data.tesuu = 0;
    };
    const updateData = () => {
      const tournament = props.tournament;
      const gameId = props.gameid;
      const buoyEntry = store.getters["shogiServer/getBuoy"](
        tournament,
        gameId.match(/^[A-Za-z0-9_-]+\+buoy_([A-Za-z0-9.-]+)/)?.[1] ?? ""
      );
      const tesuuMax = store.getters["shogiServer/getTesuuMax"](
        tournament,
        gameId
      );
      [
        data.kifustr,
        data.error,
        data.inGame,
        data.tesuuMax,
        data.buoyName,
        data.buoyComment,
        data.buoyTesuu,
        data.jkfstr,
        data.tesuu,
        data.activated,
        data.p1,
        data.p2,
      ] = [
        store.getters["shogiServer/getRawCsa"](tournament, gameId),
        "",
        !store.getters["shogiServer/getGameEnd"](tournament, gameId),
        tesuuMax,
        buoyEntry[1] ?? "",
        buoyEntry[2] ?? "",
        store.getters["shogiServer/getBuoyTesuu"](tournament, gameId),
        store.getters["shogiServer/getJkf"](tournament, gameId),
        Math.max(
          Math.min(Number.isNaN(data.ply) ? Infinity : data.ply, tesuuMax),
          0
        ),
        true,
        store.getters["shogiServer/getPlayer1"](tournament, gameId),
        store.getters["shogiServer/getPlayer2"](tournament, gameId),
      ];
      setTimeout(() => {
        // TesuuSel用の遅延更新呼び出し
        data.updated = new Date().valueOf();
      }, 0);
    };
    updateData();
    const loadKifu = () => {
      const tournament = props.tournament;
      const gameId = props.gameid;
      if (!tournament || !gameId) {
        return;
      }
      updateData();
      store.dispatch("shogiServer/fetchCsa", {
        tournament,
        gameId,
        callback: updateData,
      });
    };
    data.intervalId = window.setInterval(
      loadKifu,
      props.tournament === "floodgate" ? 5000 : 1000
    );
    const moveToReadableKifu = (mv: IMoveFormat): string => {
      return JKFPlayer.moveToReadableKifu(mv);
    };
    const kifuUrlOpenEvent = () => {
      window.open(getKifuorgurl(), "_blank");
    };
    // 盤面反転ボタン
    const doRotate = () => {
      data.rotated = !data.rotated;
    };
    // 棋譜コピーボタン
    const doCopy = () => {
      if (navigator?.clipboard) {
        (navigator?.clipboard as
          | undefined
          | { writeText(str: string): Promise<unknown> })?.writeText(
          data.kifustr
        );
      }
    };
    // 棋譜URLコピーボタン
    const doCopyURL = () => {
      if (navigator?.clipboard) {
        (navigator?.clipboard as
          | undefined
          | { writeText(str: string): Promise<unknown> })?.writeText(
          getKifuorgurl()
        );
      }
    };
    // 棋譜ダウンロードボタン
    const doDownload = () => {
      const link = document.createElement("a");
      link.download = `${props.gameid}.csa`;
      const blob = new Blob([data.kifustr], {
        type: "application/octet-stream",
      });
      link.href = URL.createObjectURL(blob);
      link.click();
    };
    // ツイートボタン
    const doTweet = () => {
      const player = JKFPlayer.parseJKF(data.jkfstr);
      const readableKifu = player.getReadableKifu(data.tesuu);
      const tweetProp =
        props.tournament === "floodgate"
          ? {
              text: `${data.buoyName ? `[${data.buoyName}] ` : ""}${
                props.gamename
              } ${data.tesuu}手目 ${readableKifu}\n\n\n`,
              url: new URL(
                `./floodgate.php?tn=${props.tournament}&gi=${
                  props.gameid
                }&p=${getPSfenWB64()}&gn=${encodeURIComponent(
                  props.gamename || ""
                )}&p1=${encodeURIComponent(data.p1)}&p2=${encodeURIComponent(
                  data.p2
                )}`,
                window.location.href
              ).href,
              hashtags: "将棋,floodgate",
              via: "",
            }
          : {
              text: `${data.buoyName ? `[${data.buoyName}] ` : ""}${
                props.gamename
              } ${data.tesuu}手目 ${readableKifu}\n\n\n`,
              url: new URL(
                `./denryu.php?tn=${props.tournament}&gi=${
                  props.gameid
                }&p=${getPSfenWB64()}&gn=${encodeURIComponent(
                  props.gamename || ""
                )}&p1=${encodeURIComponent(data.p1)}&p2=${encodeURIComponent(
                  data.p2
                )}`,
                window.location.href
              ).href,
              hashtags: "将棋,電竜戦",
              via: "DenryuSen",
            };
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetProp.text
        )}${tweetProp.url ? `&url=${encodeURIComponent(tweetProp.url)}` : ""}${
          tweetProp.hashtags
            ? `&hashtags=${encodeURIComponent(tweetProp.hashtags)}`
            : ""
        }${tweetProp.via ? `&via=${encodeURIComponent(tweetProp.via)}` : ""}`,
        "_blank",
        "noopener=yes"
      );
    };
    const doDiag = () => {
      data.showDiag = !data.showDiag;
    };
    // 情報ダイアログボタン
    const doInfoDiag = () => {
      // TODO
    };
    loadKifu();
    watch(
      () => props.tournament,
      () => {
        data.ply = props.ply;
        loadKifu();
      }
    );
    watch(
      () => props.gameid,
      () => {
        data.ply = props.ply;
        loadKifu();
      }
    );
    watch(
      () => props.ply,
      () => {
        data.ply = props.ply;
        plyGoto(isNaN(props.ply) ? Infinity : props.ply);
      }
    );
    return {
      props,
      data,
      getComment,
      getKifuurl,
      getKifuorgurl,
      getPSfenWB64,
      loadEmpty,
      loadKifu,
      moveToReadableKifu,
      doRotate,
      doTweet,
      doInfoDiag,
      doCopy,
      doCopyURL,
      doDownload,
      doDiag,
      plyGo,
      plyGoto,
      kifuUrlOpenEvent,
      tesuuChange,
      tesuuChangeEvent,
      iconCaretLeftRaw,
      iconChevronsLeftRaw,
      iconArrowBarToLeftRaw,
      iconCaretRightRaw,
      iconChevronsRightRaw,
      iconArrowBarToRightRaw,
      iconRotateRaw,
      iconTwitterRaw,
      iconCopyRaw,
      iconDownloadRaw,
      iconLogoutRaw,
      iconLinkRaw,
      iconBrushRaw,
    };
  },
  beforeUnmount() {
    if (this.data.intervalId) {
      clearInterval(this.data.intervalId);
      this.data.intervalId = 0;
    }
  },
  components: {
    TagBar,
    ScoreGraph,
    Info,
    Ban,
    Mochi,
    TesuuSel,
  },
});
</script>
