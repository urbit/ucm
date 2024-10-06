import { Ship } from "./types";

export type Timestamp = number;
export type UrbitTime = string;
// Tlon Channels
export type TlonUnreads = {
  dms: Record<Ship, ChannelUnread>;
  clubs: Record<string, ChannelUnread & { meta: Metadata }>;
  channels: Record<NestString, ChannelUnread & { meta: Metadata }>;
  invites: Ship[];
};
export type DMType = Ship | string;
export type Nest = {
  type: ChannelType;
  host: Ship;
  name: string;
};
export type NestString = `${ChannelType}/${Ship}/${string}`;
export type ChannelType = "chat" | "diary" | "heap";
export type ChatTypeI = { dm: Ship } | { club: string } | { channel: Nest };
export type ChatType = ChatTypeI | { thread: Thread };

export type Thread = { author: Ship; op: string; in: ChatTypeI };

export const buntUnread: ChannelUnread = {
  count: 0,
  recency: Date.now(),
  unread: null,
  threads: {},
  meta: {
    cover: "",
    image: "",
    title: "",
    description: "",
    team: [],
  },
};
export type ChannelUnread = {
  count: number;
  recency: Timestamp;
  unread: null | Unread;
  threads: Record<PostID, { count: number; id: PostID }>; // kana
  meta: Metadata;
};
export type Unread = {
  count: number;
  id: PostID;
  time: UrbitTime;
};
export type Atom = string;
export type PostID = `${Ship}/${Atom}` | Atom;

// Groups

export type GroupsMap = Record<string, Group>;
export type Group = {
  bloc: string[]; // roles
  cabals: Record<string, GroupMetadata>;
  channels: Record<string, ChannelData>;
  cordon: any; // bans I think
  fleet: Record<Ship, Membership>;
  meta: GroupMetadata;
  "flagged-content": any; // mmm
  saga: any; // ?
  zones: Record<string, Zone>;
  "zone-ord": string[];
};
export const GroupBunt: Group = {
  bloc: [], // roles
  cabals: {},
  channels: {},
  cordon: null, // bans I think
  fleet: {},
  meta: { cover: "", image: "", title: "", description: "" },
  "flagged-content": {}, // mmm
  saga: {}, // ?
  zones: {},
  "zone-ord": [],
};
export type Zone = {
  idx: string; // channeltype/host/name
  meta: GroupMetadata;
};
export type Membership = {
  joined: number;
  sects: Sect[];
};
export type Sect = any; // idk man
export type ChannelData = {
  added: number; // date
  join: boolean;
  meta: GroupMetadata;
  readers: Ship[];
  zone: string; // the section I think
};
export type Metadata = {
  cover: string;
  image: string;
  title: string;
  description: string;
  team: Ship[];
};
export type GroupMetadata = {
  cover: string;
  image: string;
  title: string;
  description: string;
};
export type ClubsMap = Record<string, Club>;
export type Club = {
  hive: Ship[];
  team: Ship[];
  net: string; // "done" or sop
  meta: GroupMetadata;
};

export type ChannelsRes = Record<ChanString, ChanState>;
export type ChanString = `${ChannelType}/${Ship}/${string}`;
export type ChanState = {
  order: string[]; // ?
  sort: string; // ? "time" | w/e
  view: string; // ? "list" | w/e
  pending: {
    posts: any; // ?
    replies: any;
  };
  perms: {
    group: string;
    writers: Ship[];
  };
  posts: Record<DottedPostID, Writ>;
};
export type DottedPostID = string;

// Chat posts
export interface Writ {
  seal: Seal;
  essay: Essay;
  prov?: boolean;
}
export interface Reply {
  seal: ReplySeal;
  memo: Memo;
  unconfirmed?: boolean;
}
export interface DiaryPage {
  newer: string | null; // atom, no-dots
  older: string | null;
  total: number;
  posts: DiaryGraph;
}
export interface DiaryPost {
  type: "post"; // or?
  essay: DiaryEssay;
  seal: Seal;
  revision: string; // number
}
export interface DiaryEssay extends Memo {
  "kind-data": { diary: { image: string; title: string } };
}
export interface PostsPage {
  newer: string | null; // atom, no-dots
  older: string | null;
  total: number;
  posts: WritGraph;
}
export type Cursor = string | null;
export interface WritPage {
  newer: Cursor;
  older: Cursor;
  total: number;
  writs: WritGraph;
  prov?: WritGraph;
}
export interface DiaryGraph {
  [id: string]: DiaryPost;
}
export interface ReplyGraph {
  [id: string]: Reply;
}
export interface WritGraph {
  [id: string]: Writ;
}
export interface Seal {
  id: WritID;
  reacts: Reacts;
  replies: ReplyGraph;
  meta: {
    lastRepliers: Ship[];
    lastReply: number | null; //WritID | null; // ?
    replyCount: number;
  };
  time?: string; // chats have this, channels don't (...)
}
export interface ReplySeal {
  id: string;
  "parent-id": string;
  reacts: Reacts;
  time?: string; // always??
}
export interface Memo {
  author: Ship;
  content: Content;
  sent: number; // unix ts
}
export interface Essay extends Memo {
  "kind-data": { chat: null } | { notice: null };
}
export type Reacts = Record<Ship, string>;
type WritID = string; // ship/123.123

