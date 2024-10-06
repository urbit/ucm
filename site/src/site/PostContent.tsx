import {
  Block,
  ChannelCite,
  Cite,
  Content,
  DiaryPost,
  Inline,
} from "../logic/types-tlon";
import { Box, Divider, Typography } from "@mui/material";
import { retardedTlonTokens } from "../logic/utils";
import { NotRetardedInline, Ship } from "../logic/types";
import { CSSProperties } from "react";
import { IMAGE_REGEX } from "../logic/constants";

const styles = {
  logo: {
    width: "64px",
    height: "64px",
  },
  navbar: {
    backgroundColor: "black",
  },
  appLinks: {
    flexGrow: 1,
    justifyContent: "space-evenly",
  },
  appLink: {
    color: "white",
    textTransform: "uppercase",
  },
  blogText: {
    margin: "24px 0",
    lineHeight: 1.61,
    textAlign: "justify",
  },
  snip: {},
  paragraph: {},
};

export type PostStyles = {
  container: CSSProperties;
  paragraph: CSSProperties;
};
export function PostContent({
  content,
  style,
}: {
  content: Content;
  style?: PostStyles;
}) {
  const containerStyle = style?.container ? style.container : styles.blogText;
  const paragraphStyle = style?.paragraph ? style.paragraph : styles.paragraph;
  return (
    <Box sx={containerStyle}>
      {content.map((v, i) => {
        const key = JSON.stringify(v) + i;
        if ("block" in v) return <BlockDiv key={key} block={v.block} />;
        else
          return (
            <Typography key={key} sx={paragraphStyle} variant="body1" my={2}>
              <Paragraph inline={v.inline} />
            </Typography>
          );
      })}
    </Box>
  );
}
function BlockDiv({ block }: { block: Block }) {
  if ("image" in block)
    return (
      <img
        src={block.image.src}
        alt={block.image.alt}
        width={block.image.width}
        height={block.image.height}
      />
    );
  if ("header" in block) {
    if (block.header.tag === "h1")
      return (
        <h1>
          <Paragraph inner={true} inline={block.header.content} />
        </h1>
      );
    if (block.header.tag === "h2")
      return (
        <h2>
          <Paragraph inner={true} inline={block.header.content} />
        </h2>
      );
    if (block.header.tag === "h3")
      return (
        <h3>
          <Paragraph inner={true} inline={block.header.content} />
        </h3>
      );
    if (block.header.tag === "h4")
      return (
        <h4>
          <Paragraph inner={true} inline={block.header.content} />
        </h4>
      );
    if (block.header.tag === "h5")
      return (
        <h5>
          <Paragraph inner={true} inline={block.header.content} />
        </h5>
      );
    if (block.header.tag === "h6")
      return (
        <h6>
          <Paragraph inner={true} inline={block.header.content} />
        </h6>
      );
  }
  if ("rule" in block) return <hr />;
  if ("code" in block)
    return (
      <pre>
        <code>{block.code.code}</code>
      </pre>
    );
  if ("listing" in block) {
    if ("item" in block.listing)
      return (
        <li>
          <Paragraph inner={true} inline={block.listing.item} />
        </li>
      );
    if (block.listing.list.type === "tasklist")
      return (
        <div className="tasklist">
          {block.listing.list.items.map((l, i) => (
            <BlockDiv key={i} block={{ listing: l }} />
          ))}
        </div>
      );
    if (block.listing.list.type === "unordered")
      return (
        <ul>
          {block.listing.list.items.map((l, i) => (
            <BlockDiv key={i} block={{ listing: l }} />
          ))}
        </ul>
      );
    if (block.listing.list.type === "ordered")
      return (
        <ol>
          {block.listing.list.items.map((l, i) => (
            <BlockDiv key={i} block={{ listing: l }} />
          ))}
        </ol>
      );
  }
}
interface ReferenceProps {
  cite: Cite;
}
function Reference({ cite }: ReferenceProps) {
  if ("chan" in cite) return <ChanRef cite={cite} />;
  // console.log(cite, "cite");
  // return (
  //   <div className="reference-block">
  //     {"group" in cite ? (
  //       <div className="group-ref"></div>
  //     ) : "chan" in cite ? (
  //     ) : "desk" in cite ? (
  //       <div className="desk-ref"></div>
  //     ) : "bait" in cite ? (
  //       <div className="bait-ref"></div>
  //     ) : null}
  //   </div>
  // );
}

function ChanRef({ cite }: { cite: ChannelCite }) {
  // <div className="chan-ref">
  //     <Quote post={data} />
  // </div>
  return <div />;
}
type QuoteProps = {
  post: DiaryPost;
};
// export function Quote({ post }: QuoteProps) {
//   // const profile = useProfile(post.essay.author);
//   const name = profile?.nickname ? profile.nickname : post.essay.author;
//   return (
//     <>
//       <p className="quote-author">{name}</p>
//       <div className="quote-snip">
//         <PostContent verses={post.essay.content} />
//       </div>
//     </>
//   );
// }

export function Paragraph({
  inline,
  inner,
}: {
  inner?: boolean;
  inline: Inline[];
}) {
  const paragraphs = retardedTlonTokens(inline);
  return paragraphs.map((p, i) => (
    <InlineText key={JSON.stringify(p) + i} inline={p} />
  ));
}
interface InlineProps {
  inline: NotRetardedInline[];
  isPost?: boolean;
}
export function InlineText({ inline, isPost }: InlineProps) {
  // const { setModal } = useStore();
  function openShipModal(s: Ship) {}
  // return <PollLoader ship={r.ref.ship} id={r.ref.path.slice(1)} />;
  return (
    <span className="inline-content">
      {inline.map((i, ind) => {
        const key = JSON.stringify(i) + ind;
        // console.log(i, 'inline');
        if ("text" in i) return <span key={key}>{i.text}</span>;
        if ("bold" in i)
          return (
            <strong key={key}>
              <Paragraph inline={i.bold} />
            </strong>
          );
        if ("italics" in i)
          return (
            <em key={key}>
              <Paragraph inline={i.italics} />
            </em>
          );
        if ("strike" in i)
          return (
            <span key={key} className="strikethrough">
              <Paragraph inline={i.strike} />
            </span>
          );
        if ("link" in i) {
          const containsProtocol = i.link.href.match(/https?:\/\//);
          if (i.link.href.match(IMAGE_REGEX))
            return (
              <img
                style={{ maxWidth: "100%", margin: "1rem 0" }}
                src={i.link.href}
              />
            );
          else
            return (
              <a key={key} target="_blank" href={i.link.href}>
                {i.link.content}
              </a>
            );
        }
        if ("blockquote" in i)
          return (
            <blockquote key={key}>
              <Paragraph inline={i.blockquote} />
            </blockquote>
          );
        if ("code" in i)
          return (
            <pre key={key} className="bg-gray-50 px-4 dark:bg-gray-100">
              <code>{i.code}</code>
            </pre>
          );
        if ("task" in i)
          return (
            <span key={key} className="task">
              <input type="checkbox" checked={i.task.checked} />
              <Paragraph inline={i.task.content} />
            </span>
          );
        if ("inline-code" in i)
          return (
            <span key={key} className="msg-inline-code">
              {i["inline-code"]}
            </span>
          );
        if ("ship" in i)
          return (
            <span key={key} className="msg-ship-mention" role="link">
              {i.ship}
            </span>
          );
        // if ("break" in i) return <br key={key} />;
      })}
    </span>
  );
}
