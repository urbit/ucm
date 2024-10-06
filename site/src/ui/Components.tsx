import { Box, Card, CircularProgress, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";
import useStore from "../logic/store";

export function WholeFlex({
  children,
  sx,
}: {
  sx?: SxProps<Theme>;
  children: ReactNode;
}) {
  const style: any = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    ...sx,
  };
  return <Box sx={style}>{children}</Box>;
}

export const styles = {
  steady: {
    overflow: "hidden",
  },
};

export function Flex({
  sx,
  children,
  dir = "row",
  gap = "1rem",
}: {
  sx?: SxProps<Theme>;
  children: ReactNode;
  dir?: "row" | "column";
  gap?: string;
}) {
  const styl: any = { display: "flex", flexDirection: dir, gap, ...sx };
  return <Box sx={styl}>{children}</Box>;
}
export function Row({
  sx,
  children,
}: {
  sx?: SxProps<Theme>;
  children: ReactNode;
}) {
  const styl: any = { ...sx, display: "flex" };
  return <Box sx={styl}>{children}</Box>;
}
export function SpreadRow({
  children,
  sx,
}: {
  sx?: SxProps<Theme>;
  children: ReactNode;
}) {
  const styl: any = { ...sx, display: "flex", justifyContent: "space-between" };
  return <Box sx={styl}>{children}</Box>;
}
export function Centered({
  children,
  y = false,
  sx,
  fixed = false,
}: {
  y?: boolean;
  fixed?: boolean;
  sx?: SxProps<Theme>;
  children: ReactNode;
}) {
  if (!y) {
    return (
      <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
        {children}
      </Box>
    );
  } else {
    const position = fixed ? "fixed" : "absolute";
    const styles = y
      ? {
          transform: "translate(-50%, -50%)",
          top: "50%",
          left: "50%",
        }
      : { transform: "translateX(-50%)", left: "50%" };

    const styl: any = { ...sx, position, ...styles };
    return <Box sx={styl}>{children}</Box>;
  }
}

export function Scrollable({
  children,
  x = false,
  sx,
}: {
  x?: boolean;
  sx?: SxProps<Theme>;
  children: ReactNode;
}) {
  const xstyles = x ? { overflowX: "auto" } : {};
  const styles: any = { ...sx, ...xstyles, overflowY: "auto" };
  return <Box sx={styles}>{children}</Box>;
}

export function LoadingScreen() {
  const { airlock } = useStore(["airlock"]);
  return (
    <Card>
      <Centered y={true} fixed={true}>
        <Centered>
          <CircularProgress size={80} />
        </Centered>
        <h3 style={{ textAlign: "center" }}>Loading...</h3>
      </Centered>
    </Card>
  );
}
