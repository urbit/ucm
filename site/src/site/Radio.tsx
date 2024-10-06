import {
  AppBar,
  Box,
  Container,
  Divider,
  Toolbar,
  Typography,
  Link as Lin,
  TextField,
  Button,
  List,
  ListItem,
  Stack,
} from "@mui/material";
import { displayAnon } from "../logic/utils";
import ReactPlayer from "react-player";
import useStore from "../logic/store";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Centered } from "../ui/Components";
import { Ship } from "../logic/types";
import { OnProgressProps } from "react-player/base";

type Chatlog = Array<{ from: Ship; message: string; time: number }>;
export default function Radio() {
  const { airlock, io, clientShip } = useStore(["airlock", "io", "clientShip"]);
  const { radioSub, radioSub2, radioSpin, radioChat } = io();
  useEffect(() => {
    // airlock.subscribeOnce("tower", "/personal").then((data) => {
    // });
    radioSub((data) => {
      console.log(data, "radio sub");
      if ("chat" in data) setChatlog((cl) => [...cl, data.chat]);
      if ("spin" in data) {
        setURL(data.spin.time);
        setSpinTime(data.spin.time);
      }
    });
    // });
  }, []);

  useEffect(() => {
    radioSub2((data) => {
      console.log(data, "radio sub2");
      if (!("tower-update" in data)) return;
      const tower = data["tower-update"];
      setTitle(tower.talk);
      setTitleInput(tower.talk);
      setDesc(tower.description);
      setDescInput(tower.description);
      setURL(tower.spin.url);
      setInput(tower.spin.url);
      setSpinTime(tower.spin.time);
      setViewers(tower.viewers);
      setChatlog(tower.chatlog);
    });
  }, []);
  async function submit() {
    const res = await radioSpin(titleInput, descInput, input);
    if (res) {
      window.location.reload();
    }
  }
  const [error, setError] = useState("");
  // admin
  const [input, setInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  // radio

  const [chatlog, setChatlog] = useState<Chatlog>([]);
  const [mediaURL, setURL] = useState("");
  const [spinTime, setSpinTime] = useState(0);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [viewers, setViewers] = useState<Ship[]>([]);
  function handleReady(a: any) {
    console.log(a, "radio ready");
  }
  const playerRef = useRef<ReactPlayer>(null);
  function handleProgress(progress: OnProgressProps) {
    if (!playerRef.current) return;
    const duration = playerRef.current.getDuration();
    if (!duration) return;
    const localProgress = progress.playedSeconds;
    const ts = Date.now() / 1000;
    let globalProgress = Math.ceil(ts - spinTime);
    globalProgress = globalProgress % duration;
    const outOfSync = Math.abs(localProgress - globalProgress);
    if (outOfSync > 2) resync();
  }
  useEffect(() => {
    resync();
  }, [spinTime]);
  function resync() {
    if (!playerRef.current) return;
    const ts = Date.now() / 1000;
    const globalProgress = Math.ceil(ts - spinTime);
    if (globalProgress > 10_000) return;
    playerRef.current.seekTo(globalProgress, "seconds");
  }
  // chatbox
  useLayoutEffect(() => {
    scrollDown();
  }, [chatlog]);

  function scrollDown() {
    bottomRef?.current?.scrollIntoView({ behavior: "instant" });
  }
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <Container maxWidth="lg" sx={{ overflowY: "auto", height: "100%" }}>
      <Box my={2} mb={4}>
        <Typography variant="h2" align="center">
          Radio
        </Typography>
      </Box>
      {`~${airlock.ship}` === clientShip && (
        <Box my={3}>
          <Typography variant="h6">Choose what to play</Typography>
          <Stack sx={{ mt: 2, gap: 1 }} useFlexGap>
            <TextField
              label="Session Title"
              name="title"
              fullWidth
              id="title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.currentTarget.value)}
            />
            <TextField
              label="Description"
              name="desc"
              fullWidth
              id="desc"
              value={descInput}
              onChange={(e) => setDescInput(e.currentTarget.value)}
            />
            <TextField
              label="Media URL"
              autoComplete="url"
              name="url"
              required
              fullWidth
              id="url"
              placeholder="https://youtube.com/something"
              error={!!error}
              helperText={error}
              color={error ? "error" : "primary"}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
            />
            <Button sx={{ width: "6rem" }} variant="contained" onClick={submit}>
              Submit
            </Button>
          </Stack>
        </Box>
      )}
      <Box py={3}>
        <Typography variant="h6">Current Session: {title}</Typography>
        <Typography variant="body1">{desc}</Typography>
      </Box>
      <Divider />
      <Stack
        direction="row"
        useFlexGap
        sx={{ width: "100%", gap: 1, flexWrap: "wrap" }}
      >
        <Box sx={{ flex: "1 0 70%", minHeight: "360px" }}>
          <ReactPlayer
            ref={playerRef}
            url={mediaURL}
            // autoPlay={true}
            playing={true}
            controls={true}
            width="100%"
            height="100%"
            loop={true}
            onReady={handleReady}
            onProgress={handleProgress}
          />
        </Box>
        <Stack sx={{ border: "1px solid black" }}>
          <Typography align="center" variant="h6">
            Radio Chat
          </Typography>
          <List
            sx={{
              flexGrow: "1",
              borderTop: "1px solid black",
              borderBottom: "1px solid black",
              maxHeight: "50vh",
              overflowY: "auto",
            }}
          >
            {chatlog.slice(-50).map((msg, i) => (
              <ListItem key={msg.time + i}>
                <Box>
                  <Typography fontWeight={700}>
                    {displayAnon(msg.from)}:
                  </Typography>
                  <Typography>{msg.message}</Typography>
                </Box>
              </ListItem>
            ))}
            <div id="br" ref={bottomRef} />
          </List>
          <Input />
        </Stack>
      </Stack>
    </Container>
  );
}
function Input() {
  const { io, clientShip } = useStore(["io", "clientShip"]);
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
    const { radioChat } = io();
    await radioChat(clientShip, input);
    inputRef?.current?.focus();
  }
  return (
    <Box sx={{ display: "flex" }}>
      <input
        onKeyDown={handleKeyboard}
        ref={inputRef}
        style={{
          flexGrow: "1",
          padding: "0 1rem",
          outline: "none",
          border: "none",
        }}
        type="text"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
      />
      <Button variant="contained" onClick={send} sx={{ borderRadius: "unset" }}>
        Submit
      </Button>
    </Box>
  );
}
