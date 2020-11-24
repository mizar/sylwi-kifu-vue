<script lang="ts">
import { defineComponent, SetupContext, h } from "vue";
import { JKFPlayer } from "json-kifu-format";
import { getTags } from "@/modules/castle";

export default defineComponent({
  props: {
    jkfstr: {
      type: String,
      required: true,
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
    return h(
      "div",
      {
        className: "tagbar",
      },
      getTags(
        this.props.jkfstr
          ? JKFPlayer.parseJKF(this.props.jkfstr)
          : new JKFPlayer({ header: {}, moves: [{}] })
      )
        .filter((tag) => !tag.hide)
        .map((tag) =>
          h(
            "button",
            {
              title: JSON.stringify(tag, undefined, 2),
              onClick: () => {
                this.tesuuChange(tag.tesuu);
              },
            },
            `${tag.name.ja_JP}:${tag.tesuu}`
          )
        )
    );
  },
});
</script>
