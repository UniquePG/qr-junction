import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Renders a string with **bold** and [label](href) markdown.
 * Links starting with / or https:// become real anchors for SEO.
 */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      const href = match[3];
      const isInternal = href.startsWith("/");
      nodes.push(
        <Link
          key={`link-${key++}`}
          href={href}
          className="text-primary font-semibold underline underline-offset-2 hover:text-[#001B50]"
          {...(!isInternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {match[2]}
        </Link>
      );
    } else if (match[4]) {
      nodes.push(
        <strong key={`b-${key++}`} className="text-[#001B50] font-bold">
          {match[4]}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
}

export function ListItemText({ text }: { text: string }) {
  const emDashIdx = text.indexOf(" — ");
  if (emDashIdx !== -1) {
    return (
      <>
        <strong className="text-[#001B50] font-bold">
          <RichText text={text.substring(0, emDashIdx)} />
        </strong>
        <RichText text={text.substring(emDashIdx)} />
      </>
    );
  }

  if (text.includes(": ") && (text.startsWith("Step ") || text.startsWith("Step:"))) {
    const colonIdx = text.indexOf(": ");
    return (
      <>
        <strong className="text-[#001B50] font-bold">
          {text.substring(0, colonIdx + 1)}
        </strong>
        <RichText text={text.substring(colonIdx + 1)} />
      </>
    );
  }

  return <RichText text={text} />;
}
