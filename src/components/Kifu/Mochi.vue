<script lang="ts">
import { defineComponent, VNode, h } from "vue";
import { Piece } from "shogi.js";
import { JKFPlayer } from "json-kifu-format";
import { getUrl } from "@/assets/pieces/PieceImage";

export default defineComponent({
  props: {
    jkf: {
      type: String,
      required: true,
    },
    tesuu: {
      type: Number,
      required: true,
    },
    side: {
      type: Number,
      required: true,
    },
    rotated: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    return {
      props,
    };
  },
  render() {
    const player = JKFPlayer.parseJKF(this.props.jkf);
    player.goto(this.props.tesuu);
    const side = this.props.side;
    const rotated = this.props.rotated;
    const mv =
      player.getMove() ??
      (player.tesuu > 0
        ? player.getMove(player.tesuu - 1) ??
          (player.tesuu > 1 ? player.getMove(player.tesuu - 2) : undefined)
        : undefined);
    const handPieces = (
      kind: string,
      color: number,
      side: number
    ): VNode | null => {
      const num = player.shogi.getHandsSummary(color)[kind];
      const src = getUrl(kind, side);
      return num > 0 ||
        (mv && color === mv.color && !mv.from && kind === mv.piece)
        ? h(
            "span",
            {
              className: `mochigoma${kind === "FU" ? " fu" : " fu-else"}${
                mv &&
                color === mv.color &&
                mv.capture &&
                kind === Piece.unpromote(mv.capture)
                  ? " capture"
                  : ""
              }${
                mv && color === mv.color && !mv.from && kind === mv.piece
                  ? " from"
                  : ""
              }`,
              title: `${color === 0 ? "+" : "-"}${kind} * ${num}`,
            },
            Array.from({ length: num }).map((_, i) =>
              h("img", {
                src,
                style: `position: absolute; top: 0px; left: ${
                  kind === "FU"
                    ? num < 4
                      ? i * 32
                      : 86 * (i / (num - 1))
                    : num < 2
                    ? i * 32
                    : 28 * (i / (num - 1))
                }px; z-index: ${100 - i}`,
              })
            )
          )
        : null;
    };
    return h(
      "div",
      {
        className: `mochi mochi${this.side}`,
      },
      [
        h(
          "div",
          {
            className: "tebanname",
          },
          `${side === 0 ? (rotated ? "☖" : "☗") : rotated ? "⛊" : "⛉"}${
            rotated === (side === 1)
              ? player.kifu.header.先手 || player.kifu.header.下手 || ""
              : player.kifu.header.後手 || player.kifu.header.上手 || ""
          }`
        ),
        h(
          "div",
          { className: "mochimain" },
          [
            ["HI", "KA", "KI", "GI", "KE", "KY", "FU"],
            ["FU", "KY", "KE", "GI", "KI", "KA", "HI"],
          ][side]
            .map((kind) => handPieces(kind, rotated ? 1 - side : side, side))
            .reduce((p, c) => (c ? [...p, c] : p), [] as VNode[])
        ),
      ]
    );
  },
});
</script>
