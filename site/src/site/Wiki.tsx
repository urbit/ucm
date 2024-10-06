import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { Site } from '../logic/types';
import { Link } from 'wouter';
import useStore from '../logic/store';
import Sigil from '../ui/Sigil';

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
};
export default function Page({ site }: { site: Site }) {
  return <Box></Box>;
}
