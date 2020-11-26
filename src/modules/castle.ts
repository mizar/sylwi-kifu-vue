import { Piece } from "shogi.js";
import { JKFPlayer } from "json-kifu-format";

export const turn_readable = (p: string): string => {
  switch (p) {
    case "P":
    case "+P":
    case "L":
    case "+L":
    case "N":
    case "+N":
    case "S":
    case "+S":
    case "G":
    case "+G":
    case "B":
    case "+B":
    case "R":
    case "+R":
    case "K":
    case "+K":
      return "☗";
    case "p":
    case "+p":
    case "l":
    case "+l":
    case "n":
    case "+n":
    case "s":
    case "+s":
    case "g":
    case "+g":
    case "b":
    case "+b":
    case "r":
    case "+r":
    case "k":
    case "+k":
      return "☖";
    default:
      return "";
  }
};

export const piece_readable = (p: string): string => {
  switch (p.toLowerCase()) {
    case "p":
      return "歩";
    case "+p":
      return "と";
    case "l":
      return "香";
    case "+l":
      return "成香";
    case "n":
      return "桂";
    case "+n":
      return "成桂";
    case "s":
      return "銀";
    case "+s":
      return "成銀";
    case "g":
      return "金";
    case "+g":
      return "成金";
    case "b":
      return "角";
    case "+b":
      return "馬";
    case "r":
      return "飛";
    case "+r":
      return "龍";
    case "k":
      return "玉";
    case "+k":
      return "成玉";
    case "_":
      return "(空)";
    case "+_":
      return "(成空)";
    default:
      return "";
  }
};

export const sq_readable = (sq: string): string =>
  `${
    ({
      "1": "１",
      "2": "２",
      "3": "３",
      "4": "４",
      "5": "５",
      "6": "６",
      "7": "７",
      "8": "８",
      "9": "９",
    } as { [file: string]: string })[sq.substring(0, 1)]
  }${
    ({
      a: "一",
      b: "二",
      c: "三",
      d: "四",
      e: "五",
      f: "六",
      g: "七",
      h: "八",
      i: "九",
    } as { [rank: string]: string })[sq.substring(1, 2)]
  }`;

