import { Ship } from "./types";

export const APP_NAME = "ucm";
// export const URL = import.meta.env.PROD ? "" : "http://localhost:8081";
export const URL = window.location.origin;

export const MOBILE_BROWSER_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry/i;
export const AUDIO_REGEX = new RegExp(/https:\/\/.+\.(mp3|wav|ogg)\b/gim);
export const VIDEO_REGEX = new RegExp(/https:\/\/.+\.(mov|mp4|ogv)\b/gim);
export const TWITTER_REGEX = new RegExp(
  /https:\/\/(twitter|x)\.com\/.+\/status\/\d+/gim,
);

export const REF_REGEX = new RegExp(
  /urbit:\/\/[a-z0-9-]+\/~[a-z-_]+\/[a-z0-9-_]+/gim,
);
export const RADIO_REGEX = new RegExp(/urbit:\/\/radio\/~[a-z-_]+/gim);

export const IMAGE_REGEX = new RegExp(
  /https:\/\/.+\.(jpg|img|png|gif|tiff|jpeg|webp|webm|svg)\b/gim,
);

export const SHIP_REGEX = new RegExp(/\B~[a-z-]+/);
export const HASHTAGS_REGEX = new RegExp(/#[a-z-]+/g);

export const DEFAULT_DATE = { year: 1970, month: 1, day: 1 };
export const RADIO = "📻";

export const RADIO_SHIP: Ship = "~nodmyn-dosrux" as Ship;
export const WIKI_SHIP: Ship = "~holnes" as Ship;

export const DEFAULT_ICON = "https://s3.sortug.com/img/icons/ucm-logo.png";

const firstSlug = window.location.pathname.split("/")[1];
export const SITE_NAME = firstSlug;
export const BASE_PATH = `/${firstSlug}`;
