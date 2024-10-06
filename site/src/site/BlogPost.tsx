import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { RichMetadata, Ship, Site } from "../logic/types";
import { useParams } from "wouter";
import useStore from "../logic/store";
import { DiaryPost, Group, Reply } from "../logic/types-tlon";
import { useEffect, useState } from "react";
import { addDots, displayAnon } from "../logic/utils";
import { NotFound } from "./Home";
import { PostContent } from "./PostContent";
import { tokenize } from "../logic/tlon-helpers";
import Sigil from "../ui/Sigil";
// import { TweetSnippet } from "./Snippets";

export default function BlogPost({
  site,
  group,
  meta,
}: {
  site: Site;
  group: Group;
  meta: RichMetadata;
}) {
  const { airlock, io } = useStore(["airlock", "io"]);
  const params: any = useParams();
  useEffect(() => {
    loadPost();
  }, [history.state]);
  async function loadPost() {
    if (history.state?.post) setPost(history.state.post);
    else {
      const { scryDiary } = io();
      const res = await scryDiary(`~${airlock.ship}` as Ship, meta.name, 300);
      const dotId = addDots(params.post, 3);
      const post = res.posts[dotId];
      if (post) setPost(post);
      else setDead(true);
    }
  }
  const [post, setPost] = useState<DiaryPost>();
  const [dead, setDead] = useState(false);
  if (dead) return <NotFound err="Post not found" />;
  return <Box>{post && <Post post={post} meta={meta} />}</Box>;
}

function Post({ post, meta }: { meta: RichMetadata; post: DiaryPost }) {
  const author = post.essay.author;
  const date = new Date(post.essay.sent).toLocaleDateString();
  return (
    <Box sx={{ overflowY: "auto", maxHeight: "95vh", pb: 5 }}>
      <Container maxWidth="md">
        <Box my={3}>
          <Typography color="primary" my={3} variant="h3" align="center">
            {post.essay["kind-data"].diary.title}
          </Typography>
          <Typography variant="body2" align="center">
            Posted by {author} on {date}
          </Typography>
        </Box>
        <Divider />
        <PostContent content={post.essay.content} />
        <Divider />
        <CommentComposer post={post} meta={meta} parent={post.seal.id} />
        <Comments post={post} meta={meta} />
      </Container>
    </Box>
  );
}
function CommentComposer({
  post,
  parent,
  meta,
  replyingTo,
  close,
}: {
  parent: string;
  meta: RichMetadata;
  post: DiaryPost;
  replyingTo?: Ship;
  close?: () => void;
}) {
  useEffect(() => {
    if (replyingTo) setInput(`${replyingTo}: `);
  }, [post, replyingTo]);
  const { io, clientShip, addPending } = useStore([
    "io",
    "clientShip",
    "addPending",
  ]);
  const { sendDiaryReply } = io();
  const [input, setInput] = useState("");
  async function send() {
    setSending(true);
    const content = tokenize(input);
    const ts = Date.now();
    if (meta.host !== clientShip) addPending(ts, content);
    const res = await sendDiaryReply(
      // clientShip,
      meta.host,
      meta.host,
      meta.name,
      addDots(parent, 3),
      content,
      ts,
    );
    if (res) {
      setSending(false);
      if (close) close();
    }
  }
  const [sending, setSending] = useState(false);
  return (
    <Box my={3}>
      <TextField
        className="textarea"
        sx={{
          flexGrow: 1,
          my: 3,
          overflowY: "auto",
          display: "block",
          width: "100%",
        }}
        multiline
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
      />
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" useFlexGap gap={2} alignItems={"center"}>
          <Typography>Posting as</Typography>
          <Sigil patp={clientShip} size={32} />
          <Typography>{clientShip}</Typography>
        </Stack>
        {sending ? (
          <CircularProgress />
        ) : (
          <Button color="primary" onClick={send} variant="contained">
            Submit Comment
          </Button>
        )}
      </Stack>
    </Box>
  );
}
function Comments({ post, meta }: { meta: RichMetadata; post: DiaryPost }) {
  const { lastChannelUpdate } = useStore(["lastChannelUpdate"]);
  useEffect(() => {
    if (!lastChannelUpdate) return;
    const { name, update } = lastChannelUpdate;
    if (name !== meta.name) return;
    const rpost = update;
    if (!("reply" in rpost)) return;
    if (!("set" in rpost.reply["r-reply"])) return;
    const rep: Reply = rpost.reply["r-reply"].set;
    const id = addDots(rep.seal.id, 3);
    setIncoming((s) => ({ ...s, [id]: rep }));
  }, [lastChannelUpdate]);
  const [incoming, setIncoming] = useState<Record<string, Reply>>({});
  return (
    <Box my={3} pl={2} sx={{ borderLeft: "1px solid lightgrey" }}>
      <Box>
        <Typography color="primary" my={3} variant="h5" align="center">
          {post.seal.meta.replyCount} comments
        </Typography>
      </Box>
      {Object.values({ ...post.seal.replies, ...incoming })
        .sort((a, b) => a.memo.sent - b.memo.sent)
        .map((r) => (
          <Comment post={post} meta={meta} comment={r} />
        ))}
    </Box>
  );
}
function Comment({
  post,
  meta,
  comment,
}: {
  post: DiaryPost;
  meta: RichMetadata;
  comment: Reply;
}) {
  const [replying, setReplying] = useState(false);
  return (
    <Box my={2}>
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Typography fontFamily={"monospace"} fontWeight={700}>
          {displayAnon(comment.memo.author)}
        </Typography>
        <Typography>{new Date(comment.memo.sent).toLocaleString()}</Typography>
      </Box>
      <PostContent content={comment.memo.content} />
      <Link color="secondary" onClick={() => setReplying(true)}>
        Reply
      </Link>
      {replying && (
        <CommentComposer
          post={post}
          parent={post.seal.id}
          meta={meta}
          replyingTo={comment.memo.author}
          close={() => setReplying(false)}
        />
      )}
    </Box>
  );
}
