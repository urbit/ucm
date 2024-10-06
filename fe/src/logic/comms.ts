import anyAscii from "any-ascii";
import {
  faker,
  Faker,
  es,
  en,
  zh_CN,
  ja,
  th,
  mergeLocales,
} from "@faker-js/faker";
import { APP_NAME, RADIO_SHIP, WIKI_SHIP } from "./constants";
import {
  AppChoice,
  AppType,
  Pikes,
  RichMetadata,
  Ship,
  Site,
  Wiki,
} from "./types";
import { enkebab, generateRandomBase64, isValidHttpUrl } from "./utils";
import {
  ChannelsRes,
  Content,
  DiaryPage,
  DiaryPost,
  Essay,
  PostsPage,
} from "./types-tlon";
import Urbit from "@urbit/http-api";
import { hex2patp } from "./ob/co";
import { tokenize } from "./tlon-helpers";

type EventHandler = (data: any) => void;
type ErrorHandler = (data: any, id: string) => void;

export function urbitIO(airlock: Urbit) {
  const sub = async (
    app: string,
    path: string,
    event: EventHandler,
    err?: ErrorHandler,
    quit?: EventHandler,
  ) => airlock.subscribe({ app, path, event });
  const unsub = async (num: number) => airlock.unsubscribe(num);
  const scry = async (app: string, path: string) => airlock.scry({ app, path });
  const poke = async (app: string, mark: string, json: any) =>
    airlock.poke({ app, mark, json });
  const thread = async (
    threadName: string,
    desk: string,
    inputMark: string,
    outputMark: string,
    body: any,
  ) => airlock.thread({ threadName, desk, inputMark, outputMark, body });
  return {
    sub,
    unsub,
    scry,
    poke,
    thread,
  };
}

