import {
  Block,
  ChatQuoteParams,
  Content,
  Essay,
  Inline,
  Listing,
  Memo,
  Nest,
  Reply,
  Seal,
  Verse,
  Writ,
} from "./types-tlon";
import { Ship } from "./types";
import { Token, Tokens, marked } from "marked";
import { isValidPatp } from "./ob/co";
import { addDots5, makeDottedIndex } from "./utils";
import { REF_REGEX, SHIP_REGEX } from "./constants";
export function buildMemo(author: Ship, content: Content): Memo {
  return {
    author,
    sent: Date.now(),
    content,
  };
}
export function buildEssay(author: Ship, content: Content): Essay {
  return {
    author,
    sent: Date.now(),
    content,
    "kind-data": { chat: null },
  };
}

export function buildClubPost(author: Ship, chatID: string, essay: Essay) {
  // ids now are ~ship/170.123...
  const { "kind-data": _, ...memo } = essay;
  const index = makeDottedIndex();
  const id = `${author}/${index}`;
  const json = {
    id: chatID,
    diff: {
      uid: "0v3",
      delta: {
        writ: {
          id,
          delta: {
            add: {
              time: null,
              kind: null,
              memo,
            },
          },
        },
      },
    },
  };
  return {
    app: "chat",
    mark: "chat-club-action-0",
    json,
  };
}
export function buildNDM(author: Ship, ship: Ship, memo: Memo) {
  // ids now are ~ship/170.123...
  const index = makeDottedIndex();
  const id = `${author}/${index}`;
  const json = {
    ship,
    diff: {
      id: id,
      delta: {
        add: {
          time: null,
          kind: null,
          memo,
        },
      },
    },
  };
  return {
    app: "chat",
    mark: "chat-dm-action",
    json,
  };
}
export function buildNChatPost(nes: Nest, essay: Essay) {
  const nest = nestToString(nes);
  // ids now are ~ship/170.123...
  const json = {
    channel: {
      nest,
      action: {
        post: {
          add: essay,
        },
      },
    },
  };
  return {
    app: "channels",
    mark: "channel-action",
    json,
  };
}
export function buildDMReply(
  our: Ship,
  ship: Ship,
  author: Ship,
  parent: string,
  memo: Memo,
) {
  const id = makeDottedIndex();
  const json = {
    ship,
    diff: {
      id: `${author}/${parent}`,
      delta: {
        reply: {
          meta: null,
          id: `${our}/${id}`,
          delta: {
            add: {
              memo,
              time: null,
            },
          },
        },
      },
    },
  };
  return {
    app: "chat",
    mark: "chat-dm-action",
    json,
  };
}
export function buildClubReply(
  our: Ship,
  clubID: string,
  author: Ship,
  parent: string,
  memo: Memo,
) {
  const id = makeDottedIndex();
  const json = {
    id: addDots5(clubID),
    diff: {
      delta: {
        writ: {
          delta: {
            reply: {
              delta: {
                add: {
                  memo,
                  time: null,
                },
              },
              meta: null,
              id: `${our}/${id}`,
            },
          },
          id: `${author}/${parent}`,
        },
      },
      uid: "0v3",
    },
  };
  return {
    app: "chat",
    mark: "chat-club-action-0",
    json,
  };
}
export function buildChatReply(parent: string, nest: string, memo: Memo) {
  // club reply
  const json = {
    channel: {
      nest,
      action: {
        post: {
          reply: {
            id: parent,
            action: {
              add: memo,
            },
          },
        },
      },
    },
  };
  return {
    app: "channels",
    mark: "channel-action",
    json,
  };
}
export function buildDiaryPost(
  author: Ship,
  resource: string,
  title: string,
  inline: Inline[],
) {
  const index = makeDottedIndex();
  const json = {
    flag: resource,
    update: {
      time: "",
      diff: {
        notes: {
          time: index,
          delta: {
            add: {
              author,
              image: "",
              title,
              sent: Date.now(),
              content: [{ inline }],
            },
          },
        },
      },
    },
  };
  return {
    app: "diary",
    mark: "diary-action-0",
    json,
  };
}
export function buildHeapPost(
  author: Ship,
  resource: string,
  title: string,
  inline: Inline[],
) {
  const index = makeDottedIndex();
  const json = {
    flag: resource,
    update: {
      time: "",
      diff: {
        curios: {
          time: index,
          delta: {
            add: {
              author,
              title,
              replying: null,
              sent: Date.now(),
              content: {
                block: [],
                inline,
              },
            },
          },
        },
      },
    },
  };
  return {
    app: "heap",
    mark: "heap-action-0",
    json,
  };
}
// export function markdownToReply(
//   our: Ship,
//   parent: string,
//   s: string
// ): ReplyGraph {
//   const verses = tokenize(s);
//   const memo = buildMemo(our, verses);
//   const provIndex = makeDottedIndex();
//   const graph = memoToReply(provIndex, parent, memo);
//   return graph;
// }
export function chatQuoteToCite(cq: ChatQuoteParams): Verse {
  const nest = cq.nest as any;
  const where = `/msg/${cq.id}`;
  return {
    block: {
      cite: {
        chan: { nest, where },
      },
    },
  };
}
export function markdownToWrit(
  our: Ship,
  s: string,
  images: string[],
  cite: ChatQuoteParams | null,
): Essay {
  const verses = tokenize(s);
  const fverses = cite ? [...verses, chatQuoteToCite(cite)] : verses;
  const f = [...fverses, ...images.map(buildImage)];
  const essay = buildEssay(our, f);
  return essay;
}
function buildImage(src: string): Verse {
  return {
    block: {
      image: {
        src,
        alt: "",
        height: 100,
        width: 100, // TODO wtf
      },
    },
  };
}

