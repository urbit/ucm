import { AppBar, Box, Button, Card, Container, Toolbar, Typography } from '@mui/material';
import { Ship } from '../logic/types';
import { Link } from 'wouter';
import useStore from '../logic/store';
import Sigil from '../ui/Sigil';
import { BASE_PATH } from '../logic/constants';
import { Centered } from '../ui/Components';

const styles: any = {
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
export default function Page({ patp }: { patp: Ship }) {
  const redirect = BASE_PATH;
  return (
    <Container>
      <Card>
        <Centered>
          <Sigil patp={patp} size={100} />
        </Centered>
        <Typography align="center" variant="h4">
          {patp}
        </Typography>
        <Centered>
          <Button sx={{ mt: 4 }} variant="contained" color="warning">
            <a style={styles.appLink} href={`/~/logout?redirect=${redirect}`}>
              Logout
            </a>
          </Button>
        </Centered>
      </Card>
    </Container>
  );
}
