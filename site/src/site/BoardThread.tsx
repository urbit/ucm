import { scrollableStyle } from "../ui/theme";
import { RichMetadata, Site, Ship } from "../logic/types";
import { Link, Route, Switch, useLocation, useParams } from "wouter";
import useStore from "../logic/store";
import Sigil from "../ui/Sigil";
import {
  ChanString,
  ChannelsRes,
  Content,
  DiaryPage,
  DiaryPost,
  Group,
  Memo,
  PostsPage,
  Reply,
  ReplySeal,
  Writ,
} from "../logic/types-tlon";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  List,
  ListItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NotFound } from "./Home";
import { PostContent } from "./PostContent";
import { WholeFlex } from "../ui/Components";
import { tokenize, writToMD } from "../logic/tlon-helpers";
import { addDots, date_diff } from "../logic/utils";

export default function Thread() {
  const { airlock, io } = useStore(["airlock", "io"]);
  const { scryChannels } = io();
  const chansQuery = useQuery({
    queryKey: ["channels"],
    queryFn: scryChannels,
  });

  const params: any = useParams();
  const [dead, setDead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boardName, setBoard] = useState("");
  const [thread, setThread] = useState<DiaryPost>();
  // const [meta, setMeta] = useState<RichMetadata>();
  useEffect(() => {
    loadPost();
  }, [params]);
  async function loadPost() {
    if (history.state) {
      const { thread, board } = history.state;
      if (thread && board) {
        setThread(history.state.thread);
        setBoard(history.state.board);
      }
    } else {
      const { board, thread } = params;
      if (board) setBoard(board);
      if (board && thread && chansQuery.data)
        getData(board, thread, chansQuery.data);
      else setDead(true);
    }
  }

  async function getData(
    name: string,
    tid: string,
    channelsState: ChannelsRes,
  ) {
    const dted = addDots(tid, 3);
    const host = `~${airlock.ship}`;
    const chanString = `diary/${host}/${name}` as ChanString;
    const board = channelsState[chanString];
    const ted = board.posts[dted] as unknown as DiaryPost;
    setThread(ted);
    // const { scryDiaryPost } = io();
    // const ship = `~${airlock.ship}` as Ship;
    // const res = await scryDiaryPost(ship, name, dted);
    // setThread(res);
    setLoading(false);
  }

  if (dead) return <NotFound err="chat not found" />;
  else if (loading) return <CircularProgress sx={{ mt: 5 }} />;
  else if (thread && boardName)
    return (
      <WholeFlex sx={{ ...scrollableStyle }}>
        <Container>
          <Typography align="center" sx={{ my: 4, mb: 0 }} variant="h4">
            {thread.essay["kind-data"].diary.title}
          </Typography>
          <Posts thread={thread} board={boardName} />
        </Container>
      </WholeFlex>
    );
  else return <div />;
}

function Posts({ thread, board }: { board: string; thread: DiaryPost }) {
  const { lastChannelUpdate } = useStore(["lastChannelUpdate"]);
  const seal = { ...thread.seal, "parent-id": thread.seal.id };
  useEffect(() => {
    if (!lastChannelUpdate) return;
    const { kind, name, update } = lastChannelUpdate;
    if (kind !== "diary") return;
    if (name !== board) return;
    const rpost = update;
    if (!("reply" in rpost)) return;
    if (!("set" in rpost.reply["r-reply"])) return;
    const rep: Reply = rpost.reply["r-reply"].set;
    const id = addDots(rep.seal.id, 3);
    setIncoming((s) => ({ ...s, [id]: rep }));
  }, [lastChannelUpdate]);
  const [incoming, setIncoming] = useState<Record<string, Reply>>({});

  return (
    <List sx={{ gap: "1rem" }}>
      <ThreadPost memo={thread.essay} seal={seal} boardName={board} />
      {Object.values({ ...thread.seal.replies, ...incoming })
        .sort((a, b) => a.memo.sent - b.memo.sent)
        .map((p) => (
          <ThreadPost
            key={p.seal.id}
            memo={p.memo}
            seal={p.seal}
            boardName={board}
          />
        ))}
    </List>
  );
}

