import React, { useState } from "react";
import type { AssetIR } from "../types/presentation-ir.types";
import { useEditor } from "./EditorContext";

export const AssetRenderer: React.FC<{ asset: AssetIR; className?: string }> = ({ asset, className }) => {
  const { isEditable, updateAsset } = useEditor();
  const [isHovered, setIsHovered] = useState(false);

  const handleReplace = () => {
    if (!isEditable) return;
    const newUrl = window.prompt("Enter new image URL:", asset.url);
    if (newUrl && newUrl !== asset.url) {
      updateAsset(asset.id, newUrl);
    }
  };

  if (asset.type === "image") {
    return (
      <div 
        className="relative group w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          src={asset.url || `https://source.unsplash.com/random/800x600?${encodeURIComponent(asset.generation_prompt || "abstract")}`} 
          alt={asset.alt_text || "Presentation Asset"} 
          className={className || "w-full h-auto object-cover"}
        />
        {isEditable && isHovered && (
          <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity"
            onClick={handleReplace}
          >
            <span className="text-white font-semibold bg-black/70 px-4 py-2 rounded-full">Replace Image</span>
          </div>
        )}
      </div>
    );
  }

  if (asset.type === "icon") {
    // Basic icon renderer fallback
    return <span className={className || "text-4xl"}>{asset.url || "🔹"}</span>;
  }

  if (asset.type === "video") {
    return (
      <video src={asset.url} className={className || "w-full h-auto object-cover"} controls />
    );
  }

  return null;
};
