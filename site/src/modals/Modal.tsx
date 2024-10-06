import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Alert,
  Button,
  TextField,
  Typography,
  Box,
  Container,
} from "@mui/material";
import useStore from "../logic/store";
import { Site, AppType, Ship } from "../logic/types";
import { tokenize } from "../logic/tlon-helpers";
import { addDots } from "../logic/utils";

// weird that this has to be written manually
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export default function MuhModal({ children }: { children: JSX.Element }) {
  const { setModal } = useStore(["setModal"]);
  function close(e: any, reason: any) {
    setModal(null);
  }
  function onKey(event: any) {
    if (event.key === "Escape") setModal(null);
  }
  useEffect(() => {
    document.addEventListener("keyup", onKey);
    return () => {
      document.removeEventListener("keyup", onKey);
    };
  }, [children]);

  function clickAway(e: React.MouseEvent) {
    e.stopPropagation();
    if (!modalRef.current || !modalRef.current.contains(e.target as any))
      setModal(null);
  }
  const modalRef = useRef<HTMLDivElement>(null);
  const bgStyle = {
    position: "fixed" as "fixed",
    left: 0,
    top: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgb(0, 0, 0, 0.7)",
    zIndex: 0,
  };
  const modalStyle = {
    position: "fixed" as "fixed",
    transform: "translate(-50%, -50%)",
    top: "50%",
    left: "50%",
  };
  return (
    <div style={bgStyle} id="modal-background" onClick={clickAway}>
      <div style={modalStyle} id="modal" ref={modalRef}>
        {children}
      </div>
    </div>
  );
}

export function ForumReplyModal({ board, id }: { board: string; id: string }) {
  // const { io, airlock, clientShip } = useStore(["io", "airlock", "clientShip"]);
  // const { sendDiaryReply } = io();
  // const [input, setInput] = useState("");
  // async function sendReply() {
  //   const host = `~${airlock.ship}` as Ship;
  //   console.log(id, "parent id!!, dots??");
  //   const did = addDots(id, 3);
  //   const tokens = tokenize(input);
  //   const res = await sendDiaryReply(clientShip, host, board, did, tokens);
  // }
  return <Container></Container>;
}
