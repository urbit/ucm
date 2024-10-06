import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  Typography,
} from "@mui/material";
import { RichMetadata, Site } from "../logic/types";
import { Link, Route, Switch, useLocation } from "wouter";
import useStore from "../logic/store";
import Sigil from "../ui/Sigil";
import Board from "./Board";
import { ChannelsRes, DiaryEssay, Group, Writ } from "../logic/types-tlon";
import { useEffect, useState } from "react";
import { scrollableStyle } from "../ui/theme";
import { date_diff } from "../logic/utils";
import { Centered } from "../ui/Components";
import { useQuery } from "@tanstack/react-query";

type RichWrit = Writ & { chan: RichMetadata };
function FPage({
  site,
  forums,
  group,
  channelsState,
}: {
  site: Site;
  group: Group;
  forums: RichMetadata[];
  channelsState: ChannelsRes;
}) {
  const [_, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const threads = Object.entries(channelsState).reduce(
      (acc, [chan, state]) => {
        const groupname = state.perms.group.split("/")[1];
        if (groupname !== site.groupname) return acc;
        const [kind, _host, name] = chan.split("/");
        if (kind !== "diary") return acc;
        if (chan.includes("ucm-ublog")) return acc;
        const board = group.channels[chan];
        if (!board) return acc;
        const chanmeta = { ...board.meta, name };
        const poasts = Object.entries(state.posts).map(([k, v]) => {
          const nv = { ...v, chan: chanmeta };
          return [k, nv];
        });
        return { ...acc, ...Object.fromEntries(poasts) };
      },
      {} as Record<string, RichWrit>,
    );
    const sorted = Object.entries(threads).sort(
      ([a, av], [b, bv]) =>
        Number(a.replaceAll(".", "")) - Number(b.replaceAll(".", "")),
    );
    setThreads(sorted);
    setLoading(false);
  }, [channelsState]);
  const [allThreads, setThreads] = useState<Array<[string, RichWrit]>>([]);
  return (
    <Container maxWidth="lg" sx={{ height: "100%" }}>
      <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            flex: "1 0 40%",
            height: "100%",
            overflow: "hidden",
            borderRight: "1px solid black",
          }}
        >
          <Box sx={{ p: 2, height: "3rem", borderBottom: "1px solid black" }}>
            <Typography variant="h5">Forums</Typography>
          </Box>
          <List disablePadding sx={{ ...scrollableStyle, height: "100%" }}>
            {forums.map((f) => (
              <ListItem key={f.name} divider={true}>
                <Link to={`/${f.name}`} style={{ color: "unset" }}>
                  <ForumPreview meta={f} />
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          sx={{
            flex: "1 0 60%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, height: "3rem", borderBottom: "1px solid black" }}>
            <Typography variant="h5">Latest Threads</Typography>
          </Box>
          {loading ? (
            <Centered>
              <CircularProgress />
            </Centered>
          ) : (
            <List
              disablePadding={true}
              sx={{ ...scrollableStyle, height: "100%" }}
            >
              {allThreads
                .sort((a, b) => b[1].essay.sent - a[1].essay.sent)
                .map((t) => (
                  <ListItem key={t[0]} divider={true} sx={{ color: "primary" }}>
                    <Link
                      style={{ color: "unset", width: "100%" }}
                      to={`/${t[1].chan.name}/${t[0].replaceAll(".", "")}`}
                    >
                      <ThreadPreview thread={t} />
                    </Link>
                  </ListItem>
                ))}
            </List>
          )}
        </Box>
      </Box>
    </Container>
  );
}

function ForumPreview({ meta }: { meta: RichMetadata }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Box>
        <Typography variant="h4">{meta.title}</Typography>
        <Typography variant="body2">{meta.description}</Typography>
      </Box>
    </Box>
  );
}
function ThreadPreview({ thread }: { thread: [string, RichWrit] }) {
  const [id, writ] = thread;
  const essay = writ.essay as unknown as DiaryEssay;
  const repCount = writ.seal.meta.replyCount;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        width: "100%",
      }}
    >
      <Box>
        <Sigil patp={essay.author} size={32} />
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography noWrap={true} variant="h6">
          {essay["kind-data"].diary.title}
        </Typography>
        <Typography>{writ.chan.title}</Typography>
      </Box>
      <Box>
        <Typography align="right">{date_diff(essay.sent, "short")}</Typography>
        {repCount > 0 ? (
          <Typography align="right">{repCount} replies</Typography>
        ) : null}
      </Box>
    </Box>
  );
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
  const { io } = useStore(["io"]);
  const { scryChannels } = io();
  const { isLoading, data } = useQuery({
    queryKey: ["channels"],
    queryFn: scryChannels,
  });
  if (!data)
    return (
      <Centered>
        <CircularProgress sx={{ mt: 4 }} />
      </Centered>
    );
  else
    return (
      <Switch>
        <Route
          nest
          path="/:board"
          component={() => Board({ site, group, forums })}
        />
        <Route
          path="/"
          component={() => FPage({ site, forums, group, channelsState: data })}
        />
      </Switch>
    );
}