export type Block =
  | { cite: Cite }
  | { image: ImageBlock }
  | { header: { tag: string; content: Inline[] } }
  | { listing: Listing }
  | { rule: null }
  | { code: { code: string; lang: string } };

export type Verse = { block: Block } | { inline: Inline[] };
export type Content = Verse[];

export type Listing =
  | { item: Inline[] }
  | { list: { type: string; items: Listing[]; contents: Inline[] } };
export type Cite = ChannelCite | GroupCite | DeskCite | BaitCite;
export interface ChannelCite {
  chan: {
    nest: `${App}/${Ship}/${string}`;
    where: string; // "/msg/123.123" path in hoon, idgi yet
  };
}
export interface GroupCite {
  group: string; // ship/term
}
export interface DeskCite {
  desk: {
    flag: string; // flag
    where: string; //
  };
}
export interface BaitCite {
  bait: {
    group: string; // flag
    graph: string; // flag
    where: string; //
  };
}
export type App = "chat" | "diary" | "heap";
export interface ImageBlock {
  width: number;
  height: number;
  alt: string;
  src: string; // url
}
export type Inline =
  | string
  | { italics: Inline[] }
  | { bold: Inline[] }
  | { blockquote: Inline[] }
  | { strike: Inline[] }
  | { code: string; lang: string } // not actually in the type, but it should
  | { "inline-code": string }
  | { ship: string }
  | { tag: string }
  | { link: { content: string; href: string } }
  | { task: { checked: boolean; content: Inline[] } }
  | { break: null };

// kinda custom but still
//
export interface Skein {
  unread: boolean;
  count: number;
  top: {
    button: null;
    id: string; // @uv
    con: Array<string | { ship: string } | { emph: string }>;
    wer: string; // path
    time: number;
    rope: {
      channel: string;
      desk: string;
      group: string;
      thread: string;
    };
  };
  "ship-count": number;
  time: number;
}

export interface Brief {
  uid: string;
  title: string;
  group: string;
  count: number;
  last: number; // date
  "read-id": string; // ~ship/123.123.123
  icon: string; // url
  cover: string; // url
  desc: string;
}
export interface Briefs {
  dms: Brief[];
  groups: Brief[];
  threads: Brief[];
  clubs: Brief[];
}

export interface NewPostUpdate {
  set: {
    type: "post"; // or?
    essay: Essay;
    seal: Seal;
  };
}
export interface ReplyMeta {
  replyCount: number;
  lastReply: number; // ts
  lastRepliers: Ship[];
}
export interface NewReplyUpdate {
  reply: {
    id: string; // atom, no dots
    meta: ReplyMeta;
    "r-reply": NewReplySet | NewReactUpdate;
  };
}
export interface NewReplySet {
  set: Reply;
}
export interface NewReactUpdate {
  reacts: Reacts;
}

export type ChannelPendingUpdate = {
  pending: {
    id: { author: Ship; sent: number };
    pending: {
      post: Essay;
    };
  };
};
export type RPost = NewPostUpdate | NewReactUpdate | NewReplyUpdate;
export type ChanRPost = {
  host: Ship;
  name: string;
  kind: ChannelType;
  update: RPost;
};
export interface ChannelPostUpdate {
  post: {
    id: string; // atom, no dots
    "r-post": RPost;
  };
}
export type ChannelPermUpdate = {
  perm: {
    group: string;
    writers: Ship[];
  };
};
export type ChannelCreateUpdate = {
  create: {
    group: string;
    writers: Ship[];
  };
};
export interface ChannelUpdate {
  nest: string;
  response:
    | ChannelPendingUpdate
    | ChannelPostUpdate
    | ChannelPermUpdate
    | ChannelCreateUpdate;
}
export interface NewChatPostUpdate {
  add: {
    memo: Essay;
    time: string; // atom, no dots
  };
  id?: string; // ~ship/string, only on threads, to set the child, reply.id being the parent
}
export interface NewChatReactUpdate {
  "add-react": { ship: Ship; react: string };
}
export interface ChatUpdate {
  id: WritID;
  response: NewChatPostUpdate | NewChatReactUpdate | NewChatReplyUpdate;
}

export interface NewChatReplyUpdate {
  reply: {
    meta: ReplyMeta;
    id: string; // author/dottedID
    delta: NewChatPostUpdate | NewChatReactUpdate;
  };
}

