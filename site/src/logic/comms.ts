import { APP_NAME } from "./constants";
import { AppType, Ship, Site } from "./types";
import { addDots, isValidHttpUrl } from "./utils";
import {
  ChannelUpdate,
  ChannelsRes,
  Content,
  DiaryPage,
  DiaryPost,
  Essay,
  Group,
  Memo,
  PostsPage,
} from "./types-tlon";
import Urbit from "@urbit/http-api";

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
  const ninjaSub = async (
    app: string,
    path: string,
    event: EventHandler,
    err?: ErrorHandler,
    quit?: EventHandler,
  ) =>
    airlock.subscribe({ app: APP_NAME, path: `/proxy/${app}${path}`, event });

  const poke = async (app: string, mark: string, json: any) =>
    // airlock.poke({
    //   app: APP_NAME,
    //   mark: "json",
    //   json: { ...json, app, mark },
    // });
    airlock.poke({ app, mark, json });
  const ninjaPoke = async (
    desk: string,
    app: string,
    mark: string,
    json: any,
  ) => airlock.ninjaPoke({ desk, app, mark, json, proxyApp: APP_NAME });
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
    poke,
    ninjaSub,
    ninjaPoke,
    thread,
  };
}

export type ScryRes = {
  site: Site;
  group: Group;
};
export default function appIO(airlock: Urbit) {
  const { sub, unsub, poke, ninjaPoke, ninjaSub, thread } = urbitIO(airlock);

  async function scrySite(): Promise<ScryRes> {
    const site = window.location.pathname.split("/")[1];
    const res = await fetch("/ucm/api/" + site);
    const j = await res.json();
    return j;
  }
  async function ninjaScry(app: string, path: string): Promise<any> {
    const res = await fetch("/ucm/napi" + `/${app}${path}`);
    const j = await res.json();
    return j;
  }

  async function initSubs(site: string, handler: EventHandler) {
    const err = (err: any, id: string) => console.log(err, "");
    const quit = (data: any) => console.log(data, "");
    const res = await sub(APP_NAME, `/ui/${site}`, handler, err, quit);
    return res;
  }
  async function channelsSub(handler: EventHandler) {
    const err = (err: any, id: string) => console.log(err, "");
    const quit = (data: any) => console.log(data, "");
    const res = await ninjaSub("channels", "/v1", handler, err, quit);
    return res;
  }

  //  pokes

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

  // Tlon
  async function scryChannels(): Promise<ChannelsRes> {
    const res = await ninjaScry("channels", "/v2/channels/full");
    return res;
  }
  async function scryChatroom(
    ship: Ship,
    name: string,
    count: number,
  ): Promise<PostsPage> {
    const res = await ninjaScry(
      "channels",
      `/v2/chat/${ship}/${name}/posts/newest/${count}/outline`,
    );
    return res;
  }
  async function sendChatMsg(
    author: Ship,
    host: Ship,
    name: string,
    content: Content,
    sent: number,
  ) {
    const nest = `chat/${host}/${name}`;
    const mark = "channel-action";
    const desk = "groups";
    const app = "channels";
    const essay = {
      "kind-data": {
        chat: null,
      },
      author,
      sent,
      content,
    };
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
    return ninjaPoke(desk, app, mark, json);
  }
  function fixTlon(pending: Map<number, any>, update: ChannelUpdate) {
    if (!("post" in update.response)) return;
    const [kind, host, name] = update.nest.split("/");
    const rpost = update.response.post["r-post"];
    const id = addDots(update.response.post.id, 3);
    const needFix =
      "set" in rpost
        ? editPostAuthor(pending, kind, host as Ship, name, id, rpost.set.essay)
        : "reply" in rpost && "set" in rpost.reply["r-reply"]
          ? editReplyAuthor(
              pending,
              kind,
              host as Ship,
              name,
              id,
              rpost.reply.id,
              rpost.reply["r-reply"].set.memo,
            )
          : false;
    if (!needFix) return rpost;
  }
  function editPostAuthor(
    pending: Map<number, any>,
    kind: string,
    host: Ship,
    name: string,
    id: string,
    essay: Essay,
  ) {
    const clientShip = (window as any).ship;
    const isPending = pending.has(essay.sent);
    if (essay.author === host && clientShip !== host && isPending) {
      const nessay = { ...essay, author: clientShip };
      fixPost(kind, host, name, id, nessay);
      return true;
    } else return false;
  }
  function editReplyAuthor(
    pending: Map<number, any>,
    kind: string,
    host: Ship,
    name: string,
    parent_id: string,
    id: string,
    memo: Memo,
  ) {
    const clientShip = (window as any).ship;
    const isPending = pending.has(memo.sent);
    if (memo.author === host && clientShip !== "host" && isPending) {
      const nmemo = { ...memo, author: clientShip };
      fixReply(kind, host, name, parent_id, id, nmemo);
      return true;
    } else return false;
  }

  async function fixPost(
    kind: string,
    host: Ship,
    name: string,
    id: string,
    essay: Essay,
  ) {
    const nest = `${kind}/${host}/${name}`;
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
    return ninjaPoke(desk, app, mark, json);
  }
  async function fixReply(
    kind: string,
    host: Ship,
    name: string,
    parent_id: string,
    id: string,
    memo: Memo,
  ) {
    const nest = `${kind}/${host}/${name}`;
    const mark = "channel-action";
    const desk = "groups";
    const app = "channels";
    const json = {
      channel: {
        nest,
        action: {
          post: {
            reply: {
              id: parent_id,
              action: {
                edit: {
                  id: addDots(id, 3),
                  memo,
                },
              },
            },
          },
        },
      },
    };
    return ninjaPoke(desk, app, mark, json);
  }
  async function sendChatReply(
    author: Ship,
    host: Ship,
    name: string,
    parent: string,
    content: Content,
    sent: number,
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
            reply: {
              id: parent,
              action: {
                add: {
                  author,
                  sent,
                  content,
                },
              },
            },
          },
        },
      },
    };
    return ninjaPoke(desk, app, mark, json);
  }

  async function sendDiaryReply(
    author: Ship,
    host: Ship,
    name: string,
    parent: string,
    content: Content,
    sent: number,
  ) {
    const nest = `diary/${host}/${name}`;
    const mark = "channel-action";
    const desk = "groups";
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
                  sent,
                  content,
                },
              },
            },
          },
        },
      },
    };
    return ninjaPoke(desk, app, mark, json);
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
    const desk = "groups";
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
    return ninjaPoke(desk, app, mark, json);
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
    return ninjaPoke("groups", app, mark, json);
  }

  async function radioSub(handler: EventHandler) {
    return ninjaSub("tower", "/global", handler);
  }
  async function radioSub2(handler: EventHandler) {
    // return ninjaSub("tower", "/greg/local", handler);
    return ninjaSub("tower", "/personal", handler);
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
    return poke("tower", "radio-action", json);
  }
  async function radioSpin(title: string, desc: string, playUrl: string) {
    if (!isValidHttpUrl(playUrl)) return;
    let currentUnixTime = Date.now();
    currentUnixTime = Math.ceil(currentUnixTime);
    let pokes = [];
    if (title)
      pokes.push(
        poke("tower", "radio-action", {
          talk: title,
        }),
      );
    if (desc)
      pokes.push(
        poke("tower", "radio-action", {
          description: desc,
        }),
      );
    if (playUrl)
      pokes.push(
        poke("tower", "radio-action", {
          spin: {
            url: playUrl,
            time: currentUnixTime,
          },
        }),
      );
    return await Promise.all(pokes);
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
    return ninjaPoke("groups", app, mark, json);
  }
  async function scryDiary(
    ship: Ship,
    name: string,
    count: number,
  ): Promise<DiaryPage> {
    const app = "channels";
    const path = `/v1/diary/${ship}/${name}/posts/newest/${count}/post`;
    return await ninjaScry(app, path);
  }
  async function scryDiaryPost(
    ship: Ship,
    name: string,
    id: string,
  ): Promise<DiaryPost> {
    const app = "channels";
    const path = `/v1/diary/${ship}/${name}/posts/post/${id}`;
    return await ninjaScry(app, path);
  }
  async function scryChat(
    ship: Ship,
    name: string,
    count: number,
  ): Promise<PostsPage> {
    const app = "channels";
    const path = `/v1/chat/${ship}/${name}/posts/newest/${count}/post`;
    return await ninjaScry(app, path);
  }
  return {
    scrySite,
    ninjaScry,
    initSubs,
    channelsSub,
    scryChannels,
    scryChatroom,
    sendChatMsg,
    fixTlon,
    sendChatReply,
    sendDiaryPost,
    sendDiaryReply,
    sendReact,
    sendReplyReact,
    radioSub,
    radioSub2,
    radioSpin,
    radioChat,
    search,
    scryDiary,
    scryDiaryPost,
    scryChat,
  };
}
