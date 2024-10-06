import useStore from "../logic/store";
import { Site } from "../logic/types";
import { useLocation, Link as RouterLink } from "wouter";
import {
  Card,
  CardContent,
  CardMedia,
  Paper,
  Typography,
  Button,
  Container,
  Stack,
} from "@mui/material";
import { DEFAULT_ICON } from "../logic/constants";
import { Centered, Row, SpreadRow } from "../ui/Components";
import * as muiStyles from "@mui/material/styles";
import { ThemeToggle } from "../ui/theme";
// import { ColorToggle } from "../ui/theme";

export default function () {
  const using = muiStyles.useColorScheme();
  const [_location, navigate] = useLocation();
  const { state } = useStore(["state"]);
  const list = Object.values(state);
  function create() {
    navigate("/create-site");
  }
  return (
    <Container maxWidth="md" sx={{ p: 5 }}>
      <SpreadRow>
        <Centered>
          <Typography variant="h2" align="center" sx={{ mb: 4 }}>
            Urbit Community Manager
          </Typography>
        </Centered>
        <ThemeToggle />
      </SpreadRow>
      <Typography align="center" variant="h3">
        Your Sites
      </Typography>
      <Stack
        direction={"column"}
        useFlexGap
        sx={{ my: 2, gap: 2, minHeight: "30vw" }}
      >
        {list.length !== 0 ? (
          list.map((site) => <SiteCard key={site.groupname} site={site} />)
        ) : (
          <Typography variant="h5" sx={{ mt: 5 }} align="center">
            Nothing yet{" "}
          </Typography>
        )}
      </Stack>
      <Centered sx={{ m: 2 }}>
        <Button variant="contained" onClick={create}>
          Create Site
        </Button>
      </Centered>
    </Container>
  );
}

function SiteCard({ site }: { site: Site }) {
  console.log(site, "site");
  const icon = site.icon || DEFAULT_ICON;
  // Responsive font sizes huh
  return (
    <RouterLink to={`/admin${site.binding}`}>
      <Paper elevation={8}>
        <Card variant="outlined">
          <CardMedia src={icon} />
          <CardContent>
            <Stack direction="row" useFlexGap sx={{ gap: "2rem" }}>
              <img
                style={{ width: 40, height: 40, border: "1px solid primary" }}
                src={site.icon || DEFAULT_ICON}
              />
              <Typography sx={{ typography: { sm: "h4", xs: "body1" } }}>
                {site.sitename}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Paper>
    </RouterLink>
  );
}
