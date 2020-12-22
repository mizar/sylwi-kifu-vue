<script lang="ts">
import { defineComponent, VNode, h } from "vue";
import { JKFPlayer } from "json-kifu-format";

export default defineComponent({
  props: {
    jkf: {
      type: String,
      required: true,
    },
    head: {
      type: String,
      required: false,
      default: () => `{}`,
    },
    foot: {
      type: String,
      required: false,
      default: () => `{}`,
    },
  },
  setup(props) {
    return {
      props,
    };
  },
  render() {
    const player = JKFPlayer.parseJKF(this.props.jkf);
    const timeManMatch = player.kifu.header.棋戦?.match(
      /^[\w.-]+\+[\w.-]+-(\d+)-(\d+)(F)?\+/
    );
    const timeMan = timeManMatch
      ? timeManMatch[3] === "F"
        ? {
            持時間: `${timeManMatch[1]}秒`,
            "1手加算": `${timeManMatch[2]}秒`,
          }
        : {
            持時間: `${timeManMatch[1]}秒`,
            秒読み: `${timeManMatch[2]}秒`,
          }
      : {};
    return h(
      "dl",
      {},
      Object.entries({
        ...(JSON.parse(this.props.head) as { [key: string]: string }),
        ...player.kifu.header,
        ...timeMan,
        ...(JSON.parse(this.props.foot) as { [key: string]: string }),
      })
        .filter(([key]) => key !== "棋戦")
        .reduce(
          (p, [key, value]) => [...p, h("dt", {}, key), h("dd", {}, value)],
          [] as VNode[]
        )
    );
  },
});
</script>
