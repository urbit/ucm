import { AppBar, Toolbar, Typography } from "@mui/material";
import { Site } from "../logic/types";
import { DEFAULT_ICON } from "../logic/constants";
import useStore from "../logic/store";
import Sigil from "../ui/Sigil";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../ui/theme";
import { Link } from "wouter";

const styles = {
  logo: {
    width: "64px",
    height: "64px",
  },
  navbar: {
    backgroundColor: "black",
  },
  appLinks: {
    flexGrow: 1,
    gap: "2rem",
    justifyContent: "center",
  },
  appLink: {
    color: "white",
    textTransform: "uppercase",
    textDecoration: "none",
  },
};
export default function Navbar({ site }: { site: Site }) {
  useEffect(() => {
    const ord: string[] = [];
    for (const app of site["app-order"]) {
      if (app.startsWith("static/")) ord.push(app.split("/")[1]);
      if (app === "blog" && site.apps.blog) ord.push("blog");
      if (app === "radio" && site.apps.radio) ord.push("radio");
      if (app === "chat" && site.apps.chat.length > 0) ord.push("chat");
      if (app === "forum" && site.apps.forum.length > 0) ord.push("forum");
      if (app === "wiki" && site.apps.wiki.length > 0) ord.push("wiki");
    }
    // ord.push("search");
    setOrder(ord);
  }, [site]);
  const { clientShip } = useStore(["clientShip"]);
  const icon = site.icon || DEFAULT_ICON;
  const [order, setOrder] = useState<string[]>([]);
  return (
    <AppBar position="static" sx={styles.navbar}>
      <Toolbar>
        <Link to="/">
          <img style={styles.logo} src={icon} />
        </Link>
        <Toolbar sx={styles.appLinks}>
          {order.map((page) => {
            if (page === "wiki")
              return (
                <Link key={page} to={`/wiki/${site.apps.wiki}`}>
                  <Typography sx={styles.appLink}>{page}</Typography>
                </Link>
              );
            else
              return (
                <Link key={page} to={`/${page}`}>
                  <Typography sx={styles.appLink}>{page}</Typography>
                </Link>
              );
          })}
        </Toolbar>
        <ThemeToggle />
        {clientShip.length > 28 ? (
          <Link to="/login">
            <Typography sx={styles.appLink}>Login</Typography>
          </Link>
        ) : (
          <Link to={`/user/${clientShip}`}>
            <Sigil patp={clientShip} size={48} />
          </Link>
        )}
      </Toolbar>
    </AppBar>
  );
}
