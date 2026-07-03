import { ExternalLink, Github, User } from "lucide-react";
import React, { useState } from "react";

/** One link row in the AppBrand hover/focus info card. */
export interface AppBrandLink {
  /** Leading icon node (sized by the caller; defaults use 3.5 lucide glyphs). */
  icon: React.ReactNode;
  label: string;
  href: string;
}

export interface AppBrandProps {
  /** Product title shown in the pill. */
  title?: string;
  /** Version tag shown next to the title. */
  version?: string;
  /** Short product description at the top of the info card. */
  description?: string;
  /** Link rows in the info card. */
  links?: ReadonlyArray<AppBrandLink>;
  /** Footer line of the info card (copyright / license). */
  footnote?: string;
}

const DEFAULT_LINKS: ReadonlyArray<AppBrandLink> = [
  { icon: <User className="w-3.5 h-3.5" />, label: "Author Name", href: "#" },
  { icon: <Github className="w-3.5 h-3.5" />, label: "View on GitHub", href: "#" },
  { icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Documentation", href: "#" },
];

/**
 * AppBrand — the identity pill in the header, with a hover/focus info card.
 *
 * The pill and its card float over the deck.gl map, so they ride the `popover`
 * tier with `backdrop-blur`; the theme follows the token cascade. Identity
 * content (title, version, description, links, footnote) is prop-driven with
 * the studio's own strings as defaults, so hosts can brand it without forking.
 *
 * The card opens on hover AND on keyboard focus (the pill is focusable and the
 * card's links are reachable by Tab); it closes when the pointer leaves or
 * focus moves outside the component.
 */
export const AppBrand: React.FC<AppBrandProps> = ({
  title = "MapGen Studio",
  version = "v0.1",
  description = "Procedural map generation toolkit for game developers.",
  links = DEFAULT_LINKS,
  footnote = "© 2024 • MIT License",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative h-10"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        // Close only when focus actually leaves the component (pill + card);
        // tabbing between the card's links keeps it open.
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      {/* Main Pill — focusable so the info card (and its links) is keyboard-reachable. */}
      <div
        tabIndex={0}
        className="h-full inline-flex items-center gap-2 px-3 rounded-lg border border-border bg-popover/90 backdrop-blur-sm cursor-default"
      >
        <span className="font-semibold text-[13px] tracking-tight text-foreground">{title}</span>
        <span className="text-label font-mono text-muted-foreground">{version}</span>
      </div>

      {/* Hover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[200px] p-3 rounded-lg border border-border bg-popover/95 backdrop-blur-sm shadow-lg z-50">
          {/* Description */}
          <p className="text-data leading-relaxed text-muted-foreground mb-3">{description}</p>

          <div className="border-t border-border-subtle mb-3" />

          {/* Links */}
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-data font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className="border-t border-border-subtle my-3" />

          {/* Footer */}
          <p className="text-label text-muted-foreground">{footnote}</p>
        </div>
      )}
    </div>
  );
};
