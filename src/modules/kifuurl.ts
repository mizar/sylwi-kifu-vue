export const getKifuMirrorUrl = (
  tournament: string,
  gameid: string
): string => {
  return tournament === "floodgate"
    ? `https://p.mzr.jp/wdoor-latest/${gameid.substring(
        gameid.length - 14,
        gameid.length - 10
      )}/${gameid.substring(
        gameid.length - 10,
        gameid.length - 8
      )}/${gameid.substring(
        gameid.length - 8,
        gameid.length - 6
      )}/${gameid}.csa`
    : `https://p.mzr.jp/denryusen/${tournament}/kifufiles/${gameid}.csa`;
};

export const getKifuOrgUrl = (tournament: string, gameid: string): string => {
  return tournament === "floodgate"
    ? `http://wdoor.c.u-tokyo.ac.jp/shogi/LATEST/${gameid.substring(
        gameid.length - 14,
        gameid.length - 10
      )}/${gameid.substring(
        gameid.length - 10,
        gameid.length - 8
      )}/${gameid.substring(
        gameid.length - 8,
        gameid.length - 6
      )}/${gameid}.csa`
    : `https://golan.sakura.ne.jp/denryusen/${tournament}/kifufiles/${gameid}.csa`;
};

export const fetchGameListMirrorUrl = (tournament: string): string => {
  return tournament === "floodgate"
    ? "https://p.mzr.jp/wdoor-latest/shogi-server.log"
    : `https://p.mzr.jp/denryusen/${tournament}/kifulist.txt`;
};

export const fetchGameListOrgUrl = (tournament: string): string => {
  return tournament === "floodgate"
    ? "http://wdoor.c.u-tokyo.ac.jp/shogi/LATEST/shogi-server.log"
    : `https://golan.sakura.ne.jp/denryusen/${tournament}/kifulist.txt`;
};
