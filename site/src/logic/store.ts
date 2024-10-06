import Urbit from "@urbit/http-api";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SITE_NAME, URL } from "./constants";
import io from "./comms";
import { Ship, Site, SiteBunt } from "./types";
import {
  ChanRPost,
  ChannelType,
  ChannelUpdate,
  ChannelsRes,
  Content,
  GroupBunt,
  Group as TlonGroup,
} from "./types-tlon";

interface ClientState {
  airlock: Urbit;
  clientShip: Ship;
  init: () => Promise<void>;
  sync: () => Promise<void>;
  modal: JSX.Element | null;
  setModal: (m: JSX.Element | null) => void;
  setSiteState: (s: Site) => void;
  siteState: Site;
  group: TlonGroup;
  loading: boolean;
  setLoading: (b: boolean) => void;
  addPending: (ts: number, c: Content) => void;
  delPending: (ts: number) => void;
  pendingPosts: Map<number, Content>;
  lastChannelUpdate: ChanRPost | null;
  io: () => ReturnType<typeof io>;
}
export async function start(): Promise<Urbit> {
  const airlock = new Urbit(URL, "");
  await airlock.getShipName();
  await airlock.poke({ app: "hood", mark: "helm-hi", json: "opening airlock" });
  await airlock.eventSource();
  return airlock;
}
export async function getShip(): Promise<Ship> {
  const res2 = await fetch(URL + "/~/name");
  const ship2 = await res2.text();
  return ship2 as Ship;
}

const stateStore = create<ClientState>()(
  // persist(
  (set, get) => ({
    loading: true,
    setLoading: (loading) => set({ loading }),
    airlock: new Urbit(URL),
    clientShip: (window as any).ship,
    setSiteState: (siteState) => set({ siteState }),
    siteState: SiteBunt,
    group: GroupBunt,
    sync: async () => {
      set({ loading: true });
      const airlock = get().airlock;
      set({
        loading: false,
      });
    },
    init: async () => {
      const airlock = await start();
      const aio = io(airlock);
      aio.channelsSub((data: ChannelUpdate) => {
        const pending = get().pendingPosts;
        if ("pending" in data.response) {
          return;
        } else {
          const [kind, host, name] = data.nest.split("/");
          const rpost = aio.fixTlon(pending, data);
          if (rpost)
            set({
              lastChannelUpdate: {
                update: rpost,
                host: host as Ship,
                kind: kind as ChannelType,
                name,
              },
            });
        }
      });
      set({
        airlock,
        loading: false,
      });
    },
    addPending: (ts, content) => {
      set((s) => {
        s.pendingPosts.set(ts, content);
        return { pendingPosts: s.pendingPosts };
      });
    },
    delPending: (ts) => {
      set((s) => {
        s.pendingPosts.delete(ts);
        return { pendingPosts: s.pendingPosts };
      });
    },
    pendingPosts: new Map<number, Content>(),
    lastChannelUpdate: null,
    modal: null,
    setModal: (m) => set({ modal: m }),
    io: () => {
      const airlock = get().airlock;
      const aio = io(airlock);
      return aio;
    },
  }),
  // {
  //   name: "ublog-storage",
  // },
  // ),
);

// very nice
// https://dev.to/eraywebdev/optimizing-zustand-how-to-prevent-unnecessary-re-renders-in-your-react-app-59do
import { StoreApi, UseBoundStore } from "zustand";
import { shallow } from "zustand/shallow";
import { addDots } from "./utils";

type GenericState = Record<string, any>;

export const createStoreWithSelectors = <T extends GenericState>(
  store: UseBoundStore<StoreApi<T>>,
): (<K extends keyof T>(keys: K[]) => Pick<T, K>) => {
  const useStore: <K extends keyof T>(keys: K[]) => Pick<T, K> = <
    K extends keyof T,
  >(
    keys: K[],
  ) => {
    // console.log(keys, "keys");
    return store((state) => {
      const x = keys.reduce((acc, cur) => {
        acc[cur] = state[cur];
        return acc;
      }, {} as T);

      return x as Pick<T, K>;
    }, shallow);
  };

  return useStore;
};

const useStore = createStoreWithSelectors(stateStore);
export default useStore;
