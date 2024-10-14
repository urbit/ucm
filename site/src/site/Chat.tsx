import { Box, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { RichMetadata, Site } from '../logic/types';
import { Route, Switch, useLocation } from 'wouter';
import { Group } from '../logic/types-tlon';
import { useEffect, useState } from 'react';
import Chatroom from './Chatroom';
import { NotFound } from './Home';
import { WholeFlex } from '../ui/Components';
import { scrollableStyle } from '../ui/theme';

const styles = {
  logo: {
    width: '64px',
    height: '64px',
  },
  navbar: {
    backgroundColor: 'black',
  },
  appLinks: {
    flexGrow: 1,
    justifyContent: 'space-evenly',
  },
  appLink: {
    color: 'white',
    textTransform: 'uppercase',
  },
  root: {
    cursor: 'pointer',
    '&$selected': {
      backgroundColor: 'red',
      color: 'white',
      '& .MuiListItemIcon-root': {
        color: 'white',
      },
    },
    '&$selected:hover': {
      backgroundColor: 'purple',
      color: 'white',
      '& .MuiListItemIcon-root': {
        color: 'white',
      },
    },
    '&:hover': {
      backgroundColor: 'blue',
      color: 'white',
      '& .MuiListItemIcon-root': {
        color: 'white',
      },
    },
  },
};

function ChatPage({
  chats,
  active,
}: {
  active: RichMetadata | null;
  chats: RichMetadata[];
}) {
  useEffect(() => {
    setActiveChat(active);
  }, [active, chats]);
  const [activeChat, setActiveChat] = useState<RichMetadata | null>(null);
  const [_, navigate] = useLocation();
  async function openChat(meta: RichMetadata) {
    navigate(`/${meta.name}`);
  }
  return (
    <Box sx={{ height: '100%' }}>
      <Box
        sx={{
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
        }}
      >
        <Box
          sx={{
            overflow: 'hidden',
            width: '20ch',
            height: '100%',
            borderRight: '1px solid black',
          }}
        >
          <Box sx={{ p: 2, height: '3rem', borderBottom: '1px solid black' }}>
            <Typography variant="h5">Chats</Typography>
          </Box>
          <List sx={{ ...scrollableStyle, height: '100%' }}>
            {chats.map((c) => (
              <ListItem key={c.name} sx={styles.root} divider={true}>
                <ListItemText primary={c.title} onClick={() => openChat(c)} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, width: '50%' }}>
          <WholeFlex>
            <Box sx={{ p: 2, height: '3rem', borderBottom: '1px solid black' }}>
              {activeChat ? (
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ width: '50%' }} noWrap={true}>
                    {activeChat.title}
                  </Typography>
                  <Typography
                    noWrap={true}
                    sx={{ width: '50%', textOverflow: 'ellipsis' }}
                  >
                    {activeChat.description}
                  </Typography>
                </Stack>
              ) : (
                <Box>
                  <Typography align="center">Choose a Chat from the list</Typography>
                </Box>
              )}
            </Box>
            {activeChat ? <Chatroom chat={activeChat} /> : <ChatPlaceholder />}
          </WholeFlex>
        </Box>
      </Box>
    </Box>
  );
}

function ChatPlaceholder() {
  return <></>;
}
export default function Router({
  site,
  group,
  chats,
}: {
  site: Site;
  group: Group;
  chats: RichMetadata[];
}) {
  return (
    <Switch>
      <Route path="/:room">
        {(params) => {
          const chat = chats.find((c) => c.name == params.room);
          if (!chat) return <NotFound err="out" />;
          else return <ChatPage chats={chats} active={chat} />;
        }}
      </Route>
      <Route path="/" component={() => ChatPage({ chats, active: null })} />
    </Switch>
  );
}
