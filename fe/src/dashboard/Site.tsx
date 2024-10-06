import { useEffect, useState } from "react";
import {
  AppType,
  Apps,
  Channels,
  ChannelsBunt,
  RichMetadata,
  Ship,
  Site,
  Wiki,
} from "../logic/types";
import {
  Button,
  TextField,
  Typography,
  Box,
  Container,
  CardHeader,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Avatar,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link as MuiLink,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import useStore from "../logic/store";
import {
  AddAppModal,
  ConfirmationModal,
  StaticPageModal,
} from "../modals/Modal";
import { ChannelType, Group } from "../logic/types-tlon";
import { APP_NAME, RADIO_SHIP, WIKI_SHIP } from "../logic/constants";
import { useLocation } from "wouter";
import { capitalize, doubleCheckApps, delay, enkebab } from "../logic/utils";

import DragContainer from "../ui/Drag.tsx";
import { DropResult } from "@hello-pangea/dnd";
import { Centered, SpreadRow } from "../ui/Components.tsx";
import { ExpandMore } from "@mui/icons-material";

export function SiteDash({ site, group }: { site: Site; group: Group }) {
  useEffect(() => {
    setChans();
    // const apporder = ["blog", "chat", "forum", "radio", "wiki", "about"];
    const order = [...site["app-order"]];
    if (!order.includes("blog")) order.push("blog");
    if (!order.includes("chat")) order.push("chat");
    if (!order.includes("forum")) order.push("forum");
    if (!order.includes("radio")) order.push("radio");
    if (!order.includes("wiki")) order.push("wiki");
    for (const title of Object.keys(site.apps.static)) {
      const key = `static/${title}` as AppType;
      if (!order.includes(key)) order.push(key);
    }
    setAppOrder(order as AppType[]);
  }, [group, site]);
  function setChans() {
    const chans = Object.entries(group.channels);
    const agg = chans.reduce((acc: Channels, [nam, chan]) => {
      const [kind, ship, name] = nam.split("/");
      const host = ship as Ship;
      const meta: RichMetadata = {
        ...chan.meta,
        name,
        host,
        kind: kind as ChannelType,
      };
      if (kind === "chat") return { ...acc, chats: [...acc.chats, meta] };
      else if (kind === "diary" && name.includes("ucm-ublog"))
        return { ...acc, blog: meta };
      else if (kind === "diary")
        return { ...acc, forums: [...acc.forums, meta] };
      else return acc;
    }, ChannelsBunt);
    setChannels(agg);
  }

  useEffect(() => {
    fetchWikis();
  }, []);

  async function fetchWikis() {
    try {
      const res = await dashIO().scryWiki();
      setWiki(res.filter((w) => w.public));
    } catch {
      setWiki(null);
    }
  }

  const { setModal, dashIO, pikes, sync } = useStore([
    "setModal",
    "dashIO",
    "pikes",
    "sync",
  ]);
  const [wikis, setWiki] = useState<Wiki[] | null>(null);
  const [modal, showModal] = useState(false);
  const [error, setError] = useState("");
  const [homeMarkdown, setHome] = useState(site.home);
  const [customPalette, setPalette] = useState(site.css);
  const [siteName, setSite] = useState(site.sitename);
  const [siteDesc, setDesc] = useState(site.description);
  const [sitePath, setPath] = useState(site.binding);
  const [siteIcon, setSiteIcon] = useState(site.icon);
  const [hidden, setHidden] = useState(site.hidden);
  const [channels, setChannels] = useState(ChannelsBunt);
  const [appOrder, setAppOrder] = useState<AppType[]>([]);
  const [apps, setApps] = useState<Apps>(site.apps);

  useEffect(() => {
    doubleCheckApps(site.apps, channels, pikes).then((a) => setApps(a));
  }, [channels, site, pikes]);

  function setSitePath(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget.value.slice(1).replace("/", "");
    setPath("/" + input);
  }

  async function save() {
    const ns: Site = {
      description: siteDesc,
      icon: siteIcon,
      home: homeMarkdown,
      css: customPalette,
      binding: sitePath,
      sitename: siteName,
      groupname: enkebab(siteName),
      "app-order": appOrder,
      apps,
      hidden,
    };
    const res = await dashIO().createSite(ns);
    sync();
  }

  // drag
  function reorder(result: DropResult<string>) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const newlist = Array.from(appOrder);
    const [removed] = newlist.splice(result.source.index, 1);
    newlist.splice(result.destination.index, 0, removed);
    setAppOrder(newlist);
  }

  const [loading, setLoading] = useState(false);
  const [_, navigate] = useLocation();
  async function destroy() {
    const res = await dashIO().delSite(site.binding);
    if (res) {
      await sync();
      navigate("/");
    }
  }
  function confirmDestroy() {
    setModal(<ConfirmationModal fun={destroy} text="Destroy" color="error" />);
  }

  return (
    <Box sx={{ overflowY: "auto", height: "100%" }}>
      <Container maxWidth="lg">
        <SpreadRow sx={{ my: 3 }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Button
              onClick={confirmDestroy}
              color="error"
              sx={{ width: "max-content" }}
              variant="contained"
            >
              Destroy
            </Button>
          )}
          <Centered>
            <Typography variant="h3" align="center">
              {site.sitename}
            </Typography>
          </Centered>
          <a href={site.binding}>
            <Button variant="contained">Open</Button>
          </a>
        </SpreadRow>
        <Box
          m={3}
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <TextField
            label="Site Name"
            variant="standard"
            fullWidth
            value={siteName}
            onChange={(e) => setSite(e.currentTarget.value)}
          />
          <TextField
            label="Site Path"
            variant="standard"
            fullWidth
            value={sitePath}
            onChange={setSitePath}
          />
          <TextField
            label="Description"
            variant="standard"
            fullWidth
            multiline
            value={siteDesc}
            onChange={(e) => setDesc(e.currentTarget.value)}
          />
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Avatar src={siteIcon} variant="square" />
            <TextField
              label="Site Icon"
              variant="standard"
              fullWidth
              value={siteIcon}
              onChange={(e) => setSiteIcon(e.currentTarget.value)}
            />
          </Box>
        </Box>
        <Box>
          <Typography align="center" variant="h5">
            Apps
          </Typography>
          <div
            style={{ height: "20rem", marginTop: "2rem", marginBottom: "2rem" }}
            className="dnd-wrapper"
          >
            <DragContainer
              apps={[...appOrder, "static/"]}
              buildCard={cardWrapper({ ...site, apps }, channels, wikis)}
              onEnd={reorder}
            />
          </div>
        </Box>
        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Home Page</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography align="center" variant="body1">
              Write some Markdown to display in the root page of your site
            </Typography>
            <TextField
              sx={{ mt: 3, height: "400px" }}
              slotProps={{
                input: { style: { height: "400px" } },
                htmlInput: { style: { height: "400px" } },
              }}
              multiline
              fullWidth
              value={homeMarkdown}
              onChange={(e) => setHome(e.currentTarget.value)}
            />
          </AccordionDetails>
        </Accordion>

        {/*<Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Custom Styling</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {APP_NAME} uses{" "}
              <MuiLink
                sx={{ mr: "0.5ch" }}
                target="_blank"
                href="https://mui.com/material-ui/customization/palette/"
              >
                Material UI
              </MuiLink>
              for its styling
            </Typography>
            <Typography>
              You can use a custom color palette by adding the palette object in
              JSON format below.
            </Typography>
            <TextField
              sx={{ mt: 3 }}
              multiline
              fullWidth
              rows={40}
              value={customPalette}
              onChange={(e) => setPalette(e.currentTarget.value)}
            />
          </AccordionDetails>
        </Accordion>*/}

        <Centered>
          <Button sx={{ my: 4 }} variant="contained" onClick={save}>
            Save Changes
          </Button>
        </Centered>
      </Container>
    </Box>
  );
}

