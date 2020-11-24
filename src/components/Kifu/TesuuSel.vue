<script lang="ts">
import { defineComponent, SetupContext, h } from "vue";
import { JKFPlayer } from "json-kifu-format";

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
    updated: {
      type: Number,
      required: false,
    },
  },
  setup(props, ctx: SetupContext) {
    return {
      props,
      tesuuChange: (ply: number) => {
        ctx.emit("tesuu-change", { ply });
      },
    };
  },
  render() {
    const player = JKFPlayer.parseJKF(this.props.jkf);
    return h(
      "select",
      {
        className: "tesuu",
        value: this.props.tesuu,
        size: 7,
        onChange: (ev: Event) => {
          if (ev.target instanceof HTMLSelectElement) {
            this.tesuuChange(parseInt(ev.target.value));
          }
        },
      },
      player.kifu.moves.map((_, i) =>
        h(
          "option",
          { value: i },
          `${player.getComments(i).length ? "*" : "\u00A0"}${
            10 > i ? "\u00A0\u00A0" : 100 > i ? "\u00A0" : ""
          }${i}${player.getReadableKifu(i)}`
        )
      )
    );
  },
});
</script>
