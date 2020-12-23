<script lang="ts">
import { defineComponent, h, SetupContext } from "vue";
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
    rotated: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, ctx: SetupContext) {
    return {
      props,
      tesuuDiff: (plydiff: number) => {
        ctx.emit("tesuu-diff", { plydiff });
      },
    };
  },
  render() {
    const player = JKFPlayer.parseJKF(this.props.jkf);
    player.goto(this.props.tesuu);
    const rotated = this.props.rotated;
    const mv =
      player.getMove() ??
      (player.tesuu > 0
        ? player.getMove(player.tesuu - 1) ??
          (player.tesuu > 1 ? player.getMove(player.tesuu - 2) : undefined)
        : undefined);
    return h(
      "div",
      {
        className: "ban",
      },
      (!rotated
        ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        : [0, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      ).map((r) =>
        h(
          "div",
          { className: "rank" },
          (!rotated
            ? [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
          ).map((f, x) => {
            if (r < 1) {
              return h(
                "div",
                { className: f > 0 ? "filenum" : "" },
                " １２３４５６７８９"[f]
              );
            }
            if (f < 1) {
              return h(
                "div",
                { className: r > 0 ? "ranknum" : "" },
                " 一二三四五六七八九"[r]
              );
            }
            const pObj = player.shogi.board[f - 1][r - 1];
            return h(
              "div",
              {
                className: `square${
                  mv?.from?.x === f && mv?.from?.y === r ? " fromsq" : ""
                }${mv?.to?.x === f && mv?.to?.y === r ? " tosq" : ""}`,
                onClick: () => {
                  if (x < 4) {
                    this.tesuuDiff(-1);
                  }
                  if (x > 4) {
                    this.tesuuDiff(1);
                  }
                },
              },
              h(
                "div",
                {
                  title: pObj?.kind
                    ? `${pObj.color === 0 ? "+" : "-"}${pObj.kind}`
                    : "",
                },
                h("img", {
                  src: getUrl(
                    pObj ? pObj.kind : "**",
                    pObj ? (!rotated ? pObj.color : 1 - pObj.color) : 0
                  ),
                })
              )
            );
          })
        )
      )
    );
  },
});
</script>
