import { useEffect } from "react";
import "./App.css";
import useStore from "./logic/store";
import Router, { NotFound } from "./site/Home";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "./ui/theme/AppTheme";
import { LoadingScreen } from "./ui/Components";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { SITE_NAME } from "./logic/constants";
import { useParams } from "wouter";
import { ScryRes } from "./logic/comms";

function App() {
  const { init, loading } = useStore(["init", "loading"]);
  useEffect(() => {
    init();
  }, []);
  const queryClient = new QueryClient();

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        {loading ? <LoadingScreen /> : <Loader />}
      </QueryClientProvider>
    </AppTheme>
  );
}

export default App;

function Loader() {
  const queryClient = useQueryClient();
  const params: any = useParams();
  const { io } = useStore(["io"]);
  const { initSubs, scrySite } = io();
  const { isLoading, data } = useQuery({
    queryKey: ["site"],
    queryFn: scrySite,
  });
  useEffect(() => {
    initSubs(SITE_NAME, (site) => {
      queryClient.setQueryData(["site"], (old: ScryRes) => {
        return { ...old, site };
      });
    });
  }, []);

  return isLoading ? (
    <LoadingScreen />
  ) : data && data.site && data.group ? (
    <Router site={data.site} group={data.group} />
  ) : (
    <NotFound err={params.site} />
  );
}
