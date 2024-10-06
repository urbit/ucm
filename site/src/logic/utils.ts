import type { NotRetardedInline, Paragraph, Ship } from "./types";
import { patp2dec, isValidPatp } from "./ob/co";
import { Renderer, Token, marked } from "marked";
import { REF_REGEX, SHIP_REGEX } from "./constants";
import { unEscape } from "./tlon-helpers";
import type {
  GraphStoreNode,
  AssociationGraph,
  Association,
  GSResource,
  Graph,
  Contacts,
  Pals,
  Contact,
  Content,
  Inline,
} from "./types-tlon";

export function addScheme(url: string) {
  if (url.includes("localhost")) {
    return `http://${url.replace("http://", "")}`;
  } else {
    return `https://${url.replace("http://", "")}`;
  }
}

export function easyCode(code: string) {
  const string = code.replace(/-/g, "");
  const matches = string.match(/.{1,6}/g);
  if (matches) return matches.join("-");
}

export function tilde(patp: Ship) {
  if (patp[0] == "~") {
    return patp;
  } else {
    return "~" + patp;
  }
}

export function color_to_hex(color: string) {
  let hex = "#" + color.replace(".", "").replace("0x", "").toUpperCase();
  if (hex == "#0") {
    hex = "#000000";
  }
  return hex;
}

export function date_diff(date: number | Date, type: "short" | "long") {
  const now = new Date().getTime();
  const diff = now - new Date(date).getTime();
  if (type == "short") {
    return to_string(diff / 1000);
  } else {
    return to_string_long(diff / 1000);
  }
}

function to_string(s: number) {
  if (s < 60) {
    return "now";
  } else if (s < 3600) {
    return `${Math.ceil(s / 60)}m`;
  } else if (s < 86400) {
    return `${Math.ceil(s / 60 / 60)}h`;
  } else if (s < 2678400) {
    return `${Math.ceil(s / 60 / 60 / 24)}d`;
  } else if (s < 32140800) {
    return `${Math.ceil(s / 60 / 60 / 24 / 30)}mo`;
  } else {
    return `${Math.ceil(s / 60 / 60 / 24 / 30 / 12)}y`;
  }
}

function to_string_long(s: number) {
  if (s < 60) {
    return "right now";
  } else if (s < 3600) {
    return `${Math.ceil(s / 60)} minutes ago`;
  } else if (s < 86400) {
    return `${Math.ceil(s / 60 / 60)} hours ago`;
  } else if (s < 2678400) {
    return `${Math.ceil(s / 60 / 60 / 24)} days ago`;
  } else if (s < 32140800) {
    return `${Math.ceil(s / 60 / 60 / 24 / 30)} months ago`;
  } else {
    return `${Math.ceil(s / 60 / 60 / 24 / 30 / 12)} years ago`;
  }
}

export function regexes() {
  const IMAGE_REGEX = new RegExp(/(jpg|img|png|gif|tiff|jpeg|webp|webm|svg)$/i);
  const AUDIO_REGEX = new RegExp(/(mp3|wav|ogg)$/i);
  const VIDEO_REGEX = new RegExp(/(mov|mp4|ogv)$/i);
  return { img: IMAGE_REGEX, aud: AUDIO_REGEX, vid: VIDEO_REGEX };
}

export function buildDM(author: Ship, recipient: Ship, contents: Content[]) {
  const node: any = {};
  const point = patp2dec(recipient);
  const index = `/${point}/${makeIndex()}`;
  node[index] = {
    children: null,
    post: {
      author: author,
      contents: contents,
      hash: null,
      index: index,
      signatures: [],
      "time-sent": Date.now(),
    },
  };
  return {
    app: "dm-hook",
    mark: "graph-update-3",
    json: {
      "add-nodes": {
        resource: { name: "dm-inbox", ship: author },
        nodes: node,
      },
    },
  };
}

export function buildChatPost(
  author: Ship,
  resource: GSResource,
  c: Content[],
) {
  const index = `/${makeIndex()}`;
  return {
    "add-nodes": {
      resource: { name: resource.name, ship: resource.entity },
      nodes: {
        [index]: {
          children: null,
          post: {
            author: author,
            contents: c,
            hash: null,
            index: index,
            signatures: [],
            "time-sent": Date.now(),
          },
        },
      },
    },
  };
}

