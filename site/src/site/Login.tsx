import { Link, Redirect, Route, Router, useLocation } from "wouter";
import useStore from "../logic/store.ts";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Ship } from "../logic/types.ts";
import { BASE_PATH } from "../logic/constants.ts";
import { isValidPatp } from "../logic/ob/co.ts";

export default function () {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  async function runEauth() {
    const formBody = new URLSearchParams();
    formBody.append("name", input);
    formBody.append("eauth", "");
    formBody.append("redirect", window.location.href);
    const opts = { method: "POST", body: formBody };
    const res = await fetch("/~/login", opts);
    console.log(res, "eauth res");
  }
  function runMetamask() {
    if (!isValidPatp(input)) setError("Not a valid Urbit ID name");
    else connectMetamask(input as Ship);
  }
  return (
    <Container maxWidth="sm">
      <Card sx={{ p: 3, mt: 5, textAlign: "center" }}>
        <CardHeader sx={{ mb: 4 }} title="Login with an Urbit ID" />
        <CardContent>
          <form action="/~/login" method="POST">
            <TextField
              label="Urbit ID"
              placeholder="~sorreg-namtyv"
              name="name"
              id="name"
              value={input}
              error={!!error}
              helperText={error}
              onChange={(e) => setInput(e.currentTarget.value)}
            />
            <input type="hidden" name="redirect" value={BASE_PATH} />
            <Stack
              direction="row"
              useFlexGap
              sx={{ mt: 3, justifyContent: "center", gap: "2rem" }}
            >
              <Button name="eauth" type="submit" variant="contained">
                eAuth
              </Button>
              <Button variant="contained" onClick={runMetamask}>
                Metamask
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

async function fetchSecret() {
  try {
    const response = await fetch("/ucm/metamask");
    if (response.ok) {
      const data = await response.json();
      return data.challenge;
    } else {
      throw new Error("Failed to retrieve secret");
    }
  } catch (error) {
    console.error("Error fetching secret:", error);
  }
}
async function connectMetamask(who: Ship) {
  const secret = await fetchSecret();
  console.log("metamask secret", secret);
  try {
    const eth = (window as any).ethereum;
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    const account = accounts[0];

    const signature = await eth.request({
      method: "personal_sign",
      params: [secret, account],
    });

    const response = await fetch("/ucm/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        who,
        secret: secret,
        address: account,
        signature: signature,
      }),
    });

    if (response.ok) {
      // location.reload();
      window.location.replace(BASE_PATH);
    } else {
      alert("Login failed. Please try again.");
    }
  } catch (error) {
    console.error("MetaMask login failed", error);
  }
}