export function provWrit(essay: Essay): Writ {
  const seal: Seal = {
    id: essay.sent.toString(),
    reacts: {},
    replies: {},
    meta: {
      lastRepliers: [],
      lastReply: null,
      replyCount: 0,
    },
  };
  return { essay, seal, prov: true };
}
// export function memoToReply(id: string, parent: string, memo: Memo): ReplyGraph {
//   const writ = {
//     memo,
//     seal: {
//       reacts: {},
//       id,
//       "parent-id": parent,
//     },
//   };
//   return { [id]: writ };
// }

export function memoToChatReply(
  parentID: string,
  fullID: string,
  id: string,
  memo: Memo,
): Reply {
  const seal = {
    id: fullID,
    reacts: {},
    "parent-id": parentID,
    time: id, // non dotted
  };
  return { memo, seal };
}
export function memoToWrit(id: string, memo: Memo, time: string): Writ {
  const writ = {
    essay: { ...memo, "kind-data": { chat: null } },
    seal: {
      time,
      reacts: {},
      id,
      replies: {},
      meta: {
        lastRepliers: [],
        lastReply: null,
        replyCount: 0,
      },
    },
  };
  return writ;
}
export function essayToWrit(id: string, essay: Essay): Writ {
  return {
    essay,
    seal: {
      reacts: {},
      id: `${essay.author}/${id}`,
      replies: {},
      meta: {
        lastRepliers: [],
        lastReply: null,
        replyCount: 0,
      },
    },
  };
}
export function tokenize(s: string): Content {
  // TODO there must be a better way to do this
  // // man this is annoying. Thanks github, fuck you maintainers.
  // const notEscape: marked.MarkedExtension = {
  //   name: "singleQuote",
  //   level: "inline", // This is an inline-level tokenizer
  //   start(src: string) {
  //     return src.match(/['"<>&]/);
  //   }, // Hint to Marked.js to stop and check for a match
  //   tokenizer(src: string, tokens: marked.Token[]) {
  //     const rule = /['"<>&]/; // Regex for the complete token, anchor to string start
  //     const match = rule.exec(src);
  //     if (match) {
  //       return {
  //         // Token to generate
  //         type: "singleQuote", // Should match "name" above
  //         raw: match[0], // Text to consume from the source
  //         // text: match[0], // Additional custom properties
  //       };
  //     }
  //   },
  //   renderer(token) {
  //     return token.text;
  //   }
  // };
  marked.use({
    breaks: true,
  });
  // marked.use({ extensions: [notEscape] });
  // const m = marked.lexer(s);
  // const tokens = m.map(lexerToTlon).flat();
  // return tokens;
  const m = inputToMDTokens(s);
  const tokens = m.reduce(lexerToTlonTop, [] as Verse[]);
  return tokens;
}
export function inputToMDTokens(input: string) {
  const refExtension = {
    name: "ref",
    level: "inline" as "inline",
    start(src: string) {
      return src.match(REF_REGEX)?.index;
    },
    tokenizer(src: string) {
      const ref = src.match(REF_REGEX);
      if (!ref || !ref.index || ref.index > 0) return;
      return {
        type: "ref",
        raw: src,
        text: src,
      };
    },
  };
  const shipExtension = {
    name: "ship",
    level: "inline" as "inline",
    start(src: string) {
      return src.match(SHIP_REGEX)?.index;
    },
    tokenizer(src: string) {
      const ship = src.match(SHIP_REGEX);
      if (ship && isValidPatp(ship[0])) {
        if (!ship || !ship.index || ship.index > 0) return;
        return {
          type: "ship",
          raw: ship[0],
          text: ship[0].trim(),
        };
      }
    },
  };
  marked.use({ breaks: true, extensions: [refExtension, shipExtension] });
  const md = marked.lexer(input);
  return md;
}
function lexerToTlonTop(acc: Verse[], m: Token): Verse[] {
  // console.log(m, "parsing");
  if (m.type === "paragraph")
    return [...acc, { inline: m.tokens!.map(lexerToTlon).flat() }];
  if (m.type === "blockquote")
    return [
      ...acc,
      { inline: [{ blockquote: m.tokens!.map(lexerToTlon).flat() }] },
    ];
  if (m.type === "code") return [...acc, { block: tlonCodeblock(m) }];
  if (m.type === "list") return [...acc, { block: { listing: tlonList(m) } }];
  if (m.type === "heading") return [...acc, { block: tlonHeading(m) }];
  else return acc;
}
function tlonHeading(t: any) {
  return {
    header: {
      content: t.tokens.map(lexerToTlon).flat(),
      tag: `h${t.depth}`,
    },
  };
}
function tlonCodeblock(t: any) {
  return {
    code: {
      code: t.text,
      lang: t.lang,
    },
  };
}
function tlonList(t: any): Listing {
  return {
    list: {
      type: t.ordered ? "ordered" : "unordered",
      items: t.items.map(tlonListItem),
      contents: [],
    },
  };
}
function tlonListItem(t: any) {
  return {
    item: t.tokens.map(lexerToTlon).flat(),
  };
}
export function unEscape(s: string): string {
  var e = document.createElement("textarea");
  e.innerHTML = s;
  // handle case of empty input
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue || "";
}
function lexerToTlon(m: Token): Inline[] {
  if ("text" in m) m.text = unEscape(m.text.trim());
  if (m.type === "text") return parsePlainText(m.text.trim());
  if (m.type === "ref") return m.text;
  else if (m.type === "paragraph") return m.tokens!.map(lexerToTlon).flat();
  else if (m.type === "space") return [{ break: null }];
  else if (m.type === "ship") return [{ ship: m.text }];
  else if (m.type === "em")
    return [{ italics: m.tokens!.map(lexerToTlon).flat() }];
  else if (m.type === "strong")
    return [{ bold: m.tokens!.map(lexerToTlon).flat() }];
  else if (m.type === "del")
    return [{ strike: m.tokens!.map(lexerToTlon).flat() }];
  else if (m.type === "blockquote")
    return [{ blockquote: m.tokens!.map(lexerToTlon).flat() }];
  else if (m.type === "link")
    return [{ link: { href: m.href, content: m.text } }];
  else if (m.type === "image")
    return [{ link: { href: m.href, content: m.text } }];
  else if (m.type === "code") return [{ code: m.text, lang: m.lang }];
  else if (m.type === "codespan") return [{ "inline-code": m.text }];
  else if (m.type === "br") return [{ break: null }];
  else if (m.type === "list") return m.items.map(markdownListToTlon).flat();
  else if (m.type === "html" || m.type === "heading")
    return parsePlainText(m.text);
  else return [m.raw];
}
function markdownListToTlon(m: Tokens.ListItem): Inline[] {
  return [m.raw, { break: null }];
}
function parsePlainText(s: string): Inline[] {
  let data: tokenizerData = [s, []];
  data = extract_mention(data);
  // data = extract_url(data);
  return extract_text(data);
}
// tokenizer adapted from graph-store implementation
type tokenizerData = [string, taggedContent[]];
type taggedContent = [string, Inline];
export function extract_mention(data: tokenizerData): tokenizerData {
  // const regex = /(^|\s)~[a-z_-]+/g;
  const matches = data[0].match(SHIP_REGEX);
  if (!matches) return data;
  else
    return matches.reduce((acc, item) => {
      const uid = `;;${Math.random().toString(36).substring(8)};;`;
      if (isValidPatp(item.trim()))
        return [
          acc[0].replace(item, uid),
          [...acc[1], [uid, { ship: item.trim() }]],
        ];
      else return acc;
    }, data);
}
export const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,10}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
function extract_url(data: tokenizerData): tokenizerData {
  const matches = data[0].match(URL_REGEX);
  if (!matches) return data;
  else
    return matches.reduce((acc, item) => {
      const uid = `;;${Math.random().toString(36).substring(8)};;`;
      return [
        acc[0].replace(item, uid),
        [...acc[1], [uid, { link: { href: item, content: item } }]],
      ];
    }, data);
}
function extract_text(data: tokenizerData): Inline[] {
  const uids = data[1].map((tuple) => tuple[0].replace(/;/g, ""));
  const ret = data[0].split(";;").map((section) => {
    if (uids.includes(section)) {
      const tc = data[1].find((tagged) => tagged[0] === `;;${section};;`);
      if (tc) return tc[1];
      else return section;
    } else return section;
  });
  return ret;
}

