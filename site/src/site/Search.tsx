import {
  AppBar,
  Box,
  Container,
  Divider,
  Toolbar,
  Typography,
  Link as Lin,
  TextField,
  Button,
  List,
  ListItem,
} from '@mui/material';
import { AppType, RichMetadata, Ship, Site } from '../logic/types';
import { Link, Route, Switch, useLocation } from 'wouter';
import useStore from '../logic/store';
import { Content, DiaryPage, DiaryPost, Group } from '../logic/types-tlon';
import { useEffect, useState } from 'react';
import { tokenize, writToMD } from '../logic/tlon-helpers';
import BlogPost from './BlogPost';
import { PostContent } from './PostContent';
import { Centered } from '../ui/Components';
import { TypeSpecimenOutlined } from '@mui/icons-material';

export type SearchResults = {};

export default function BlogPage({ site }: { site: Site }) {
  const { airlock, io } = useStore(['airlock', 'io']);
  const { search } = io();
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [start, setStart] = useState('');
  const [end, setEbd] = useState('');
  const [apps, setApps] = useState<AppType[]>([]);
  const [mention, setMention] = useState('');
  const [results, setResults] = useState<SearchResults>();

  async function submit() {
    const sts = new Date(start).getTime() || undefined;
    const ets = new Date(end).getTime() || undefined;
    const res = await search(input, apps, mention, sts, ets);
    console.log(res, 'search result');
    if (res) setResults(res);
  }
  return (
    <Container>
      <Box my={2} mb={4}>
        <Typography variant="h2" align="center">
          Search
        </Typography>
      </Box>
      <Divider />
      <TextField
        autoComplete="query"
        name="query"
        required
        fullWidth
        id="query"
        placeholder="Query"
        error={!!error}
        helperText={error}
        color={error ? 'error' : 'primary'}
      />
      <Centered>
        <Button sx={{ mt: 3 }} variant="contained" onClick={submit}>
          Submit
        </Button>
      </Centered>
      {results && <Results data={results} />}
    </Container>
  );
}

function Results({ data }: { data: any }) {
  const list: string[] = data.things;
  return (
    <>
      <Typography variant="h4">Results</Typography>
      <List>
        {list.map((i) => (
          <ListItem>
            <Box></Box>
          </ListItem>
        ))}
      </List>
    </>
  );
}
