// import { fetchTweet, lurkTweet } from "@/logic/twatter/calls";
// import { pokeDister, scryDister, scryGangs } from "@/logic/requests/tlon";
// import { useEffect, useState } from "react";
// import Tweet from "@/sections/twatter/Tweet";
// import { toFlat } from "@/sections/feed/thread/helpers";
// import PostData from "@/sections/feed/PostData";
// import Post from "@/sections/feed/post/Post";
// import { FullNode, SortugRef } from "@/types/trill";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { subscribe, unsub } from "@/logic/requests/generic";
// import { AppData, GroupMetadata } from "@/types/tlon";
// import comet from "@/assets/icons/comet.svg";
// import Sigil from "@/ui/Sigil";
// import { parseThread, parseTweet } from "@/logic/twatter/parser";
// import { Tweet as TweetType } from "@/types/twatter";
// import { scryRadio } from "@/logic/requests/trill";
// import useLocalState from "@/state/state";
// import { RadioTower, ScheduledRadio, radioLink } from "@/logic/requests/radio";
// import { Ship } from "@/types/urbit";
// import { RADIO } from "@/logic/constants";
// import { SigilOnly } from "../Avatar";
// import { date_diff } from "../logic/utils";
// import ShipsModal from "../modals/ShipsModal";

// export function TweetSnippet({
//   link,
//   giveBack,
// }: {
//   link: string;
//   giveBack?: Function;
// }) {
//   const id = link.split("/")[5];
//   const { isLoading, isError, data } = useQuery({
//     queryKey: ["twatter-thread", id],
//     queryFn: () => lurkTweet(id),
//   });
//   const [tw, setTw] = useState<TweetType>();
//   useEffect(() => {
//     if (data && "thread-lurk" in data) {
//       const js = JSON.parse(data["thread-lurk"]).data.tweetResult;
//       if (JSON.stringify(js) === "{}") return;
//       if (giveBack) giveBack(JSON.stringify(parseTweet(js.result)));
//     }
//   }, [data]);
//   if (isLoading || isError)
//     return (
//       <div className="tweet-snippet">
//         <p>Fetching Tweet from your Urbit...</p>
//       </div>
//     );
//   else {
//     if ("no-coki" in data)
//       return (
//         <div id="cookie-error" className="x-center">
//           <p className="">Your Twitter cookie isn't working correctly.</p>
//           <a href="/cookies">Check it out</a>
//         </div>
//       );
//     if ("fail" in data)
//       return (
//         <p>
//           Bad request. Please send some feedback (here) of what you were trying
//           to fetch.
//         </p>
//       );
//     if ("thread-lurk" in data) {
//       const js = JSON.parse(data["thread-lurk"]).data.tweetResult;
//       if (JSON.stringify(js) === "{}")
//         return null; // TODO wtf
//       else
//         return (
//           <div className="tweet-snippet">
//             <Tweet tweet={parseTweet(js.result)} quote={true} />
//           </div>
//         );
//     }
//     // else {
//     //   const head = parseThread(JSON.parse(data.thread));
//     //   const tweet = head.thread.tweets[0]
//     //   giveBack(JSON.stringify(tweet))
//     //   return (
//     //     <div className="tweet-snippet">
//     //       <Tweet tweet={tweet} quote={true} />
//     //     </div>
//     //   );
//     // }
//   }
// }

// export function AppSnippet({ r }: { r: SortugRef }) {
//   async function sub() {
//     if (!subn) {
//       const s = await subscribe(
//         "treaty",
//         "/treaties",
//         (data: { add: AppData }) => {
//           if ("ini" in data) {
//             const app = Object.values(data.ini).find((d) => d.desk === name);
//             setApp(app);
//           }
//           if ("add" in data && data.add.desk === name) setApp(data.add);
//           if (appData) unsub(subn);
//         },
//       );
//       setSub(s);
//       const res = await pokeDister(ship);
//     }
//   }
//   const { ship, path } = r;
//   const name = path.slice(1);
//   const [appData, setApp] = useState<AppData>();
//   const [subn, setSub] = useState<number>();
//   const { isLoading, data, isError } = useQuery({
//     queryKey: ["dister", ship],
//     queryFn: () => scryDister(ship),
//   });
//   if (isLoading || isError) return <div className="reference">...</div>;
//   else {
//     const app = Object.values(data.ini).find((d) => d.desk === name);
//     if (!app && !appData) sub();
//     const a = app
//       ? app
//       : appData
//         ? appData
//         : { title: name, image: comet, info: "", ship };
//     return (
//       <div className="reference app-ref">
//         <AppDiv app={a} />
//       </div>
//     );
//   }
// }
// function AppDiv({ app }: { app: Partial<AppData> }) {
//   return (
//     <>
//       <img src={app.image} alt="" />
//       <div className="text">
//         <p className="app-name">{app.title}</p>
//         <p className="app-info">{app.info}</p>
//         <p className="app-host">App from {app.ship}</p>
//       </div>
//       <p className="ref-ship">
//         <Sigil patp={app.ship} size={40} />
//       </p>
//     </>
//   );
// }