export function dashIO(airlock: Urbit) {
  const { scry, sub, unsub, poke, thread } = urbitIO(airlock);

  async function initSubs(handler: EventHandler) {
    const err = (err: any, id: string) => console.log(err, "");
    const quit = (data: any) => console.log(data, "");
    const res = await sub(APP_NAME, "/ui", handler, err, quit);
    return res;
  }
  async function initialScries() {
    const groups = scry("groups", "/groups/v1");
    const pikes = scry("hood", "/kiln/pikes");
    return { groups: await groups, pikes: await pikes };
  }
  //  pokes

  async function createSite(site: Site) {
    const obj = { dash: { set: site } };
    return poke(APP_NAME, "json", obj);
  }
  async function delSite(path: string) {
    const obj = { dash: { del: path } };
    return poke(APP_NAME, "json", obj);
  }

  // Tlon
  async function createGroup(title: string) {
    const name = enkebab(title);
    const mark = "group-create";
    const app = "groups";
    const json = {
      title,
      description: "Backend Group for UCM site",
      image: "#999999",
      cover: "#D9D9D9",
      name,
      members: {},
      cordon: {
        open: {
          ships: [],
          ranks: [],
        },
      },
      secret: false,
    };
    return poke(app, mark, json);
  }
  async function createBlog(
    groupname: string,
    title: string,
    description: string,
  ) {
    const group = `~${airlock.ship}/${groupname}`;
    const randomString = generateRandomBase64(3);
    const name = "ucm-" + "ublog-" + enkebab(title) + "-" + randomString;
    const mark = "channel-action";
    const app = "channels";
    const json = {
      create: {
        kind: "diary",
        group,
        name,
        title,
        description,
        readers: [],
        writers: [],
      },
    };
    console.log(json);
    return poke(app, mark, json);
  }
  async function createChannel(
    groupname: string,
    title: string,
    description: string,
    kind: string,
  ) {
    const group = `~${airlock.ship}/${groupname}`;
    const randomString = generateRandomBase64(3);
    const name = "ucm-" + enkebab(title) + "-" + randomString;
    const mark = "channel-action";
    const app = "channels";
    const json = {
      create: {
        kind,
        group,
        name,
        title,
        description,
        readers: [],
        writers: [],
      },
    };
    // console.log(json);
    return poke(app, mark, json);
  }
  async function scryState(): Promise<any> {
    const res = await scry(APP_NAME, "/state");
    return res;
  }
  async function scryGroups() {
    const app = "groups";
    const path = "/groups/v1";
    return await scry(app, path);
  }
  async function scryPikes() {
    const app = "hood";
    const path = "/kiln/pikes";
    return await scry(app, path);
  }
  async function fetchApps(pikes: Pikes) {
    const haveWiki = pikes.wiki && pikes.wiki.sync.ship === WIKI_SHIP;
    if (!haveWiki) installApp(WIKI_SHIP, "wiki");
  }
  async function installApp(ship: Ship, appName: string) {
    const app = "docket";
    const mark = "docket-install";
    const json = `${ship}/${appName}`;
    return poke(app, mark, json);
  }
  async function scryWiki(): Promise<Wiki[]> {
    const app = "wiki";
    const path = `/list/mine`;
    return await scry(app, path);
  }

  return {
    initSubs,
    initialScries,
    createSite,
    delSite,
    createGroup,
    createBlog,
    createChannel,
    scryGroups,
    scryState,
    scryPikes,
    fetchApps,
    installApp,
    scryWiki,
  };
}
export default function appIO(airlock: Urbit) {
  const { scry, sub, unsub, poke, thread } = urbitIO(airlock);

  async function channelsSub(handler: EventHandler) {
    const err = (err: any, id: string) => console.log(err, "");
    const quit = (data: any) => console.log(data, "");
    const res = await sub("channels", "/v1", handler, err, quit);
    return res;
  }

  // {
  //     "kind": "chat",
  //     "group": "~zod/my-test-site-3",
  //     "name": "shat-number-2",
  //     "title": "shat number 2",
  //     "description": "my new shat",
  //     "readers": [],
  //     "writers": []
  // }

  // tlom
  async function sendChatMsg(
    author: Ship,
    host: Ship,
    name: string,
    content: Content,
    sent: number,
  ) {
    const nest = `chat/${host}/${name}`;
    const mark = "channel-action";
    const app = "channels";
    const json = {
      channel: {
        nest,
        action: {
          post: {
            add: {
              "kind-data": {
                chat: null,
              },
              author,
              content,
              sent,
            },
          },
        },
      },
    };
    return poke(app, mark, json);
  }
  async function sendChatReply(
    author: Ship,
    host: Ship,
    name: string,
    parent: string,
    content: Content,
  ) {
    const nest = `chat/${host}/${name}`;
    const mark = "channel-action";
    const app = "channels";
    const json = {
      channel: {
        nest,
        action: {
          post: {
            reply: {
              id: parent,
              action: {
                add: {
                  author,
                  sent: Date.now(),
                  content,
                },
              },
            },
          },
        },
      },
    };
    return poke(app, mark, json);
  }

  async function sendDiaryPost(
    author: Ship,
    host: Ship,
    name: string,
    title: string,
    image: string,
    content: Content,
    sent: number,
  ) {
    const nest = `diary/${host}/${name}`;
    const mark = "channel-action";
    const app = "channels";
    const kind = { diary: { title, image } };
    const json = {
      channel: {
        nest,
        action: {
          post: {
            add: {
              author,
              sent,
              content,
              "kind-data": kind,
            },
          },
        },
      },
    };
    return poke(app, mark, json);
  }
  async function sendDiaryReply(
    author: Ship,
    host: Ship,
    name: string,
    parent: string,
    content: Content,
  ) {
    const nest = `diary/${host}/${name}`;
    const mark = "channel-action";
    const app = "channels";
    const json = {
      channel: {
        nest,
        action: {
          post: {
            reply: {
              id: parent, // dotted!
              action: {
                add: {
                  author,
                  sent: Date.now(),
                  content,
                },
              },
            },
          },
        },
      },
    };
    console.log(json, "sending diary reply");
    return poke(app, mark, json);
  }
  async function sendReact(
    author: Ship,
    kind: string,
    host: Ship,
    name: string,
    id: string,
    react: string,
  ) {
    const nest = `${kind}/${host}/${name}`;
    const mark = "channel-action";
    const app = "channels";
    const json = {
      channel: {
        nest,
        action: {
          post: {
            "add-react": {
              id,
              react,
              ship: author,
            },
          },
        },
      },
    };
    return poke(app, mark, json);
  }
  async function sendReplyReact(
    author: Ship,
    kind: string,
    host: Ship,
    name: string,
    parentId: string,
    id: string,
    react: string,
  ) {
    const nest = `${kind}/${host}/${name}`;
    const mark = "channel-action";
    const app = "channels";
    const json = {
      channel: {
        nest,
        action: {
          post: {
            reply: {
              id: parentId,
              action: {
                "add-react": {
                  id,
                  react,
                  ship: author,
                },
              },
            },
          },
        },
      },
    };
    return poke(app, mark, json);
  }

  async function scryDiary(
    ship: Ship,
    name: string,
    count: number,
  ): Promise<DiaryPage> {
    const app = "channels";
    const path = `/v1/diary/${ship}/${name}/posts/newest/${count}/post`;
    return await scry(app, path);
  }
  async function scryDiaryPost(
    ship: Ship,
    name: string,
    id: string,
  ): Promise<DiaryPost> {
    const app = "channels";
    const path = `/v1/diary/${ship}/${name}/posts/post/${id}`;
    return await scry(app, path);
  }
  async function scryChat(
    ship: Ship,
    name: string,
    count: number,
  ): Promise<PostsPage> {
    const app = "channels";
    const path = `/v1/chat/${ship}/${name}/posts/newest/${count}/post`;
    return await scry(app, path);
  }

  // other apps

  async function search(
    query: string,
    apps: AppType[],
    by: string,
    start?: number,
    end?: number,
  ) {
    const obj = { site: { search: { query, apps, by, start, end } } };
    return poke(APP_NAME, "json", obj);
  }
  async function scryChatroom(
    ship: Ship,
    name: string,
    count: number,
  ): Promise<PostsPage> {
    const res = await scry(
      "channels",
      `/v2/chat/${ship}/${name}/posts/newest/${count}/outline`,
    );
    return res;
  }

  async function fixChatMsg(
    airlock: Urbit,
    host: Ship,
    name: string,
    id: string,
    essay: Essay,
  ) {
    const nest = `chat/${host}/${name}`;
    const mark = "channel-action";
    const desk = "groups";
    const app = "channels";
    const json = {
      channel: {
        nest,
        action: {
          post: {
            edit: {
              id,
              essay,
            },
          },
        },
      },
    };
    console.log(airlock, "airlock");
    return airlock.ninjaPoke({ desk, app, mark, json, proxyApp: "ucm" });
  }
  async function scryChannels(): Promise<ChannelsRes> {
    const res = await scry("channels", "/v2/channels/full");
    // const res4 = await scry("channels", "/v2/heads");
    // console.log(res4, "channs4");
    return res;
  }
  async function radioSub(handler: EventHandler) {
    return sub("tenna", "/frontend", handler);
  }
  async function radioSub2(handler: EventHandler) {
    await sub("tower", "/greg/local", handler);
    // return sub("tower", "/personal", handler);
  }
  async function radioChat(from: Ship, message: string) {
    const time = Date.now();
    const json = {
      chat: {
        from,
        message,
        time,
      },
    };
    return poke("tenna", "radio-action", json);
  }
  async function radioSpin(playUrl: string) {
    if (!isValidHttpUrl(playUrl)) return;
    let currentUnixTime = Date.now();
    currentUnixTime = Math.ceil(currentUnixTime);
    const json = {
      spin: {
        url: playUrl,
        time: currentUnixTime,
      },
    };
    return await poke("tenna", "radio-action", json);
  }

  return {
    channelsSub,
    sendChatMsg,
    sendChatReply,
    sendDiaryPost,
    sendDiaryReply,
    sendReact,
    sendReplyReact,
    scryDiary,
    scryDiaryPost,
    scryChat,
    search,
    scryChatroom,
    fixChatMsg,
    scryChannels,
    radioSub,
    radioSub2,
    radioSpin,
    radioChat,
  };
}
