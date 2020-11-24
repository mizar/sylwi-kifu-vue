<template>
  <div class="stage">
    <TagBar
      class="tags"
      :jkfstr="data.jkfstr"
      @tesuu-change="tesuuChange"
      v-if="!props.hideTags"
    />
    <div class="pad0"></div>
    <TesuuSel
      class="tesuusel"
      :jkf="data.jkfstr"
      :tesuu="data.tesuu"
      :updated="data.updated"
      @tesuu-change="tesuuChange"
    />
    <ScoreGraph
      class="graph"
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
    <div class="pad1"></div>
    <div class="board">
      <Stage :jkf="data.jkfstr" :tesuu="data.tesuu" :rotated="data.rotated" />
    </div>
  </div>
</template>

<style lang="scss">
div.stage {
  margin: 0;
  padding: 0;
  display: grid;
  width: 100vw;
  grid-template-columns: unquote(
    "1fr 9em max(4.556 * 9vh, 4.556 * (15vh - 3em)) 1fr"
  );
  grid-template-rows: unquote(
    "min(3vh, 1.5em) max(9vh, 15vh - 3em) calc(max(91vh, 100vh - 4.5em) - max(9vh, 15vh - 3em))"
  );
  grid-template-areas:
    "tags tags tags tags"
    "pad0 kifu graph pad1"
    "canvas canvas canvas canvas";
  .tags {
    grid-area: tags;
    text-align: center;
    vertical-align: center;
    white-space: nowrap;
    font-size: unquote("min(2vh, 1em)");
    button {
      svg.icon-tabler {
        font-size: inherit;
        width: 1em;
        height: 1em;
        vertical-align: -0.125em;
      }
    }
    select,
    option {
      font-size: inherit;
    }
  }
  .tesuusel {
    grid-area: kifu;
    color: #000;
    background-color: #fff;
    -webkit-text-fill-color: #000;
    opacity: 1;
    font-family: "BIZ UDGothic", monospace;
    font-size: unquote("min(2vh, 1em)");
    option {
      font-size: inherit;
    }
  }
  .graph {
    grid-area: graph;
  }
  .board {
    grid-area: canvas;
    canvas {
      display: block;
      width: 100vw;
      height: unquote("calc(max(91vh, 100vh - 4.5em) - max(9vh, 15vh - 3em))");
      touch-action: none;
    }
  }
}
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
import iconCaretLeftRaw from "!!raw-loader!tabler-icons/icons/caret-left.svg";
import iconChevronsLeftRaw from "!!raw-loader!tabler-icons/icons/chevrons-left.svg";
import iconArrowBarToLeftRaw from "!!raw-loader!tabler-icons/icons/arrow-bar-to-left.svg";
import iconCaretRightRaw from "!!raw-loader!tabler-icons/icons/caret-right.svg";
import iconChevronsRightRaw from "!!raw-loader!tabler-icons/icons/chevrons-right.svg";
import iconArrowBarToRightRaw from "!!raw-loader!tabler-icons/icons/arrow-bar-to-right.svg";
import iconRotateRaw from "!!raw-loader!tabler-icons/icons/rotate.svg";
import iconTwitterRaw from "!!raw-loader!tabler-icons/icons/brand-twitter.svg";
import iconCopyRaw from "!!raw-loader!tabler-icons/icons/copy.svg";
import iconDownloadRaw from "!!raw-loader!tabler-icons/icons/download.svg";
import iconLogoutRaw from "!!raw-loader!tabler-icons/icons/logout.svg";
import iconLinkRaw from "!!raw-loader!tabler-icons/icons/link.svg";
import iconBrushRaw from "!!raw-loader!tabler-icons/icons/brush.svg";
import { JKFPlayer } from "json-kifu-format";
import { IMoveFormat } from "json-kifu-format/dist/src/Formats";
import { defineComponent, reactive, SetupContext, watch } from "vue";
import { getKifuMirrorUrl, getKifuOrgUrl } from "@/modules/kifuurl";
import TagBar from "@/components/TagBar.vue";
import TesuuSel from "@/components/Kifu/TesuuSel.vue";
import ScoreGraph from "@/modules/scoregraph";
import { toPackedSfenWeb } from "@/modules/psfenw";
import { Stage } from "@/modules/ShogiGL/stage";

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
  },
  setup(props, ctx: SetupContext) {
    const data = reactive({
      jkfstr: `{"header":{},"moves":[{}]}`,
      tesuu: 0,
      tesuuMax: 0,
      kifustr: "",
      ply: props.ply,
      error: "",
      rotated: false,
      intervalId: 0,
      inGame: false,
      needAutoFetch: true,
      hasClipboard: !!navigator?.clipboard,
      activated: false,
      updated: 0,
      showDiag: false,
    });
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
    const isInGame = (player: JKFPlayer) =>
      !player.kifu.moves[player.kifu.moves.length - 1]?.comments?.some((s) =>
        s.startsWith("$END_TIME:")
      );
    const loadKifu = () => {
      const tournament = props.tournament;
      const gameid = props.gameid;
      if (!tournament || !gameid) {
        return;
      }
      data.needAutoFetch = true;
      fetch(getKifuurl())
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
        .then((text) => {
          if (props.tournament === tournament && props.gameid === gameid) {
            const newPlayer = JKFPlayer.parseCSA(text);
            const tesuuMax = newPlayer.kifu.moves.length - 1;
            const tesuu = Math.max(
              Math.min(Number.isNaN(data.ply) ? Infinity : data.ply, tesuuMax),
              0
            );
            [
              data.kifustr,
              data.error,
              data.inGame,
              data.needAutoFetch,
              data.tesuuMax,
              data.jkfstr,
              data.tesuu,
              data.activated,
            ] = [
              text,
              "",
              isInGame(newPlayer),
              isInGame(newPlayer),
              tesuuMax,
              newPlayer.toJKF(),
              tesuu,
              true,
            ];
          }
        })
        .then(() => {
          // TesuuSel用の遅延更新呼び出し
          data.updated = new Date().valueOf();
        })
        .catch((reason) => {
          console.error(reason); // eslint-disable-line no-console
          try {
            data.error = `${new Date().toISOString()} ${reason}`;
            data.activated = true;
          } catch (e) {
            console.error(e); // eslint-disable-line no-console
          }
        });
    };
    data.intervalId = setInterval(() => {
      if (data.needAutoFetch || data.inGame) {
        loadKifu();
      }
    }, 10000);
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
              text: `${props.gamename} ${data.tesuu}手目 ${readableKifu}\n\n\n`,
              url: `https://sylwi.mzr.jp/floodgate.php?tn=${
                props.tournament
              }&gi=${props.gameid}&p=${getPSfenWB64()}&gn=${encodeURIComponent(
                props.gamename || ""
              )}`,
              hashtags: "将棋,floodgate",
              via: "",
            }
          : {
              text: `${props.gamename} ${data.tesuu}手目 ${readableKifu}\n\n\n`,
              url: `https://sylwi.mzr.jp/denryu.php?tn=${props.tournament}&gi=${
                props.gameid
              }&p=${getPSfenWB64()}&gn=${encodeURIComponent(
                props.gamename || ""
              )}`,
              hashtags: "将棋,電竜戦",
              via: "",
            };
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetProp.text
        )}${tweetProp.url ? `&url=${encodeURIComponent(tweetProp.url)}` : ""}${
          tweetProp.hashtags
            ? `&hashtags=${encodeURIComponent(tweetProp.hashtags)}`
            : ""
        }${tweetProp.via ? `&via=${encodeURIComponent(tweetProp.via)}` : ""}`,
        "_blank"
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
    TesuuSel,
    ScoreGraph,
    Stage,
  },
});
</script>