function cardWrapper(site: Site, channels: Channels, wiki: Wiki[] | null) {
  return function buildCard(a: AppType) {
    const { enabled, content, actions } =
      a === "blog"
        ? buildBlogCard(site, channels)
        : a === "chat"
          ? buildChatCard(site)
          : a === "forum"
            ? buildForumCard(site)
            : a === "radio"
              ? buildRadioCard(site)
              : a === "wiki"
                ? buildWikiCard(site, wiki)
                : buildStaticCard(a, site);

    const opacity = enabled ? 1 : 0.7;
    const title = a.startsWith("static") ? "Static" : capitalize(a);
    return (
      <Card
        sx={{
          borderRadius: 0,
          textAlign: "center",
          height: "100%",
          overflow: "hidden",
          width: "8rem",
          opacity,
          display: "flex",
          flexDirection: "column",
          padding: "0.35rem",
          gap: 0,
        }}
      >
        <CardHeader title={title} />
        <Divider />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {content}
        </CardContent>
        <Divider />
        <CardActions
          sx={{
            justifyContent: "center",
            margin: "0 auto",
            height: "1.8rem",
          }}
        >
          {actions}
        </CardActions>
      </Card>
    );
  };
}

function buildBlogCard(site: Site, channels: Channels) {
  const { setModal, dashIO, sync } = useStore(["setModal", "dashIO", "sync"]);
  const [loading, setLoading] = useState(false);
  function addBlog() {
    setModal(<AddAppModal kind="blog" site={site} />);
  }
  async function toggle(blog: string) {
    setLoading(true);
    const ns = { ...site, apps: { ...site.apps, blog } };
    const res = await dashIO().createSite(ns);
    await sync();
    setLoading(false);
  }
  const enabled = !!site.apps.blog;
  const content = <Typography>{channels.blog?.title}</Typography>;
  const actions = loading ? (
    <CircularProgress />
  ) : !channels.blog ? (
    <Button onClick={addBlog}>Create</Button>
  ) : !enabled ? (
    <Button onClick={() => toggle(channels.blog?.name!)}>Enable</Button>
  ) : (
    <Button onClick={() => toggle("")}>Disable</Button>
  );
  return { enabled, content, actions };
}
function buildChatCard(site: Site) {
  const { setModal } = useStore(["setModal"]);
  function addChat() {
    setModal(<AddAppModal kind="chat" site={site} />);
  }
  const enabled = site.apps.chat.length > 0;
  const content = !enabled ? (
    <Typography>No chats</Typography>
  ) : (
    <List sx={{ height: "100%" }} disablePadding>
      {site.apps.chat.map((c, i) => (
        <ListItem key={c + i} sx={{ p: 0 }}>
          <Box>-{c}</Box>
        </ListItem>
      ))}
    </List>
  );
  const actions = <Button onClick={addChat}>Add</Button>;
  return { enabled, content, actions };
}
function buildForumCard(site: Site) {
  const { setModal } = useStore(["setModal"]);
  function addForum() {
    setModal(<AddAppModal kind="forum" site={site} />);
  }
  const enabled = site.apps.forum.length > 0;
  const content = !enabled ? (
    <Typography>No forums</Typography>
  ) : (
    <List sx={{ height: "100%" }} disablePadding>
      {site.apps.forum.map((c, i) => (
        <ListItem key={c + i} sx={{ p: 0 }}>
          <Box>-{c}</Box>
        </ListItem>
      ))}
    </List>
  );
  const actions = <Button onClick={addForum}>Add</Button>;
  return { enabled, content, actions };
}

