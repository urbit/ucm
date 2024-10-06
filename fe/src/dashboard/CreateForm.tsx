import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Alert,
  Button,
  TextField,
  Typography,
  Box,
  Container,
  Card,
  CardHeader,
  CardContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import useStore from "../logic/store";
import { AppBunt, Site } from "../logic/types";
import { enkebab } from "../logic/utils";
import { Centered, Flex, WholeFlex } from "../ui/Components";

export default function () {
  const { sync, dashIO } = useStore(["sync", "dashIO"]);
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [siteName, setSite] = useState("");
  const [sitePath, setPath] = useState("/");
  const [siteDesc, setDesc] = useState("");
  const [error, setError] = useState("");
  function setSitePath(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget.value.slice(1).replace("/", "");
    setPath("/" + input);
  }

  // TODO add automated name change logic if site already exists
  async function create() {
    const { createGroup, createSite } = dashIO();
    if (!siteName) {
      setError("Site name can't be empty");
      return;
    }
    setLoading(true);
    // Create Group first
    // Then create site on agent
    const site: Site = {
      sitename: siteName,
      description: siteDesc,
      groupname: enkebab(siteName),
      binding: sitePath,
      icon: "",
      home: "",
      css: "",
      apps: AppBunt,
      "app-order": [],
      hidden: false,
    };
    const res = await createSite(site);
    if (res) {
      await createGroup(siteName);
      await sync();
      navigate("/");
      console.log(res, "res");
    }
  }
  return (
    <WholeFlex sx={{ overflowY: "auto", height: "100vh" }}>
      <Container>
        <Card sx={{ mt: 4 }}>
          <CardHeader title="Create a New Site" />
          <CardContent>
            <Typography variant="body1">
              Choose the name of your site and the URL path you want for it
            </Typography>

            {error && <Alert severity="error">{error}.</Alert>}
            <Stack direction="column" useFlexGap sx={{ my: 5, gap: "2rem" }}>
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
            </Stack>
            {loading ? (
              <Centered>
                <CircularProgress />
              </Centered>
            ) : (
              <>
                <Button variant="contained" onClick={create}>
                  Create
                </Button>
                <Link to="/">
                  <Button variant="text">Cancel</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </WholeFlex>
  );
}
