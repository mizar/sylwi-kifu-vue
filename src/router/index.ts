import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import TournamentGL from "@/views/TournamentGL.vue";
import KifuSingleGL from "@/views/KifuSingleGL.vue";
import Tournament from "@/views/Tournament.vue";
import KifuSingle from "@/views/KifuSingle.vue";
import KifuMulti from "@/views/KifuMulti.vue";
import About from "@/views/About.vue";
import Castle from "@/views/Castle.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/castle",
    name: "Castle",
    component: Castle,
  },
  {
    path: "/3d/:tournament([\\w.+-]+)",
    name: "TournamentGL",
    component: TournamentGL,
    props: (route) => ({
      tournament: route.params.tournament,
      limitTimeDur: +(route.query.lt || Infinity),
      limitNumber: +(route.query.ln || 20),
      hideTags: route.query.tags === "0" || route.query.s === "1",
      hideGraph: route.query.graph === "0" || route.query.s === "1",
      hideTools: route.query.tools === "0",
      hideComments: route.query.comments === "0",
      gameNameInclude: route.query.name,
      gameIdInclude: route.query.id,
    }),
  },
  {
    path: "/3d/:tournament([\\w.+-]+)/:gameid([\\w.+-]+\\+\\d+)/:ply(\\d+)?",
    name: "KifuSingleGL",
    component: KifuSingleGL,
    props: true,
  },
  {
    path: "/:tournament([\\w.+-]+)",
    name: "Tournament",
    component: Tournament,
    props: (route) => ({
      tournament: route.params.tournament,
      limitTimeDur: +(route.query.lt || Infinity),
      limitNumber: +(route.query.ln || 20),
      hideTags: route.query.tags === "0" || route.query.s === "1",
      hideGraph: route.query.graph === "0" || route.query.s === "1",
      hideTools: route.query.tools === "0",
      hideComments: route.query.comments === "0",
      gameNameInclude: route.query.name,
      gameIdInclude: route.query.id,
    }),
  },
  {
    path: "/:tournament([\\w.+-]+)/multi",
    name: "KifuMulti",
    component: KifuMulti,
    props: (route) => ({
      tournament: route.params.tournament,
      limitTimeDur: +(route.query.lt || Infinity),
      limitNumber: +(route.query.ln || Infinity),
      hideTags: route.query.tags === "0" || route.query.s === "1",
      hideGraph: route.query.graph === "0" || route.query.s === "1",
      hideTools: route.query.tools === "0",
      hideComments: route.query.comments === "0",
      gameNameInclude: route.query.name,
      gameIdInclude: route.query.id,
    }),
  },
  {
    path: "/:tournament([\\w.+-]+)/:gameid([\\w.+-]+\\+\\d+)/:ply(\\d+)?",
    name: "KifuSingle",
    component: KifuSingle,
    props: true,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
