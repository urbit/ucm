import {
  Box,
  Container,
  Divider,
  Typography,
  Link as Lin,
  Button,
  List,
  ListItem,
  CircularProgress,
} from "@mui/material";
import { RichMetadata, Ship, Site } from "../logic/types";
import { Link, Route, Switch, useLocation } from "wouter";
import useStore from "../logic/store";
import { Content, DiaryPage, DiaryPost, Group } from "../logic/types-tlon";
import { tokenize, writToMD } from "../logic/tlon-helpers";
import BlogPost from "./BlogPost";
import { PostContent } from "./PostContent";
import { Centered } from "../ui/Components";
import Composer from "./Composer";
import { useQuery } from "@tanstack/react-query";
export default function Page({
  site,
  group,
  meta,
}: {
  site: Site;
  group: Group;
  meta: RichMetadata;
}) {
  return (
    <Switch>
      <Route
        path="/e"
        component={() => Composer({ kind: "Blog Post", meta })}
      />
      <Route
        path="/:post"
        nest
        component={() => BlogPost({ site, group, meta })}
      />
      <Route path="/" component={() => BlogPage({ meta })} />
    </Switch>
  );
}
function BlogPage({ meta }: { meta: RichMetadata }) {
  const { io, clientShip } = useStore(["airlock", "io", "clientShip"]);
  const { scryDiary } = io();
  const { isLoading, data } = useQuery({
    queryKey: ["diary", meta.name],
    queryFn: () => scryDiary(meta.host, meta.name, 300),
  });
  const [_, navigate] = useLocation();
  function openEditor() {
    navigate("/e");
  }
  return (
    <Box sx={{ overflowY: "auto", height: "100%" }}>
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h2" align="center">
            {meta.title}
          </Typography>
          <Typography variant="subtitle1" align="center">
            {meta.description}
          </Typography>
          {meta.host === clientShip ? (
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
          ) : (
            <></>
          )}
        </Box>
        <Divider />

        {!data ? (
          <Centered>
            <CircularProgress sx={{ mt: 4 }} />
          </Centered>
        ) : (
          <PostList page={data} />
        )}
      </Container>
    </Box>
  );
}

function PostList({ page }: { page: DiaryPage }) {
  return (
    <List>
      {Object.entries(page.posts)
        .sort((a, b) => b[1].essay.sent - a[1].essay.sent)
        .map((entry) => (
          <ListItem key={entry[0]}>
            <PostPreview post={entry[1]} />
          </ListItem>
        ))}
    </List>
  );
}

function PostPreview({ post }: { post: DiaryPost }) {
  const [_, navigate] = useLocation();
  const date = new Date(post.essay.sent).toLocaleDateString();
  const commentCount = post.seal.meta.replyCount;
  function openPost() {
    navigate(`/${post.seal.id}`, { state: { post } });
  }
  return (
    <Box my={3} sx={{ width: "100%" }}>
      <Typography
        sx={styles.previewTitle}
        onClick={openPost}
        variant="h4"
        align="center"
      >
        {post.essay["kind-data"].diary.title}
      </Typography>
      <Snippet content={post.essay.content} />
      <Box>
        <Lin onClick={openPost} variant="body1">
          Continue
        </Lin>

        <Typography variant="body2">Posted on {date}</Typography>
        {commentCount > 0 && (
          <Typography variant="body2">{commentCount} comments</Typography>
        )}
      </Box>
    </Box>
  );
}

function Snippet({ content }: { content: Content }) {
  const markdown = writToMD(content);
  const snip = markdown.substring(0, 200);
  const tokens = tokenize(snip);
  return <PostContent content={tokens} />;
}

const styles = {
  previewTitle: {
    cursor: "pointer",
    color: "primary.main",
  },
};
