import { Link, Route, Router } from "wouter";
import Dashboard from "./dashboard/Dashboard.tsx";
import CreateForm from "./dashboard/CreateForm.tsx";
import SiteDash from "./dashboard/Site.tsx";
import Modal from "./modals/Modal.tsx";
import useStore from "./logic/store.ts";
import { Button, Container, Typography } from "@mui/material";

export default function () {
  const { airlock, state, groups, modal } = useStore([
    "airlock",
    "state",
    "groups",
    "modal",
  ]);
  return (
    <>
      <Router base="/apps/ucm">
        <Route path="/" component={Dashboard} />
        <Route path="/create-site" component={CreateForm} />
        <Route path="/admin/:site">
          {(params) => {
            const binding = `/${params.site}`;
            const site = state[binding];
            if (!site) return <NotFound err={params.site} />;
            else {
              const groupParam = `~${airlock.ship}/${site.groupname}`;
              const group = groups[groupParam];
              return <SiteDash site={site} group={group} />;
            }
          }}
        </Route>
      </Router>
      {modal && <Modal>{modal}</Modal>}
    </>
  );
}

export function NotFound({ err }: { err: string }) {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
      <Typography>{err} not found</Typography>
      <Link to="/">
        <Button>Go Back</Button>
      </Link>
    </Container>
  );
}