export type CastleOrgEntryType = {
  id: string; // タグ管理名
  name: {
    ja_JP: string; // 日本語名
    en_US?: string; // 英語名
  };
  pieces?: string[]; // 駒リスト(AND条件)
  moves?: string[]; // 動作リスト(OR条件)
  capture?: string[]; // 捕獲駒種(OR条件)
  hand?: string[]; // 持駒種リスト(AND条件)
  hand_exclude?: string[]; // 持駒除外種リスト(NOT OR条件)
  special?: string; // 特殊(投了・千日手など)
  tags_required?: string[]; // 必須タグリスト(AND条件)
  tags_exclude?: string[]; // 除外タグリスト(NOT OR条件)
  tags_disable?: string[]; // 成立時非表示化タグリスト
  tesuu_min?: number; // 最小手数条件
  tesuu_max: number; // 最大手数条件
  hide?: boolean; // デフォルト非表示
  noturn?: boolean; // (先/後)手番拡張
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const castleOrgData = require("@/assets/castle/castle.json") as CastleOrgEntryType[];

export type CastleEntryType = {
  id: string; // タグ管理名
  name: {
    ja_JP: string; // 日本語名
    en_US: string; // 英語名
  };
  pieces?: string[]; // 駒リスト(AND条件)
  moves?: string[]; // 動作リスト(OR条件)
  capture?: string[]; // 捕獲駒種(OR条件)
  hand?: string[]; // 持駒種リスト(AND条件)
  hand_exclude?: string[]; // 持駒除外種リスト(NOT OR条件)
  special?: string; // 特殊(投了・千日手など)
  tags_required?: string[]; // 必須タグリスト(AND条件)
  tags_exclude?: string[]; // 除外タグリスト(NOT OR条件)
  tags_disable?: string[]; // 成立時非表示化タグリスト
  tesuu_min?: number; // 最小手数条件
  tesuu_max: number; // 最大手数条件
  hide?: boolean; // デフォルト非表示
};
export const conv_readable_pieces = (p: string): string => {
  const _m = p.match(/^(\+?[_PLNSGBRKplnsgbrk])\*([1-9][a-i])$/);
  return _m
    ? `${turn_readable(_m[1])}${sq_readable(_m[2])}${piece_readable(_m[1])}`
    : "";
};
export const conv_readable_hand = (p: string): string => {
  const _m = p.match(/^(\+?[PLNSGBRKplnsgbrk])$/);
  return _m ? `${turn_readable(_m[1])}${piece_readable(_m[1])}` : "";
};
export const conv_readable_moves = (m: string): string => {
  const _m = m.match(
    /^(\+?[PLNSGBRKplnsgbrk])\*([1-9][a-i])([1-9][a-i])(\+?)$/
  );
  return _m
    ? `${turn_readable(_m[1])}${sq_readable(_m[2])}${piece_readable(
        _m[1]
      )}→${turn_readable(_m[1])}${sq_readable(_m[3])}${piece_readable(
        `${_m[4]}${_m[1]}`
      )}`
    : "";
};
export const conv_readable_capture = (p: string): string =>
  `${turn_readable(p)}${piece_readable(p)}`;
export const castle = castleOrgData
  .reduce<CastleEntryType[]>((r, e) => {
    if (e.noturn) {
      r.push({
        id: e.id,
        name: {
          ja_JP: e.name.ja_JP,
          en_US: e.name.en_US || e.id,
        },
        pieces: e.pieces,
        moves: e.moves,
        capture: e.capture,
        hand: e.hand,
        hand_exclude: e.hand_exclude,
        special: e.special,
        tags_required: e.tags_required,
        tags_exclude: e.tags_exclude,
        tags_disable: e.tags_disable,
        tesuu_min: e.tesuu_min,
        tesuu_max: e.tesuu_max,
        hide: e.hide,
      });
    } else {
      delete e.noturn;
      const revPiece = (p: string) =>
        p.replace(/[A-Za-z]/, (c) => String.fromCharCode(c.charCodeAt(0) ^ 32));
      const revSquare = (sq: string) =>
        sq
          .replace(/[1-9]/, (c) => String.fromCharCode(106 - c.charCodeAt(0)))
          .replace(/[a-i]/, (c) => String.fromCharCode(202 - c.charCodeAt(0)));
      r.push({
        id: `SENTE_${e.id}`,
        name: {
          ja_JP: `先手${e.name.ja_JP}`,
          en_US: `SENTE_${e.name.en_US || e.id}`,
        },
        pieces: e.pieces?.map((p) => p),
        moves: e.moves?.map((m) => m),
        capture: e.capture?.map((p) => p),
        hand: e.hand?.map((p) => p),
        hand_exclude: e.hand_exclude?.map((p) => p),
        special: e.special,
        tags_required: e.tags_required?.map((t) => `SENTE_${t}`),
        tags_exclude: e.tags_exclude?.map((t) => `SENTE_${t}`),
        tags_disable: e.tags_disable?.map((t) => `SENTE_${t}`),
        tesuu_min: e.tesuu_min,
        tesuu_max: e.tesuu_max,
        hide: e.hide,
      });
      r.push({
        id: `GOTE_${e.id}`,
        name: {
          ja_JP: `後手${e.name.ja_JP}`,
          en_US: `GOTE_${e.name.en_US || e.id}`,
        },
        pieces: e.pieces?.map((p) => {
          const _m = p.match(/^(\+?[_PLNSGBRKplnsgbrk])\*([1-9][a-i])$/);
          return _m ? `${revPiece(_m[1])}*${revSquare(_m[2])}` : "";
        }),
        hand: e.hand?.map((p) => {
          const _m = p.match(/^(\+?[PLNSGBRKplnsgbrk])$/);
          return _m ? `${revPiece(_m[1])}` : "";
        }),
        hand_exclude: e.hand_exclude?.map((p) => {
          const _m = p.match(/^(\+?[PLNSGBRKplnsgbrk])$/);
          return _m ? `${revPiece(_m[1])}` : "";
        }),
        special: e.special,
        moves: e.moves?.map((m) => {
          const _m = m.match(
            /^(\+?[PLNSGBRKplnsgbrk])\*([1-9][a-i])([1-9][a-i])(\+?)$/
          );
          return _m
            ? `${revPiece(_m[1])}*${revSquare(_m[2])}${revSquare(_m[3])}${
                _m[4]
              }`
            : "";
        }),
        capture: e.capture?.map((p) => revPiece(p)),
        tags_required: e.tags_required?.map((t) => `GOTE_${t}`),
        tags_exclude: e.tags_exclude?.map((t) => `GOTE_${t}`),
        tags_disable: e.tags_disable?.map((t) => `GOTE_${t}`),
        tesuu_min: e.tesuu_min,
        tesuu_max: e.tesuu_max,
        hide: e.hide,
      });
    }
    return r;
  }, [])
  .map((e) =>
    Object.assign({}, e, {
      pieces_readable: e.pieces?.map(conv_readable_pieces),
      hand_readable: e.hand?.map(conv_readable_hand),
      hand_exclude_readable: e.hand_exclude?.map(conv_readable_hand),
      moves_readable: e.moves?.map(conv_readable_moves),
      capture_readable: e.capture?.map(conv_readable_capture),
    })
  );

export type TagRet = {
  id: string;
  name: {
    ja_JP: string;
    en_US: string;
  };
  pieces?: string[];
  moves?: string[];
  capture?: string[];
  hand?: string[];
  hand_exclude?: string[];
  tags_required?: string[];
  tags_exclude?: string[];
  tags_disable?: string[];
  tesuu_max: number;
  hide?: boolean;
  tesuu: number;
};
export type TagsRet = TagRet[];

export const getTags = (player: JKFPlayer): TagsRet =>
  player.kifu.moves.reduce<
    {
      id: string;
      name: {
        ja_JP: string;
        en_US: string;
      };
      pieces?: string[];
      moves?: string[];
      capture?: string[];
      hand?: string[];
      hand_exclude?: string[];
      tags_required?: string[];
      tags_exclude?: string[];
      tags_disable?: string[];
      tesuu_max: number;
      hide?: boolean;
      tesuu: number;
    }[]
  >((p, v, i) => {
    player.goto(i);
    castle.forEach((c) => {
      if (
        !(
          c.tesuu_max < i ||
          (c.tesuu_min && c.tesuu_min > i) ||
          p.some((t) => t.id === c.id) ||
          (c.tags_required &&
            c.tags_required.some((te) => !p.some((_te) => _te.id === te))) ||
          c.pieces?.some((p) => {
            const pm = p.match(/^(\+?[_PLNSGBRKplnsgbrk])\*([1-9])([a-i])$/);
            if (!pm) {
              return false;
            }
            const bp = player.shogi.get(
              pm[2].charCodeAt(0) - 48,
              pm[3].charCodeAt(0) - 96
            );
            if (!bp) {
              return pm[1] !== "_";
            }
            return pm[1] !== bp.toSFENString();
          }) ||
          c.hand?.some((p) =>
            player.shogi.hands[Piece.fromSFENString(p).color].every(
              (v) => p !== v.toSFENString()
            )
          ) ||
          c.hand_exclude?.some((p) =>
            player.shogi.hands[Piece.fromSFENString(p).color].some(
              (v) => p === v.toSFENString()
            )
          ) ||
          (c.special && v.special !== c.special) ||
          (c.moves?.length &&
            c.moves?.every((m) => {
              const pm = m.match(
                /(\+?[PLNSGBRKplnsgbrk])\*([1-9])([a-i])([1-9])([a-i])(\+?)/
              );
              if (!pm || !v.move) {
                return true;
              }
              return (
                v.move.piece !==
                  Piece.fromSFENString(pm[1]).toCSAString().substring(1) ||
                v.move.from?.x !== pm[2].charCodeAt(0) - 48 ||
                v.move.from?.y !== pm[3].charCodeAt(0) - 96 ||
                v.move.to?.x !== pm[4].charCodeAt(0) - 48 ||
                v.move.to?.y !== pm[5].charCodeAt(0) - 96 ||
                !!v.move.promote !== (pm[6] === "+")
              );
            })) ||
          (c.capture?.length &&
            c.capture?.every(
              (p) =>
                v.move?.capture !==
                Piece.fromSFENString(p).toCSAString().substring(1)
            ))
        )
      ) {
        c.tags_disable?.forEach((t) => {
          p.filter((te) => te.id === t).forEach((te) => {
            te.hide = true;
          });
        });
        const tag = Object.assign({}, c, {
          tesuu: i,
          hide:
            c.hide ||
            c.tags_exclude?.some((te) => p.some((_te) => _te.id === te)) ||
            undefined,
        });
        for (const [key, value] of Object.entries(tag)) {
          if (value === null || value === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (tag as any)[key];
          }
        }
        p.push(tag);
      }
    });
    v.comments?.forEach((comment) => {
      if (i === 0) {
        const _buoy = comment.match(/^buoy game starting with ([0-9]+) moves$/);
        if (_buoy) {
          p.push({
            id: "BUOY",
            name: {
              ja_JP: "指定局面",
              en_US: "BUOY",
            },
            tesuu_max: 1e9,
            tesuu: +_buoy[1],
          });
        }
      }
      const _ma = comment.match(
        /^summary:([0-9A-Za-z_. -]+):([0-9A-Za-z_.-]+) (lose|draw|win):([0-9A-Za-z_.-]+) (lose|draw|win)$/
      );
      if (!_ma) {
        return;
      }
      // MAX_MOVES
      switch (_ma[1]) {
        case "uchifuzume":
          p.push({
            id: "UCHIFUZUME",
            name: {
              ja_JP: "打ち歩詰め",
              en_US: "UCHIFUZUME",
            },
            tesuu_max: 1e9,
            tesuu: i,
          });
          break;
        case "abnormal":
          p.push({
            id: "ABNORMAL",
            name: {
              ja_JP: "異常終了",
              en_US: "ABNORMAL",
            },
            tesuu_max: 1e9,
            tesuu: i,
          });
          break;
        case "illegal move":
          p.push({
            id: "ILLEGAL_MOVE",
            name: {
              ja_JP: "反則手",
              en_US: "ILLEGAL_MOVE",
            },
            tesuu_max: 1e9,
            tesuu: i,
          });
          break;
        case "illegal kachi":
          p.push({
            id: "ILLEGAL_KACHI",
            name: {
              ja_JP: "反則勝ち宣言",
              en_US: "ILLEGAL_KACHI",
            },
            tesuu_max: 1e9,
            tesuu: i,
          });
          break;
        case "oute_kaihimore":
          p.push({
            id: "OUTE_KAIHIMORE",
            name: {
              ja_JP: "王手回避漏れ",
              en_US: "OUTE_KAIHIMORE",
            },
            tesuu_max: 1e9,
            tesuu: i,
          });
          break;
        case "oute_sennichite":
          p.push({
            id: "OUTE_SENNICHITE",
            name: {
              ja_JP: "王手千日手",
              en_US: "OUTE_SENNICHITE",
            },
            tesuu_max: 1e9,
            tesuu: i,
          });
          break;
        case "max_moves":
          p.push({
            id: "MAX_MOVES",
            name: {
              ja_JP: "最大手数",
              en_US: "MAX_MOVES",
            },
            tesuu_max: 1e9,
            tesuu: i,
          });
          break;
      }
      // WIN / LOSE / DRAW
      if (_ma[3] === "draw" && _ma[5] === "draw") {
        p.push({
          id: "DRAW",
          name: {
            ja_JP: "引き分け",
            en_US: "DRAW",
          },
          tesuu_max: 1e9,
          tesuu: i,
        });
      } else if (_ma[3] === "win" && _ma[5] === "lose") {
        p.push({
          id: "SENTE_WIN",
          name: {
            ja_JP: "先手勝ち",
            en_US: "SENTE_WIN",
          },
          tesuu_max: 1e9,
          tesuu: i,
        });
      } else if (_ma[3] === "lose" && _ma[5] === "win") {
        p.push({
          id: "GOTE_WIN",
          name: {
            ja_JP: "後手勝ち",
            en_US: "GOTE_WIN",
          },
          tesuu_max: 1e9,
          tesuu: i,
        });
      }
    });
    return p;
  }, []);
