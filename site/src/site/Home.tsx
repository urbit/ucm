import { useEffect, useState } from "react";
import { Channels, ChannelsBunt, Ship, Site } from "../logic/types";
import {
  Button,
  Typography,
  Box,
  Container,
  CircularProgress,
  Divider,
} from "@mui/material";
import useStore from "../logic/store";
import ChatPage from "./Chat";
import ForumPage from "./Forum";
import BlogPage from "./Blog";
import SearchPage from "./Search";
import Radio from "./Radio";
import Login from "./Login";
import UserPage from "./User";
import { ChannelType, Group } from "../logic/types-tlon";
import Navbar from "./Navbar";
import StaticPage, { MarkdownPage } from "./StaticPage";
import { Router, Route, Link, Switch, useLocation, useParams } from "wouter";
import { Centered, WholeFlex } from "../ui/Components";
import { isValidPatp } from "../logic/ob/co";
import { BASE_PATH } from "../logic/constants";
import { useQueryClient } from "@tanstack/react-query";

export function Home({ site, group }: { site: Site; group: Group }) {
  const { clientShip, io } = useStore(["clientShip", "io"]);
  const { scryChannels } = io();
  const queryClient = useQueryClient();
  async function prefetch() {
    // Not that prefetching does much in a single-threaded runtime...
    await queryClient.prefetchQuery({
      queryKey: ["channels"],
      queryFn: scryChannels,
    });
  }
  useEffect(() => {
    prefetch();
  }, []);

  useEffect(() => {
    let favicon = document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
      favicon.href = site.icon;
    }
    let title = document.querySelector("title");
    if (title) title.innerText = site.sitename;
  }, [site]);
  useEffect(() => {
    setChans();
  }, [group]);
  function setChans() {
    const chans = Object.entries(group.channels);
    const agg = chans.reduce((acc: Channels, [nam, chan]) => {
      const [kind, ship, name] = nam.split("/");
      const host = ship as Ship;
      const meta = { ...chan.meta, name, host, kind: kind as ChannelType };
      if (kind === "chat") return { ...acc, chats: [...acc.chats, meta] };
      else if (kind === "diary" && name.includes("ucm-ublog"))
        return { ...acc, blog: meta };
      else if (kind === "diary")
        return { ...acc, forums: [...acc.forums, meta] };
      else return acc;
    }, ChannelsBunt);
    setChannels(agg);
    setLoading(false);
  }
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState(ChannelsBunt);

  if (loading)
    return (
      <Centered>
        <CircularProgress sx={{ mt: 5 }} />
      </Centered>
    );
  else
    return (
      <WholeFlex>
        <>
          <Router base={BASE_PATH}>
            <Navbar site={site} />
            <Box sx={{ flexGrow: "1", overflow: "hidden" }}>
              <Switch>
                <Route path="/" component={() => HomePage({ site, group })} />
                <Route path="/login" component={Login} />
                <Route
                  path="/chat"
                  nest
                  component={() =>
                    ChatPage({ site, group, chats: channels.chats })
                  }
                />
                <Route
                  path="/forum"
                  nest
                  component={() =>
                    ForumPage({ site, group, forums: channels.forums })
                  }
                />
                <Route
                  path="/blog"
                  nest
                  component={() =>
                    BlogPage({ site, group, meta: channels.blog! })
                  }
                />
                <Route path="/radio" component={Radio} />
                <Route
                  path="/search"
                  nest
                  component={() => SearchPage({ site })}
                />
                <Route path="/user/:patp">
                  {(params) => {
                    const patp = params.patp as Ship;
                    if (clientShip.length > 28)
                      return <NotFound err="Not logged in" />;
                    if (isValidPatp(patp)) return <UserPage patp={patp} />;
                    else return <NotFound err="Invalid user" />;
                  }}
                </Route>
                <Route path="/:page">
                  {(params) => {
                    const text = site.apps.static[params.page];
                    if (!text) return <NotFound err="page not found" />;
                    else
                      return (
                        <StaticPage
                          title={params.page}
                          markdown={text}
                          site={site}
                        />
                      );
                  }}
                </Route>
              </Switch>
            </Box>
          </Router>
        </>
      </WholeFlex>
    );
}

function HomePage({ site, group }: { site: Site; group: Group }) {
  return (
    <Container sx={{ mt: 6 }}>
      <Typography align="center" variant="h2">
        {site.sitename}
      </Typography>
      <Divider sx={{ m: 4 }} />
      <Typography align="center" variant="h5">
        {site.description}
      </Typography>
      <Divider />
      <Container sx={{ mt: 4 }}>
        <MarkdownPage markdown={site.home} />
      </Container>
    </Container>
  );
}

export default Home;

export function NotFound({ err }: { err: string }) {
  return (
    <Container>
      <Typography>{err} not found</Typography>
      <Link to="../../">
        <Button>Go Back</Button>
      </Link>
    </Container>
  );
}
