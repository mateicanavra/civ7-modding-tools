import React, { useState } from 'react';
import { ExternalLink, Github, User } from 'lucide-react';

/**
 * AppBrand — the identity pill in the header, with a hover info card.
 *
 * Reskinned onto the design tokens: the pill and its hover card float over the
 * deck.gl map, so they ride the `popover` tier with `backdrop-blur`; the theme
 * follows the single `.dark` class. (The legacy `isLightMode` hex ternaries and
 * the now-unused `isLightMode` prop have been removed.)
 */
export const AppBrand: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="relative h-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>

      {/* Main Pill */}
      <div className="h-full inline-flex items-center gap-2 px-3 rounded-lg border border-border bg-popover/90 backdrop-blur-sm cursor-default">
        <span className="font-semibold text-[13px] tracking-tight text-foreground">
          MapGen Studio
        </span>
        <span className="text-label font-mono text-muted-foreground">v0.1</span>
      </div>

      {/* Hover Dropdown */}
      {isHovered &&
      <div className="absolute top-full left-0 mt-2 min-w-[200px] p-3 rounded-lg border border-border bg-popover/95 backdrop-blur-sm shadow-lg z-50">
          {/* Description */}
          <p className="text-data leading-relaxed text-muted-foreground mb-3">
            Procedural map generation toolkit for game developers.
          </p>

          <div className="border-t border-border-subtle mb-3" />

          {/* Links */}
          <div className="flex flex-col gap-2">
            <a
            href="#"
            className="flex items-center gap-2 text-data font-medium text-muted-foreground transition-colors hover:text-foreground">

              <User className="w-3.5 h-3.5" />
              <span>Author Name</span>
            </a>
            <a
            href="#"
            className="flex items-center gap-2 text-data font-medium text-muted-foreground transition-colors hover:text-foreground">

              <Github className="w-3.5 h-3.5" />
              <span>View on GitHub</span>
            </a>
            <a
            href="#"
            className="flex items-center gap-2 text-data font-medium text-muted-foreground transition-colors hover:text-foreground">

              <ExternalLink className="w-3.5 h-3.5" />
              <span>Documentation</span>
            </a>
          </div>

          <div className="border-t border-border-subtle my-3" />

          {/* Footer */}
          <p className="text-label text-muted-foreground">© 2024 • MIT License</p>
        </div>
      }
    </div>);

};
