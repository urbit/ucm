import {
  Container,
  Typography,
  Link as Lin,
  Button,
  Stack,
  TextField,
  CircularProgress,
} from "@mui/material";
import { RichMetadata, Ship, Site } from "../logic/types";
import useStore from "../logic/store";
import { useEffect, useState } from "react";
import { tokenize } from "../logic/tlon-helpers";
import { WholeFlex } from "../ui/Components";

export default function Editor({
  kind,
  meta,
}: {
  kind: string;
  meta: RichMetadata;
}) {
  useEffect(() => {
    const tit = localStorage.getItem("blogDraftTitle");
    if (tit) setTitle(tit);
    const inp = localStorage.getItem("blogDraftInput");
    if (inp) setInput(inp);
    const img = localStorage.getItem("blogDraftImage");
    if (img) setImage(img);
  }, []);
  const { io, airlock, addPending } = useStore([
    "airlock",
    "sync",
    "setModal",
    "io",
    "clientShip",
    "addPending",
  ]);
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { sendDiaryPost } = io();
  async function save() {
    setSaving(true);
    const host = `~${airlock.ship}` as Ship;
    const clientShip = (window as any).ship;
    const content = tokenize(input);
    const ts = Date.now();
    if (host !== clientShip) addPending(ts, content);
    const res = await sendDiaryPost(
      // clientShip,
      host,
      host,
      meta.name,
      title,
      image,
      content,
      ts,
    );
    console.log(res, "res");
    if (res) {
      localStorage.removeItem("blogDraftTitle");
      localStorage.removeItem("blogDraftInput");
      localStorage.removeItem("blogDraftImage");
      history.back();
    }
  }
  useEffect(() => {
    if (title) localStorage.setItem("blogDraftTitle", title);
  }, [title]);
  useEffect(() => {
    if (input) localStorage.setItem("blogDraftInput", input);
  }, [input]);
  useEffect(() => {
    if (input) localStorage.setItem("blogDraftImage", image);
  }, [image]);
  return (
    <Container sx={{ p: 3, height: "100%" }}>
      <WholeFlex>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
        >
          <Typography align="center" variant="h4">
            {kind} Editor
          </Typography>
          {!saving ? (
            <Button color="primary" onClick={save} variant="contained">
              Save
            </Button>
          ) : (
            <CircularProgress />
          )}
        </Stack>
        <Stack useFlexGap sx={{ gap: 2, flexGrow: 1 }}>
          <TextField
            fullWidth
            variant="filled"
            placeholder="Cover Image"
            value={image}
            onChange={(e) => setImage(e.currentTarget.value)}
          />
          <TextField
            fullWidth
            label="Title"
            variant="standard"
            placeholder="Page Title"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <TextField
            className="textarea"
            label="Markdown"
            sx={{ flexGrow: 1, my: 3, overflowY: "auto" }}
            multiline
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </Stack>
      </WholeFlex>
    </Container>
  );
}