export function newUv(seed = Date.now()) {
  return formatUv(unixToDa(seed));
}
export const DA_UNIX_EPOCH = BigInt("170141184475152167957503069145530368000"); // `@ud` ~1970.1.1

export const DA_SECOND = BigInt("18446744073709551616"); // `@ud` ~s1

export const EPOCH = BigInt("292277024400");
export function unixToDa(unix: number): bigint {
  const timeSinceEpoch = (BigInt(unix) * DA_SECOND) / 1000n;
  return DA_UNIX_EPOCH + timeSinceEpoch;
}
export function formatUv(x: bigint): string {
  const uvMask = BigInt(31);
  const uvAlphabet = "0123456789abcdefghijklmnopqrstuv";
  let res = "";
  while (x !== BigInt(0)) {
    let nextSix = Number(x & uvMask);
    res = uvAlphabet[nextSix] + res;
    x = x >> BigInt(5);
  }
  return addDots5(`0v${res}`);
}

export function replyToPost(post: Reply): Writ {
  const essay: Essay = { ...post.memo, "kind-data": { chat: null } };
  const seal: Seal = {
    id: post.seal.id,
    reacts: post.seal.reacts,
    time: post.seal?.time as string,
    replies: {},
    meta: {
      lastRepliers: [],
      lastReply: null,
      replyCount: 0,
    },
  };
  return { essay, seal };
}
export function postToReply(post: Writ): Reply {
  const { "kind-data": _, ...memo } = post.essay;
  const seal = {
    id: post.seal.id,
    reacts: post.seal.reacts,
    "parent-id": post.seal.id,
    time: post.seal.time!,
  };
  return { memo, seal };
}

