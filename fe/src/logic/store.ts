import Urbit from "@urbit/http-api";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_NAME, URL } from "./constants";
import { dashIO } from "./comms";
import { Pikes, Ship, Site, SiteBunt } from "./types";
import { Group as TlonGroup } from "./types-tlon";

interface ClientState {
  // dashboard stuff
  airlock: Urbit;
  init: () => Promise<void>;
  sync: () => Promise<void>;
  modal: JSX.Element | null;
  setModal: (m: JSX.Element | null) => void;
  state: Record<string, Site>;
  groups: Record<string, TlonGroup>;
  pikes: Pikes;
  loading: boolean;
  setLoading: (b: boolean) => void;
  dashIO: () => ReturnType<typeof dashIO>;
}
export async function start(): Promise<Urbit> {
  const airlock = new Urbit(URL, "");
  const res = await fetch(URL + "/~/host");
  const ship = await res.text();
  airlock.ship = ship.slice(1);
  airlock.desk = APP_NAME;
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
    state: {},
    channelsState: {},
    groups: {},
    pikes: {},
    sync: async () => {
      const airlock = get().airlock;
      const aio = dashIO(airlock);
      const state = aio.scryState();
      const groups = aio.scryGroups();
      const pikes = aio.scryPikes();
      set({
        state: await state,
        groups: await groups,
        pikes: await pikes,
        loading: false,
      });
    },
    init: async () => {
      const airlock = await start();
      const dio = dashIO(airlock);
      const scries = dio.initialScries();
      dio.initSubs((data) => {
        console.log(data, "sub data");
        const state = data;
        set({ state });
      });
      // TODO this is only for seeding phase
      const ss = await scries;
      const { groups, pikes } = ss;
      set({
        airlock,
        groups,
        pikes,
        loading: false,
      });
    },
    modal: null,
    setModal: (m) => set({ modal: m }),
    dashIO: () => {
      const airlock = get().airlock;
      const aio = dashIO(airlock);
      return aio;
    },
  }),
  // {
  //   name: "ucm-storage",
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
