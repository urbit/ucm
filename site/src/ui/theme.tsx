import Box from "@mui/material/Box";
import { DarkMode, LightMode } from "@mui/icons-material";
import { IconButton, IconButtonProps } from "@mui/material";

import { useColorScheme } from "@mui/material/styles";
export function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const nmode = mode === "dark" ? "light" : "dark";
    setMode(nmode);
  };
  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={(theme: any) => ({
          verticalAlign: "bottom",
          display: "inline-flex",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: "1px solid",
          borderColor: (theme.vars || theme).palette.divider,
        })}
      />
    );
  }
  const resolvedMode = (systemMode || mode) as "light" | "dark";
  const icon = {
    light: <LightMode />,
    dark: <DarkMode />,
  }[resolvedMode];
  return (
    <IconButton
      data-screenshot="toggle-mode"
      onClick={handleClick}
      disableRipple
      size="small"
    >
      {icon}
    </IconButton>
  );
}

export const scrollableStyle = {
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};
