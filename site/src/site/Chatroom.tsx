import { RichMetadata, Site, Ship } from "../logic/types";
import useStore from "../logic/store";
import Sigil from "../ui/Sigil";
import { Group, PostsPage, Writ } from "../logic/types-tlon";
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NotFound } from "./Home";
import { PostContent } from "./PostContent";
import { Centered, WholeFlex } from "../ui/Components";
import { tokenize } from "../logic/tlon-helpers";
import { addDots, displayAnon } from "../logic/utils";

export default function Chatroom({ chat }: { chat: RichMetadata }) {
  const { airlock, io } = useStore(["airlock", "io"]);
  const [dead, setDead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PostsPage>();
  useEffect(() => {
    getData();
  }, [chat]);
  async function getData() {
    const { scryChatroom } = io();
    const ship = `~${airlock.ship}` as Ship;
    const count = 300;
    const res = await scryChatroom(chat.host, chat.name, count);
    // const res2 = await scryGroups();
    // const channelName = `chat/${ship}/${name}`;
    // const chat = res.channel[channelName];
    // if (!chat) return;
    // const pending = chat.pending.posts;
    // const pendingReplies = chat.pending.replies;

    if (res) {
      setLoading(false);
      setPage(res);
    }
  }

  if (dead) return <NotFound err="chat not found" />;
  else if (loading)
    return (
      <Centered sx={{ my: 5 }}>
        <CircularProgress sx={{ my: 5 }} />
      </Centered>
    );
  else if (page)
    return (
      <>
        <ChatLoader page={page!} meta={chat} />
        <Input meta={chat} />
      </>
    );
  else return null;
}

const styles = {
  chatList: {
    flexGrow: "1",
    overflowY: "auto",
  },
  reverseScroll: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "end",
  },
  chatMessage: {
    display: "flex",
    gap: "1rem",
    p: 1,
  },
  chatInput: {
    display: "flex",
    width: "100%",
    borderTop: "2px solid black",
  },
  textInput: {
    flexGrow: "1",
    border: "none",
    outline: "none",
    padding: "0.5rem",
  },
};

function ChatLoader({ page, meta }: { page: PostsPage; meta: RichMetadata }) {
  const { lastChannelUpdate } = useStore(["lastChannelUpdate"]);
  const [incoming, setIncoming] = useState<Record<string, Writ>>({});
  useEffect(() => {
    if (!lastChannelUpdate) return;
    const { kind, host, name, update } = lastChannelUpdate;
    if (kind !== "chat") return;
    if (host !== meta.host || name !== meta.name) return;
    const rpost = update;
    if (!("set" in rpost)) return;
    const writ: Writ = { essay: rpost.set.essay, seal: rpost.set.seal };
    const id = addDots(writ.seal.id, 3);
    setIncoming((s) => ({ ...s, [id]: writ }));
  }, [lastChannelUpdate]);
  return (
    <PostList
      page={{ ...page, posts: { ...page.posts, ...incoming } }}
      meta={meta}
    />
  );
}
function PostList({ page, meta }: { page: PostsPage; meta: RichMetadata }) {
  const [pages, setPages] = useState<PostsPage[]>([]);
  useLayoutEffect(() => {
    scrollDown();
  }, [page]);
  function scrollDown() {
    bottomRef?.current?.scrollIntoView({ behavior: "instant" });
  }
  const bottomRef = useRef<HTMLDivElement>(null);
  return (
    <List sx={styles.chatList}>
      {Object.values(page.posts)
        .sort((a, b) => a.essay.sent - b.essay.sent)
        .map((p) => (
          <ChatMessage key={p.seal.id} post={p} />
        ))}
      <div id="br" ref={bottomRef} />
    </List>
  );
}

function ChatMessage({ post }: { post: Writ }) {
  const time = new Date(post.essay.sent).toLocaleTimeString();
  const postStyles = {
    container: {
      lineHeight: "unset",
    },
    paragraph: {
      margin: 0,
      fontWeight: 600,
    },
  };
  return (
    <ListItem sx={styles.chatMessage}>
      <Box sx={{ flex: "0 0 32px" }}>
        <Sigil patp={post.essay.author} size={32} />
      </Box>
      <Box>
        <Box
          sx={{
            display: "flex",
            gap: "1rem",
            fontSize: "0.9rem",
            color: "grey",
          }}
        >
          <Typography>{displayAnon(post.essay.author)}</Typography>
          <Typography>{time}</Typography>
        </Box>
        <PostContent content={post.essay.content} style={postStyles} />
      </Box>
    </ListItem>
  );
}

function Input({ meta }: { meta: RichMetadata }) {
  const { airlock, io, clientShip, addPending } = useStore([
    "airlock",
    "io",
    "clientShip",
    "addPending",
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  function handleKeyboard(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && event.shiftKey !== true && input) {
      event.preventDefault();
      send();
    }
  }
  async function send() {
    setInput("");
    const { sendChatMsg } = io();
    const content = tokenize(input);
    const ts = Date.now();
    const host = `~${airlock.ship}` as Ship;
    if (host !== clientShip) addPending(ts, content);
    const res = await sendChatMsg(meta.host, meta.host, meta.name, content, ts);
    inputRef?.current?.focus();
  }
  return (
    <Box sx={styles.chatInput}>
      <input
        onKeyDown={handleKeyboard}
        ref={inputRef}
        style={styles.textInput}
        type="text"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
      />
      <Button sx={{ borderRadius: "unset" }} variant="contained" onClick={send}>
        Submit
      </Button>
    </Box>
  );
}