export function buildNotebookPost(
  author: Ship,
  resource: GSResource,
  c: Content[],
) {
  const index = `/${makeIndex()}`;
  const node: GraphStoreNode = {
    children: {
      "1": {
        post: {
          author: author,
          contents: [],
          hash: null,
          index: index + "/1",
          signatures: [],
          "time-sent": Date.now(),
        },
        children: {
          "1": {
            children: null,
            post: {
              author: author,
              contents: c,
              hash: null,
              index: index + "/1/1",
              signatures: [],
              "time-sent": Date.now(),
            },
          },
        },
      },
      "2": {
        children: null,
        post: {
          author: author,
          contents: [],
          hash: null,
          index: index + "/2",
          signatures: [],
          "time-sent": Date.now(),
        },
      },
    },
    post: {
      author: author,
      contents: [],
      hash: null,
      index: index,
      signatures: [],
      "time-sent": Date.now(),
    },
  };
  const graph = { [index]: node };
  return {
    "add-nodes": {
      resource: { name: resource.name, ship: resource.entity },
      nodes: graph,
    },
  };
}
export function buildCollectionPost(
  author: Ship,
  resource: GSResource,
  c: Content[],
) {
  const index = `/${makeIndex()}`;
  const node: GraphStoreNode = {
    children: null,
    post: {
      author: author,
      contents: c,
      hash: null,
      index: index,
      signatures: [],
      "time-sent": Date.now(),
    },
  };
  const graph: Graph = { [index]: node };
  return {
    "add-nodes": {
      resource: { name: resource.name, ship: resource.entity },
      nodes: graph,
    },
  };
}

export function makeIndex(): string {
  const DA_UNIX_EPOCH = BigInt("170141184475152167957503069145530368000");
  const DA_SECOND = BigInt("18446744073709551616");
  const timeSinceEpoch = (BigInt(Date.now()) * DA_SECOND) / BigInt(1000);
  return (DA_UNIX_EPOCH + timeSinceEpoch).toString();
}
export function makeDottedIndex() {
  const DA_UNIX_EPOCH = BigInt("170141184475152167957503069145530368000");
  const DA_SECOND = BigInt("18446744073709551616");
  const timeSinceEpoch = (BigInt(Date.now()) * DA_SECOND) / BigInt(1000);
  const index = (DA_UNIX_EPOCH + timeSinceEpoch).toString();
  return index.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function nodeToText(n: GraphStoreNode): string {
  const c = n.post.contents;
  return c.reduce((acc, item) => {
    if ("text" in item) return acc + item.text;
    else if ("mention" in item) return acc + item.mention;
    else return acc;
  }, "");
}

export function nodesFromGraphUpdate(g: any): GraphStoreNode[] {
  const nodes = g["graph-update"]["add-nodes"]["nodes"];
  return Object.keys(nodes).map((n) => nodes[n]);
}

export function cleanMetadata(metadata: AssociationGraph): Association[] {
  const all: Association[] = Object.values(metadata);
  const graphs = all.filter((a) => a["app-name"] === "graph");
  return graphs.map((g) => {
    const gn = `${g.group}/groups${g.group}`;
    const gn2 = `${g.group}/graph${g.group}`;
    const group = metadata[gn] || metadata[gn2];
    if (!group) console.log(g, "you lack metadata for this graph");
    const title = group ? group.metadata.title : "error";
    return { ...g, ...{ groupName: title } };
  });
}

export function abbreviateChat(s: string): string {
  const plist = s.trim().split(" ");
  if (isValidPatp(plist[0]) && plist.length > 1) {
    return `${plist[0]} & ${plist.length - 1}+`;
  } else if (s.length < 25) return s;
  else return `${s.substring(0, 25)}...`;
}

export function timestring(n: number): string {
  const nn = new Date(n);
  return nn.toTimeString().slice(0, 5);
}
export function wait(ms: number) {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, ms);
  });
}

export function checkTilde(s: string) {
  if (s[0] === "~") return s;
  else return "~" + s;
}

export function addDots(s: string, num: number): string {
  const reversed = s.split("").reverse().join("");
  const reg = new RegExp(`.{${num}}`, "g");
  const withCommas = reversed.replace(reg, "$&.");
  return withCommas.split("").reverse().join("").slice(1);
}
export function addDots5(s: string): string {
  const reversed = s.split("").reverse().join("");
  const withCommas = reversed.replace(/.{5}/g, "$&.");
  return withCommas.split("").reverse().join("");
}
// TODO
export function isTwatterLink(s: string) {
  const sp = s
    .replace("https://", "")
    .split("/")
    .filter((s) => s);
  return sp.length === 4 && sp[0] === "twitter.com" && sp[2] === "status";
}
export const isSortugLink = (s: string) => !!s.match(REF_REGEX);