// graph-store
type ID = string;
export interface Graph {
  [keys: ID]: GraphStoreNode;
}
export interface GraphStoreNode {
  post: GSPost;
  children: Graph | null;
}
export type GSContent = any;
export interface GSPost {
  author: Ship;
  contents: GSContent[];
  "time-sent": number;
  hash: string | null;
  signatures: string[];
  index: string;
}
export interface GSKey {
  name: string;
  ship: Ship;
}
export interface AssociationGraph {
  [key: string]: Association;
}
export interface Association {
  metadata: Metadatum;
  "app-name": "graph" | "groups";
  resource: string; // resource string
  group: string; // same
  groupName: string; // here we ourselves add the group title
}
export interface Metadatum {
  preview: boolean;
  vip: string;
  title: string;
  description: string;
  creator: Ship;
  picture: string; //URL
  hidden: boolean;
  config: MetadataConfig;
  "date-created": string;
  color: string;
}
type MetadataConfig = GroupConfig | GraphConfig;
export interface GroupConfig {
  group: {
    "app-name": "graph";
    resource: string; ///ship/~bacrys/pokur-14
  };
}
export interface GraphConfig {
  graph: GraphType;
}
export type GraphType = "chat" | "publish" | "link" | "post";

export interface GSResource {
  entity: Ship;
  name: string;
}

export interface Contact {
  p?: Ship;
  nickname: string;
  bio: string;
  status: string;
  color: string;
  avatar: string | null;
  cover: string | null;
}

// responses
export interface Pals {
  incoming: Record<Ship, boolean>;
  outgoing: Record<Ship, { lists: string[]; ack: boolean }>;
}
export type Contacts = Record<Ship, Contact>;

export interface DisterApps {
  ini: Record<FlagString, AppData>;
}
export type FlagString = `${Ship}/${string}`;
export type AppData = {
  cass: {
    da: string; // @da string
  };
  image: string;
  info: string; // description
  license: string;
  ship: Ship;
  title: string; // dude
  version: string;
  website: string;
  color: string; // @ux string;
  desk: string;
  hash: string; // @uv string;
  href: {
    glob: {
      base: string; // desk name
      "glob-reference": {
        location: {
          http: string; // URL,
          // could be ames too I guess?
        };
        hash: string;
      };
    };
  };
};

export type Gangs = Record<FlagString, GroupPreview>;
export type GroupPreview = {
  claim: null; //
  invite: null; //
  preview: {
    secret: boolean;
    time: number;
    flag: FlagString;
    cordon: {
      shut: {
        // suspect this is a whitelist/blacklist thing
        pending: Ship[];
        ask: Ship[];
      };
    };
    meta: GroupMetadata;
  };
};

// %vitals

interface Connected {
  complete: "yes";
}

interface YetToCheck {
  complete: "no-data";
}

interface NoDNS {
  complete: "no-dns";
}

interface Crash {
  complete: "crash";
  crash: string[][];
}

interface NoOurPlanet {
  complete: "no-our-planet";
  "last-contact": number;
}

interface NoOurGalaxy {
  complete: "no-our-galaxy";
  "last-contact": number;
}

interface NoSponsorHit {
  complete: "no-sponsor-hit";
  ship: string;
}

interface NoSponsorMiss {
  complete: "no-sponsor-miss";
  ship: string;
}

interface NoTheirGalaxy {
  complete: "no-their-galaxy";
  "last-contact": number;
}

export type ConnectionCompleteStatusKey =
  | "yes"
  | "crash"
  | "no-data"
  | "no-dns"
  | "no-our-planet"
  | "no-our-galaxy"
  | "no-sponsor-hit"
  | "no-sponsor-miss"
  | "no-their-galaxy";

export interface CompleteStatus {
  complete: ConnectionCompleteStatusKey;
}

export type ConnectionCompleteStatus =
  | Connected
  | YetToCheck
  | Crash
  | NoDNS
  | NoOurPlanet
  | NoOurGalaxy
  | NoSponsorHit
  | NoSponsorMiss
  | NoTheirGalaxy;

export type ConnectionPendingStatusKey =
  | "setting-up"
  | "trying-dns"
  | "trying-local"
  | "trying-target"
  | "trying-sponsor";

export type ConnectionPendingStatus =
  | {
      pending: Omit<ConnectionPendingStatusKey, "trying-sponsor">;
    }
  | {
      pending: "trying-sponsor";
      ship: string;
    };

export type ConnectionStatus =
  | ConnectionCompleteStatus
  | ConnectionPendingStatus;

export interface ConnectionUpdate {
  status: ConnectionStatus;
  timestamp: number;
}

export interface ConnectivityCheckOptions {
  useStale?: boolean;
  enabled?: boolean;
  staleTime?: number;
  waitToDisplay?: number;
}
export type ChatQuoteParams = { p: Ship; nest: string; id: string };
