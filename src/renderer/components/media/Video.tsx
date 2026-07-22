import React from "react";
import { AssetRenderer } from "../../AssetRenderer";
import { BaseComponentProps } from "../../RendererRegistry";

export const Video: React.FC<BaseComponentProps> = ({ data, assets }) => (
  <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/15 my-4 relative bg-black/50 backdrop-blur-md group cursor-pointer">
    {data.asset_id && assets?.[data.asset_id] ? (
      <AssetRenderer asset={assets[data.asset_id]} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
        <div className="w-[clamp(4rem,8cqw,6rem)] h-[clamp(4rem,8cqw,6rem)] rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
          <span className="text-[clamp(1.5rem,3cqw,2.5rem)] text-white ml-2">▶</span>
        </div>
      </div>
    )}
  </div>
);