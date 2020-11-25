<template>
  <div id="app">
    <div id="nav">
      <p>
        <router-link to="/">Home</router-link> |
        <router-link to="/about">About</router-link> |
        <router-link to="/dr1_tsec_t1">電竜戦TSEC予行1</router-link> /
        <router-link to="/3d/dr1_tsec_t1">(3D)</router-link> |
        <router-link to="/floodgate">Floodgate</router-link> /
        <router-link to="/3d/floodgate">(3D)</router-link> |
        <router-link to="/dr1_production">電竜戦</router-link> /
        <router-link to="/3d/dr1_production">(3D)</router-link> |
      </p>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: "BIZ UDPGothic", "Hiragino Maru Gothic ProN",
    "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", Avenir, Helvetica, Arial,
    sans-serif;
  button,
  pre,
  input,
  select,
  code,
  textarea {
    font-family: "BIZ UDGothic", "Hiragino Maru Gothic ProN",
      "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", monospace;
  }
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  font-family: "BIZ UDPGothic", "Hiragino Maru Gothic ProN",
    "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", Avenir, Helvetica, Arial,
    sans-serif;

  p {
    margin: 0;
    vertical-align: center;
    text-align: center;
    font-size: unquote("min(2.5vh, 1em)");
  }
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
  height: unquote("min(3vh, 1.5em)");
}
</style>