function buildRadioCard(site: Site) {
  const { sync, dashIO, pikes } = useStore(["sync", "dashIO", "pikes"]);
  const [loading, setLoading] = useState(false);
  const { createSite, scryPikes } = dashIO();
  async function toggle(bool: boolean) {
    setLoading(true);
    const ns = { ...site, apps: { ...site.apps, radio: bool } };
    await createSite(ns);
    await sync();
    setLoading(false);
  }
  async function install() {
    setLoading(true);
    const res = await dashIO().installApp(RADIO_SHIP, "radio");
    await delay(3000);
    const pikes = await scryPikes();
    if (pikes?.radio?.sync?.ship === RADIO_SHIP) setLoading(false);
    else {
      await delay(5000);
      if (pikes?.radio?.sync?.ship === RADIO_SHIP) setLoading(false);
    }
    // sync();
  }
  const pike = pikes.radio;
  const installed = pike?.sync?.ship === RADIO_SHIP;
  const content = !installed ? <Typography>Not Installed</Typography> : <></>;
  const enabled = site.apps.radio;
  const actions = loading ? (
    <CircularProgress />
  ) : !installed ? (
    <Button onClick={install}>Install</Button>
  ) : site.apps.radio ? (
    <Button onClick={() => toggle(false)}>Disable</Button>
  ) : (
    <Button onClick={() => toggle(true)}>Enable</Button>
  );
  return { enabled, content, actions };
}
function buildWikiCard(site: Site, wiki: Wiki[] | null) {
  const { sync, dashIO, pikes } = useStore(["sync", "dashIO", "pikes"]);
  const [loading, setLoading] = useState(false);
  async function disable() {
    const ns = { ...site, apps: { ...site.apps, wiki: "" } };
    const res = await dashIO().createSite(ns);
    sync();
  }
  async function toggleWiki(name: string) {
    const ns = { ...site, apps: { ...site.apps, wiki: name } };
    const res = await dashIO().createSite(ns);
    sync();
  }
  async function install() {
    setLoading(true);
    const res = await dashIO().installApp(WIKI_SHIP, "wiki");
    sync();
  }
  const pike = pikes.wiki;
  const installed = pike?.sync?.ship === WIKI_SHIP;
  const content = !wiki ? (
    <Typography>Not Installed</Typography>
  ) : (
    wiki.map((w) => (
      <Typography
        sx={{
          cursor: "pointer",
          border: site.apps.wiki === w.id ? "1px solid black" : "none",
        }}
        onClick={() => toggleWiki(w.id)}
        key={w.id}
      >
        {w.title}
      </Typography>
    ))
  );
  const actions = !wiki ? (
    <Button onClick={install}>Install</Button>
  ) : site.apps.wiki ? (
    <Button onClick={disable}>Disable</Button>
  ) : null;

  return { enabled: installed, content, actions };
}

function buildStaticCard(title: string, site: Site) {
  const { setModal } = useStore(["setModal"]);
  async function openEditor() {
    const text = site.apps.static[name];
    setModal(<StaticPageModal name={name} text={text} site={site} />);
  }
  const [_, name] = title.split("/");
  if (name) {
    const content = <Typography>{name}</Typography>;
    const actions = <Button onClick={openEditor}>Edit</Button>;
    return { enabled: true, content, actions };
  } else {
    const content = <></>;
    const actions = <Button onClick={openEditor}>Add</Button>;
    return { enabled: false, content, actions };
  }
}

export default SiteDash;
