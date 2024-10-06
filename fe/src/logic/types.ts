import { ChannelType, GroupMetadata, Inline } from "./types-tlon";

export type Site = {
  sitename: string;
  description: string;
  groupname: string;
  binding: string;
  icon: string;
  home: string; // home page markdown
  css: string;
  hidden: boolean;
  apps: Apps;
  "app-order": AppType[];
};
export type AppType =
  | "blog"
  | "chat"
  | "forum"
  | "radio"
  | "wiki"
  | `static/${string}`;
export type Apps = {
  chat: string[];
  forum: string[];
  blog: string;
  radio: boolean;
  wiki: string;
  static: Record<string, string>;
};
export const AppBunt: Apps = {
  blog: "",
  chat: [],
  forum: [],
  radio: false,
  wiki: "",
  static: {},
};
export const SiteBunt: Site = {
  sitename: "lol",
  description: "",
  groupname: "lmao",
  binding: "/lol",
  icon: "",
  home: "",
  css: "",
  hidden: false,
  apps: AppBunt,
  "app-order": [],
};

export type AppChoice = { type: AppType; name: string; id: number };
export type Ship = `~${string};`;
export type RichMetadata = GroupMetadata & {
  name: string;
  host: Ship;
  kind: ChannelType;
};
export type Channels = {
  chats: RichMetadata[];
  forums: RichMetadata[];
  blog: RichMetadata | null;
};

export const ChannelsBunt: Channels = {
  chats: [],
  forums: [],
  blog: null,
};

export type Pikes = Record<string, Pike>;
export type Pike = {
  sync: Desk;
  zest: "live" | "dead";
  wefts: any[]; //?
  hash: string;
};
export type Desk = {
  ship: Ship;
  desk: string;
};
export type Paragraph = NotRetardedInline[];
type NInline = NotRetardedInline;
export type NotRetardedInline =
  | { text: string }
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

export type Wiki = {
  host: Ship;
  id: string;
  title: string;
  public: boolean;
  pageCount: number;
  mustLogin: boolean;
  edited: number;
};
