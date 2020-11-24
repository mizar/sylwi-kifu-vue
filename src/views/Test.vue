<style lang="scss">
canvas {
  width: 98vw;
  height: 90vh;
}
</style>

<script lang="ts">
import { defineComponent, SetupContext, reactive, h } from "vue";
import { Stage } from "@/modules/ShogiGL/stage";

export default defineComponent({
  props: {},
  setup(props, ctx: SetupContext) {
    const data = reactive({});
    ctx;
    return {
      props,
      data,
    };
  },
  render() {
    return h(Stage, {
      jkf: `{"header":{},"moves":[{}]}`,
      tesuu: 0,
      rotated: false,
    });
  },
  components: {
    Stage,
  },
});
</script>
