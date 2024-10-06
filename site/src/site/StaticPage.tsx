import { Box, Container, Typography } from "@mui/material";
import { Site } from "../logic/types";
import { marked } from "marked";
import ReactHtmlParser from "react-html-parser";
import { useEffect, useState } from "react";

export default function StaticPage({
  site,
  title,
  markdown,
}: {
  site: Site;
  title: string;
  markdown: string;
}) {
  useEffect(() => {
    marked.parse(markdown, { async: true }).then((h) => setHTML(h));
  }, [markdown]);
  const [html, setHTML] = useState("");
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography align="center" variant="h4">
          {title}
        </Typography>
      </Box>
      <Box>{ReactHtmlParser(html)}</Box>
    </Container>
  );
}
export function MarkdownPage({ markdown }: { markdown: string }) {
  useEffect(() => {
    marked.parse(markdown, { async: true }).then((h) => setHTML(h));
  }, [markdown]);
  const [html, setHTML] = useState("");
  return <Box>{ReactHtmlParser(html)}</Box>;
}
