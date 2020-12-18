<script lang="ts">
import { defineComponent, SetupContext, h } from "vue";
import { JKFPlayer } from "json-kifu-format";
import { getTags } from "@/modules/castle";
import { useStore } from "vuex";

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
    jkfstr: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx: SetupContext) {
    const store = useStore();
    if (props.tournament.startsWith("dr") && props.gameid.includes("+buoy_")) {
      store.dispatch("shogiServer/fetchBuoy", { tournament: props.tournament });
    }
    return {
      props,
      tesuuChange: (ply: number) => {
        ctx.emit("tesuu-change", { ply });
      },
      store,
    };
  },
  render() {
    const buoyentry = this.store.getters["shogiServer/getBuoy"](
      this.props.tournament,
      this.props.gameid.match(/^[A-Za-z0-9_-]+\+buoy_([A-Za-z0-9.-]+)/)?.[1] ??
        ""
    );
    return h(
      "div",
      {
        className: "tagbar",
      },
      getTags(
        this.props.jkfstr
          ? JKFPlayer.parseJKF(this.props.jkfstr)
          : new JKFPlayer({ header: {}, moves: [{}] }),
        {
          buoy: buoyentry,
        }
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
