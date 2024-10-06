import { RichMetadata, Site, Ship } from "../logic/types";
import Thread from "./BoardThread";
import Composer from "./Composer";
import { Link, Route, Switch, useLocation, useParams } from "wouter";
import useStore from "../logic/store";
import Sigil from "../ui/Sigil";
import {
  Content,
  DiaryPage,
  DiaryPost,
  Group,
  PostsPage,
  Writ,
} from "../logic/types-tlon";
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
import { tokenize, writToMD } from "../logic/tlon-helpers";
import { addDots, date_diff } from "../logic/utils";

export function Board({ page, meta }: { page: DiaryPage; meta: RichMetadata }) {
  const [_, navigate] = useLocation();
  function openEditor() {
    navigate("/e");
  }
  return (
    <WholeFlex sx={{ overflowY: "auto" }}>
      <>
        <Box sx={styles.chatHeader}>
          <Typography variant="h4">{meta!.title}</Typography>
          <Typography variant="body1">{meta!.description}</Typography>
          <Centered>
            <Button
              sx={{ mt: 2 }}
              color="primary"
              variant="contained"
              onClick={openEditor}
            >
              New Post
            </Button>
          </Centered>
        </Box>
        <ThreadList page={page!} meta={meta!} />
      </>
    </WholeFlex>
  );
}

const styles = {
  chatHeader: {
    textAlign: "center",
    borderBottom: "2px solid black",
    padding: "1rem",
  },
  chatList: {
    flexGrow: "1",
  },
  chatMessage: {
    display: "flex",
    gap: "1rem",
    minHeight: "4rem",
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
  threadPreview: {
    gap: "1rem",
    cursor: "pointer",
  },
};

function Loader({ page, meta }: { page: DiaryPage; meta: RichMetadata }) {
  const { lastChannelUpdate } = useStore(["lastChannelUpdate"]);
  const [incoming, setIncoming] = useState<Record<string, DiaryPost>>({});
  useEffect(() => {
    if (!lastChannelUpdate) return;
    const { kind, host, name, update } = lastChannelUpdate;
    if (kind !== "diary") return;
    if (host !== meta.host || name !== meta.name) return;
    // TODO handle new replies and posts
    // if (!("set" in rpost)) return;    // const writ: Writ = { essay: rpost.set.essay, seal: rpost.set.seal };
    // const id = addDots(writ.seal.id, 3);
    // setIncoming((s) => ({ ...s, [id]: writ }));
  }, [lastChannelUpdate]);
  return (
    <ThreadList
      page={{ ...page, posts: { ...page.posts, ...incoming } }}
      meta={meta}
    />
  );
}
function ThreadList({ page, meta }: { page: DiaryPage; meta: RichMetadata }) {
  const [pages, setPages] = useState<PostsPage[]>([]);
  return (
    <List sx={styles.chatList}>
      {Object.values(page.posts)
        .sort((a, b) => b.essay.sent - a.essay.sent)
        .map((p) => (
          <ThreadPreview key={p.seal.id} post={p} board={meta.name} />
        ))}
    </List>
  );
}

function ThreadPreview({ post, board }: { post: DiaryPost; board: string }) {
  const [_, navigate] = useLocation();
  function openThread() {
    const n = post.seal.id;
    navigate(`/${n}`, { state: { thread: post, board } });
  }
  return (
    <ListItem onClick={openThread} sx={styles.threadPreview} divider={true}>
      <Box>
        <Sigil patp={post.essay.author} size={48} />
      </Box>
      <Box sx={{ flexGrow: "1", minWidth: 0 }}>
        <Typography variant="h5" noWrap={true}>
          {post.essay["kind-data"].diary.title}
        </Typography>
        <Snippet content={post.essay.content} />
        <Typography>{post.essay.author}</Typography>
      </Box>
      <Box sx={{ flexShrink: 0, width: "fit-content" }}>
        <Typography>{date_diff(post.essay.sent, "short")}</Typography>
        <Typography>{post.seal.meta.replyCount} replies</Typography>
      </Box>
    </ListItem>
  );
}
function Snippet({ content }: { content: Content }) {
  const markdown = writToMD(content.filter((c) => c));
  const snip = markdown.substring(0, 200);
  const tokens = tokenize(snip);
  const style = {
    container: {
      margin: 0,
    },
    paragraph: {
      margin: 0,
    },
  };
  return <PostContent content={tokens} style={style} />;
}

export default function Router({
  site,
  group,
  forums,
}: {
  site: Site;
  group: Group;
  forums: RichMetadata[];
}) {
  const params: any = useParams();
  const { airlock, io } = useStore(["airlock", "io"]);
  const [dead, setDead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<DiaryPage>();
  const [meta, setMeta] = useState<RichMetadata>();
  useEffect(() => {
    setLoading(true);
    const param = params.board;
    if (!param) setDead(true);
    else getData(param);
  }, [params]);
  async function getData(name: string) {
    const { scryDiary } = io();
    const ship = `~${airlock.ship}` as Ship;
    const us = forums.find((c) => c.name === name);
    if (us) setMeta(us);
    const res = await scryDiary(ship, name, 300);
    setPage(res);
    setLoading(false);
  }

  if (dead) return <NotFound err="chat not found" />;
  else if (loading)
    return (
      <Centered>
        <CircularProgress sx={{ mt: 5 }} />
      </Centered>
    );
  else if (page && meta)
    return (
      <Switch>
        <Route
          path="/e"
          component={() => Composer({ kind: "Forum Thread", meta })}
        />
        <Route path="/:thread" component={Thread} />
        <Route path="/" component={() => Board({ page, meta })} />
      </Switch>
    );
}
