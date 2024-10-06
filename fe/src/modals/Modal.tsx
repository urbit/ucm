import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Alert,
  Button,
  TextField,
  Typography,
  Box,
  Container,
  AvatarGroup,
  Stack,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogActions,
  ButtonPropsColorOverrides,
} from "@mui/material";
import useStore from "../logic/store";
import { Site, AppType, Ship } from "../logic/types";
import { tokenize } from "../logic/tlon-helpers";
import { addDots, capitalize } from "../logic/utils";
import { Row, Scrollable, WholeFlex } from "../ui/Components";

export default function MuhModal({ children }: { children: ReactNode }) {
  const { setModal } = useStore(["setModal"]);
  function close(e: any, reason: any) {
    setModal(null);
  }
  function onKey(event: any) {
    if (event.key === "Escape") setModal(null);
  }
  useEffect(() => {
    document.addEventListener("keyup", onKey);
    return () => {
      document.removeEventListener("keyup", onKey);
    };
  }, [children]);

  function clickAway(e: React.MouseEvent) {
    e.stopPropagation();
    if (!modalRef.current || !modalRef.current.contains(e.target as any))
      setModal(null);
  }
  const modalRef = useRef<HTMLDivElement>(null);
  const bgStyle = {
    position: "fixed" as "fixed",
    left: 0,
    top: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgb(0, 0, 0, 0.7)",
    zIndex: 0,
  };
  const modalStyle = {
    position: "fixed" as "fixed",
    transform: "translate(-50%, -50%)",
    top: "50%",
    left: "50%",
    backgroundColor: "white",
  };
  return (
    <div style={bgStyle} id="modal-background" onClick={clickAway}>
      <div style={modalStyle} id="modal" ref={modalRef}>
        {children}
      </div>
    </div>
  );
}
export function StaticPageModal({
  name,
  text,
  site,
}: {
  name: string;
  text: string;
  site: Site;
}) {
  useEffect(() => {
    setTitle(name);
    setInput(text);
    const tit = localStorage.getItem("staticPageDraftTitle");
    if (tit) setTitle(tit);
    const inp = localStorage.getItem("staticPageDraftInput");
    if (inp) setInput(inp);
  }, []);
  const { sync, setModal, dashIO } = useStore(["sync", "setModal", "dashIO"]);
  const [location, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const { createSite } = dashIO();
  async function save() {
    localStorage.removeItem("staticPageDraftTitle");
    localStorage.removeItem("staticPageDraftInput");
    const stat = { ...site.apps.static, [title]: input };
    const apps = { ...site.apps, static: stat };
    const ns = { ...site, apps };
    console.log(ns, "ns");
    await createSite(ns);
    sync().then((_) => setModal(null));
  }
  async function del() {
    const { [name]: _, ...rest } = site.apps.static;
    const apps = { ...site.apps, static: rest };
    const ns = { ...site, apps };
    await createSite(ns);
    sync().then((_) => setModal(null));
  }
  useEffect(() => {
    console.log("setting", title);
    if (title) localStorage.setItem("staticPageDraftTitle", title);
  }, [title]);
  useEffect(() => {
    if (input) localStorage.setItem("staticPageDraftInput", input);
  }, [input]);
  return (
    <Container sx={{ height: "90vh", width: "90vw", padding: "1rem" }}>
      <WholeFlex>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
        >
          <Typography align="center" variant="h4">
            Static Page Editor
          </Typography>
          <Button color="primary" onClick={save} variant="contained">
            Save
          </Button>
        </Stack>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Page Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <TextField
          className="textarea"
          label="Markdown"
          sx={{ flexGrow: 1, my: 3 }}
          slotProps={{
            htmlInput: {
              sx: { height: "100%" },
            },
          }}
          multiline
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <Box>
          <Button
            color="error"
            variant="contained"
            sx={{ fontSize: "0.7rem", marginRight: "auto", display: "block" }}
            onClick={del}
          >
            Delete
          </Button>
        </Box>
      </WholeFlex>
    </Container>
  );
}

export function AddAppModal({ kind, site }: { kind: AppType; site: Site }) {
  // weird that this has to be written manually
  const style = {
    container: {
      width: "70vw",
      bgcolor: "background.paper",
      border: "2px solid #000",
      boxShadow: 24,
      py: 3,
      px: 4,
      height: "90vh",
    },
    coverImg: {
      border: "1px solid primary.dark",
      width: "100%",
      minHeight: "3rem",
      display: "block",
      marginTop: "2ch",
    },
  };
  const { sync, setModal, dashIO } = useStore(["sync", "setModal", "dashIO"]);
  const [location, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImg] = useState("");
  const [error, setError] = useState("");

  // TODO add automated name change logic if site already exists
  async function create() {
    const { createBlog, createChannel } = dashIO();
    if (!title) {
      setError("name can't be empty");
      return;
    }
    const taip = kind === "chat" ? "chat" : kind === "forum" ? "diary" : "";
    const res =
      kind === "blog"
        ? await createBlog(site.groupname, title, desc)
        : await createChannel(site.groupname, title, desc, taip);
    if (res) {
      await sync();
      setModal(null);
      console.log(res, "res");
    }
  }
  return (
    <WholeFlex sx={style.container}>
      <Typography variant="h4" align="center">
        Add {capitalize(kind)}
      </Typography>

      {error && <Alert severity="error">{error}.</Alert>}
      <Scrollable
        sx={{
          my: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <TextField
          label="Name"
          variant="standard"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <TextField
          label="Description"
          variant="standard"
          fullWidth
          value={desc}
          onChange={(e) => setDesc(e.currentTarget.value)}
        />
        {kind === "blog" || kind === "forum" ? (
          <Box>
            <TextField
              label="Cover Image"
              variant="standard"
              fullWidth
              value={image}
              onChange={(e) => setImg(e.currentTarget.value)}
            />
            <img style={style.coverImg} src={image} />
          </Box>
        ) : (
          <></>
        )}
      </Scrollable>
      <Button variant="contained" onClick={create}>
        Create
      </Button>
      <Link to="/">
        <Button variant="text">Cancel</Button>
      </Link>
    </WholeFlex>
  );
}

export function ConfirmationModal({
  fun,
  color,
  text,
}: {
  text: string;
  color: any;
  fun: any;
}) {
  const { setModal } = useStore(["setModal"]);
  return (
    <Dialog maxWidth="md" open={true}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogActions>
        <Button onClick={() => setModal(null)} variant="text">
          Cancel
        </Button>
        <Button onClick={fun} variant="contained" color={color}>
          {text}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
