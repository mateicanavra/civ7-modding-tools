import React, { useState } from 'react';
import { ExternalLink, Github, User } from 'lucide-react';
interface AppBrandProps {
  isLightMode: boolean;
}
export const AppBrand: React.FC<AppBrandProps> = ({ isLightMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  // ============================================================================
  // Styles
  // ============================================================================
  const containerClass = isLightMode ?
  'bg-white/90 border-gray-200' :
  'bg-[#16161d]/90 border-[#26262e]';
  const textClass = isLightMode ? 'text-[#1f2933]' : 'text-[#e2e2e9]';
  const mutedClass = isLightMode ? 'text-[#6b7280]' : 'text-[#6a6a7c]';
  const linkClass = isLightMode ?
  'text-[#4b5563] hover:text-[#1f2933]' :
  'text-[#7a7a8c] hover:text-[#e2e2e9]';
  const dividerClass = isLightMode ? 'border-gray-200' : 'border-[#26262e]';
  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div
      className="relative h-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>

      {/* Main Pill */}
      <div
        className={`
          h-full inline-flex items-center gap-2 px-3 rounded-lg border
          backdrop-blur-sm cursor-default
          ${containerClass}
        `}>

        <span
          className={`font-semibold text-[13px] tracking-tight ${textClass}`}>

          MapGen Studio
        </span>
        <span className={`text-[10px] font-mono ${mutedClass}`}>v0.1</span>
      </div>

      {/* Hover Dropdown */}
      {isHovered &&
      <div
        className={`
            absolute top-full left-0 mt-2
            min-w-[200px] p-3 rounded-lg border
            backdrop-blur-sm shadow-lg z-50
            ${containerClass}
          `}>

          {/* Description */}
          <p className={`text-[11px] leading-relaxed ${mutedClass} mb-3`}>
            Procedural map generation toolkit for game developers.
          </p>

          <div className={`border-t ${dividerClass} mb-3`} />

          {/* Links */}
          <div className="flex flex-col gap-2">
            <a
            href="#"
            className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${linkClass}`}>

              <User className="w-3.5 h-3.5" />
              <span>Author Name</span>
            </a>
            <a
            href="#"
            className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${linkClass}`}>

              <Github className="w-3.5 h-3.5" />
              <span>View on GitHub</span>
            </a>
            <a
            href="#"
            className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${linkClass}`}>

              <ExternalLink className="w-3.5 h-3.5" />
              <span>Documentation</span>
            </a>
          </div>

          <div className={`border-t ${dividerClass} my-3`} />

          {/* Footer */}
          <p className={`text-[10px] ${mutedClass}`}>© 2024 • MIT License</p>
        </div>
      }
    </div>);

};