// export function TlonSnippet({ r }: { r: SortugRef }) {
//   if (r.type === "app") return <AppSnippet r={r} />;
//   if (r.type === "groups") return <GroupSnippet r={r} />;
// }
// export function GroupSnippet({ r }: { r: SortugRef }) {
//   const queryClient = useQueryClient();
//   async function sub() {
//     if (!subn) {
//       const path = `/gangs/index/${ship}`;
//       const s = await subscribe("groups", path, (data: any) => {
//         const key = `${ship}/${name}`;
//         const val = data[key];
//         queryClient.setQueryData(["gangs"], (old: any) => {
//           return { ...old, [key]: { preview: val } };
//         });
//       });
//       setSub(s);
//     }
//   }
//   const { ship, path } = r;
//   const name = path.slice(1);
//   const [groupData, setGroup] = useState<GroupMetadata>();
//   const [subn, setSub] = useState<number>();
//   const { isLoading, data, isError } = useQuery({
//     queryKey: ["gangs"],
//     queryFn: scryGangs,
//   });
//   if (isLoading || isError) return <div className="reference">...</div>;
//   else {
//     const group = data[`${ship}/${name}`];
//     if (!group && !groupData) sub();
//     const a =
//       group && group.preview
//         ? group.preview.meta
//         : groupData
//           ? groupData
//           : { title: name, image: comet, cover: "", description: "" };
//     return (
//       <div className="reference app-ref">
//         {a.image.startsWith("#") ? (
//           <div
//             className="group-color"
//             style={{ backgroundColor: a.image }}
//           ></div>
//         ) : (
//           <img src={a.image} alt="" />
//         )}
//         <div className="text">
//           <p className="app-name">{a.title}</p>
//           <p className="app-info">
//             {a.description.length > 25
//               ? a.description.substring(0, 25) + "..."
//               : a.description}
//           </p>
//           <p className="group-host">Group by {ship}</p>
//         </div>
//         {/* <p className="ref-ship">
//           <Sigil patp={ship} size={40} />
//         </p> */}
//       </div>
//     );
//   }
// }

// export function RadioSnippet({ ship }: { ship: Ship }) {
//   const { our } = useLocalState();
//   return ship === our ? <OwnRadio /> : <DudesRadio ship={ship} />;
// }

// function DudesRadio({ ship }: { ship }) {
//   function onc() {
//     radioLink(ship);
//   }
//   const { radioTowers } = useLocalState();
//   const tower = radioTowers.find((t) => t.location === ship);
//   if (!tower)
//     return (
//       <div role="link" onMouseUp={onc} className="radio-snippet">
//         <p className="img">{RADIO}</p>
//         <div className="radio-text">
//           <p>Radio data not published. Click and check.</p>;
//         </div>
//       </div>
//     );
//   else
//     return (
//       <div role="link" onMouseUp={onc} className="radio-snippet">
//         <p className="img">{RADIO}</p>
//         <div className="radio-text">
//           <p>Radio Session. Playing: {tower.description}</p>
//           <p>Started {new Date(tower.time).toLocaleString()}</p>
//         </div>
//         <div>
//           <SigilOnly p={ship} size={42} />
//           <span className="viewers">
//             {tower.viewers}
//             <span>👀</span>
//           </span>
//         </div>
//       </div>
//     );
// }

// function OwnRadio() {
//   const { currentRadio, our, setModal, radioTowers } = useLocalState();
//   const [scheduled, setS] = useState<ScheduledRadio | null>(null);
//   function onc() {
//     radioLink(our);
//   }
//   useEffect(() => {
//     scryRadio().then((r) => {
//       if (r) setS(r.radio);
//     });
//   }, []);
//   function showViewers() {
//     const modal = (
//       <ShipsModal
//         ships={currentRadio.viewers}
//         header={`People watching your %radio show`}
//       />
//     );
//     setModal(modal);
//   }
//   if (scheduled && scheduled.time > Date.now())
//     return (
//       <div role="link" onMouseUp={onc} className="radio-snippet">
//         <p className="img">{RADIO}</p>
//         <div className="radio-text">
//           <p>
//             Radio Session. Playing:
//             <a className="radio-link" href={scheduled.url}>
//               {scheduled.desc}
//             </a>
//           </p>
//           <p>Starting at {new Date(scheduled.time).toLocaleString()}</p>
//         </div>
//         <div>
//           <SigilOnly p={our} size={42} />
//         </div>
//       </div>
//     );
//   else if (!currentRadio)
//     return (
//       <div role="link" onMouseUp={onc} className="radio-snippet">
//         <p className="img">{RADIO}</p>
//         <div className="radio-text">
//           <p>Radio unavailable</p>
//         </div>
//       </div>
//     );
//   else
//     return (
//       <div role="link" onMouseUp={onc} className="radio-snippet">
//         <p className="img">{RADIO}</p>
//         <div className="radio-text">
//           <p>
//             Radio Session. Playing:
//             <a className="radio-link" href={currentRadio.stream}>
//               {currentRadio.description}
//             </a>
//           </p>
//           {/* <p>Started {date_diff(currentRadio.time, "long")}</p> */}
//         </div>
//         <div>
//           <SigilOnly p={our} size={42} />
//           <span onClick={showViewers} className="viewers">
//             {currentRadio?.viewers?.length || ""}
//             <span>👀</span>
//           </span>
//         </div>
//       </div>
//     );

//   // return (
//   //   {scheduled > Date.now()
//   //   ? (<>
//   //     <p>
//   //       Radio Session. Playing:
//   //       <a className="radio-link" target="_blank" href={currentRadio.stream}>
//   //         {currentRadio.description}
//   //       </a>
//   //     </p>

//   //       <p>Starting at {new Date(scheduled).toLocaleString()}</p>
//   //     </>

//   //   ): scheduled !== 0()

//   // }
//   //     <p>
//   //       Radio Session. Playing:
//   //       <a className="radio-link" target="_blank" href={currentRadio.stream}>
//   //         {currentRadio.description}
//   //       </a>
//   //     </p>
//   //     {scheduled && scheduled > Date.now() ? (
//   //       <p>Starting at {new Date(scheduled).toLocaleString()}</p>
//   //     ) : scheduled !== 0 ? (
//   //       <p>Started {date_diff(new Date(scheduled), "long")}. Click to join.</p>
//   //     ) : (
//   //       <p>Unscheduled session. Click to join.</p>
//   //     )}
//   // );
// }