export const markdownRenderer: Partial<Renderer> = {
  // paragraph(content: any) {
  //   // console.log(content, "rendering")
  //   return content;
  // },
  // text(text: string) {
  //   return text;
  // },
  // codespan(code, lang) {
  //   console.log(code, "code");
  //   console.log(lang, "lang");
  //   return ""
  // },
};

export function auraToHex(s: string): string {
  if (s.startsWith("0x")) {
    let numbers = s.replace("0x", "").replace(".", "");
    while (numbers.length < 6) {
      numbers = "0" + numbers;
    }
    return "#" + numbers;
  } else if (s.startsWith("#")) return s;
  else {
    // console.log(s, "weird hex");
    return "black";
  }
}

// default cursors
export function makeNewestIndex() {
  const DA_UNIX_EPOCH = BigInt("170141184475152167957503069145530368000");
  const DA_SECOND = BigInt("18446744073709551616");
  const timeSinceEpoch = (BigInt(Date.now()) * DA_SECOND) / BigInt(1000);
  return (DA_UNIX_EPOCH + timeSinceEpoch).toString();
}
export const startCursor = makeNewestIndex();
export const endCursor = "0";

export function displayCount(c: number): string {
  if (c === 0) return "";
  else if (c < 1_000) return `${c}`;
  else if (c >= 1_000 && c < 1_000_000) return `${Math.round(c / 1_00) / 10}K`;
  else if (c >= 1_000_000) return `${Math.round(c / 100_000) / 10}M`;
  else return "";
}
export function isWhiteish(hex: string): boolean {
  if (hex.indexOf("#") === 0) hex = hex.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return r > 200 && g > 200 && b > 200;
}

export function localISOString(date: Date) {
  const offset = new Date().getTimezoneOffset();
  const localts = date.getTime() - offset * 60_000;
  return new Date(localts).toISOString().slice(0, 16);
}

export function goback() {
  window.history.back();
}

export function reverseRecord(
  a: Record<string, string>,
): Record<string, string> {
  return Object.entries(a).reduce((acc: any, [k, v]) => {
    acc[v] = k;
    return acc;
  }, {});
}

function contactMatch(contact: Contact, input: string): boolean {
  return (
    (contact.nickname || "").includes(input) ||
    (contact.avatar || "").includes(input) ||
    (contact.cover || "").includes(input) ||
    (contact.bio || "").includes(input) ||
    (contact.status || "").includes(input) ||
    (contact.color || "").includes(input)
  );
}

export function getColorHex(color: string): string {
  if (color.startsWith("0x"))
    return `#${padString(stripFuckingDots(color), 6)}`;
  else if (color.startsWith("#") && color.length === 7) return color;
  else if (color.length === 6) return `#${color}`;
  else {
    console.log(color, "something weird with this color");
    return "#FFFFFF";
  }
}

export function stripFuckingDots(hex: string) {
  return hex.replace("0x", "").replaceAll(".", "");
}
export function padString(s: string, size: number) {
  if (s.length >= size) return s;
  else return padString(`0${s}`, size);
}
export function isDark(hexColor: string): boolean {
  const r = parseInt(hexColor.substring(1, 2), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  const sr = r / 255;
  const sg = g / 255;
  const sb = b / 255;
  const rSrgb =
    sr <= 0.03928 ? sr / 12.92 : Math.pow((sr + 0.055) / 1.055, 2.4);
  const gSrgb =
    sg <= 0.03928 ? sg / 12.92 : Math.pow((sg + 0.055) / 1.055, 2.4);
  const bSrgb =
    sb <= 0.03928 ? sb / 12.92 : Math.pow((sb + 0.055) / 1.055, 2.4);

  // Calculate luminance
  const luminance = 0.2126 * rSrgb + 0.7152 * gSrgb + 0.0722 * bSrgb;
  return luminance < 0.12;
}

export function checkIfClickedOutside(
  e: React.MouseEvent,
  el: HTMLElement,
  close: any,
) {
  e.stopPropagation();
  if (el.contains(e.currentTarget)) close();
}

export function generateRandomBase64(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .slice(0, 4)
    .toLowerCase();
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function retardedTlonTokens(tokens: Inline[]): Paragraph[] {
  let ps: Paragraph[] = [];
  ps.push([]);
  for (const token of tokens) {
    const currentP: NotRetardedInline[] = ps[ps.length - 1];
    if (typeof token === "string") currentP.push({ text: token });
    else if ("break" in token) ps.push([] as NotRetardedInline[]);
    else if ("blockquote" in token) {
      ps.push([token]);
      ps.push([] as NotRetardedInline[]);
    } else currentP.push(token);
  }
  return ps;
}
export function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
export function displayAnon(ship: Ship): string {
  if (ship.length > 30) return "anon";
  else return ship;
}