export function writToMD(content: Content): string {
  return content.reduce((acc, verse) => {
    if ("block" in verse) return acc + "\n\n" + blockReducer(verse.block);
    else return acc + `\n\n` + inlineReducer(verse.inline);
  }, "");
}
function blockReducer(b: Block): string {
  if ("image" in b) return `![](${b.image.src})`;
  else if ("code" in b)
    return `
  \`\`\`
  ${b.code.code}
  \`\`\`
  `;
  else if ("header" in b) {
    const tag =
      b.header.tag === "h1"
        ? "#"
        : b.header.tag === "h2"
          ? "##"
          : b.header.tag === "h3"
            ? "###"
            : b.header.tag === "h4"
              ? "####"
              : b.header.tag === "h5"
                ? "#####"
                : b.header.tag === "h6"
                  ? "######"
                  : "";
    return `${tag} ${b.header.content}`;
  } else if ("listing" in b)
    return ""; // TODO
  else if ("cite" in b)
    return ""; // TODO
  else return "";
}
function inlineReducer(ar: Inline[]): string {
  const res = ar.reduce((acc: string, item) => {
    return `${acc} ${inlineToString(item)}`;
  }, "");
  return res as string;
}
function inlineToString(i: Inline): string {
  if (typeof i === "string") return i;
  else if ("break" in i) return `\n`;
  else if ("ship" in i) return i.ship;
  else if ("inline-code" in i) return `\`${i["inline-code"]}\``;
  else if ("code" in i) return `\`${i.code}\``;
  else if ("link" in i) return `![${i.link.content}](${i.link.href})`;
  else if ("italics" in i) return `_${inlineReducer(i.italics).trim()}_`;
  else if ("bold" in i) return `*${inlineReducer(i.bold).trim()}*`;
  else if ("blockquote" in i) return `> ${inlineReducer(i.blockquote).trim()}`;
  else if ("strike" in i) return `~~${inlineReducer(i.strike).trim()}~~`;
  else return "";
}
export function nestFromString(s: string): Nest {
  const ss = s.split("/");
  return { type: ss[0] as any, host: ss[1] as any, name: ss[2] };
}
export function nestToString(nes: Nest): string {
  return `${nes.type}/${nes.host}/${nes.name}`;
}