import LinkIcon from "@mui/icons-material/Link";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ReplyIcon from "@mui/icons-material/Reply";
import { ForumReplyModal } from "../modals/Modal";
import { useQuery } from "@tanstack/react-query";

function ThreadPost({
  memo,
  seal,
  boardName,
}: {
  memo: Memo;
  seal: ReplySeal;
  boardName: string;
}) {
  const postStyle = {
    paragraph: {
      marginLeft: 0,
      marginRight: 0,
    },
    container: {},
  };
  const datetime = new Date(memo.sent).toLocaleString();

  async function handleLink(e: React.MouseEvent) {
    e.stopPropagation();
    const r = await navigator.clipboard.writeText(window.location.href);
  }
  useEffect(() => {
    const s = Object.values(seal.reacts).reduce((acc, item) => {
      return item === "👍" ? acc + 1 : item === "👎" ? acc - 1 : acc;
    }, 0);
    setScore(s);
  }, [seal]);
  const [score, setScore] = useState(0);
  const [replying, setReplying] = useState(false);
  const [input, setInput] = useState("");
  const { airlock, io, clientShip, addPending } = useStore([
    "airlock",
    "io",
    "clientShip",
    "addPending",
  ]);
  const { sendDiaryReply, sendReplyReact, sendReact } = io();
  async function doReact(react: string) {
    if (!canPoke) return;
    setCanPoke(false);
    const host = `~${airlock.ship}` as Ship;
    const res =
      seal.id === seal["parent-id"]
        ? await sendReact(
            clientShip,
            "diary",
            host,
            boardName,
            addDots(seal.id, 3),
            react,
          )
        : await sendReplyReact(
            clientShip,
            "diary",
            host,
            boardName,
            addDots(seal["parent-id"], 3),
            addDots(seal.id, 3),
            react,
          );
    console.log("react sent");
    if (res) {
      setTimeout(() => {
        setCanPoke(true);
      }, 3000);
    }
  }
  async function sendReply() {
    setSending(true);
    const host = `~${airlock.ship}` as Ship;
    const content = tokenize(input);
    const ts = Date.now();
    if (host !== clientShip) addPending(ts, content);
    const res = await sendDiaryReply(
      host,
      // clientShip,
      host,
      boardName,
      // WTF Can't nest replies! thanks Tlon
      addDots(seal["parent-id"], 3),
      content,
      ts,
    );
    if (res) {
      setSending(false);
      setReplying(false);
    }
  }
  const [sending, setSending] = useState(false);
  const [canPoke, setCanPoke] = useState(true);
  return (
    <ListItem sx={styles.poast}>
      <Box mb="auto" sx={{ maxWidth: "13ch" }}>
        <Sigil patp={memo.author} size={64} />
        <Typography>{memo.author}</Typography>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={styles.postMeta}>
          <Box>
            <Typography>Posted: {datetime}</Typography>
          </Box>
          <Toolbar sx={{ gap: "0.5rem", cursor: "pointer" }}>
            <LinkIcon onClick={handleLink} />
            <ThumbUpIcon onClick={() => doReact("👍")} />
            <Typography color={score >= 0 ? "green" : "red"}>
              {score}
            </Typography>
            <ThumbDownIcon onClick={() => doReact("👎")} />
            <ReplyIcon onClick={() => setReplying(true)} />
          </Toolbar>
        </Box>
        <PostContent content={memo.content} style={postStyle} />
        {replying && (
          <Box sx={{ border: "1px solid black", px: 2, pb: 2 }}>
            <TextField
              className="textarea"
              label="Markdown"
              fullWidth
              sx={{ flexGrow: 1, my: 3, overflowY: "auto" }}
              multiline
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
            />
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" useFlexGap gap={2} alignItems={"center"}>
                <Typography>Replying as</Typography>
                <Sigil patp={clientShip} size={32} />
                <Typography>{clientShip}</Typography>
              </Stack>
              {sending ? (
                <CircularProgress />
              ) : (
                <Button color="primary" onClick={sendReply} variant="contained">
                  Submit
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Box>
    </ListItem>
  );
}

const styles = {
  poast: {
    border: "1px solid black",
    gap: "1rem",
  },
  postMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid black",
    height: "2rem",
  },
};
