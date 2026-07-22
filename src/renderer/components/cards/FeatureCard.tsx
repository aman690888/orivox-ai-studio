import React from "react";
import { motion } from "framer-motion";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const FeatureCard: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <motion.div 
    whileHover={{ y: -8, scale: 1.02, rotateX: 2, rotateY: -2 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-xl flex flex-col justify-between backdrop-blur-lg relative overflow-hidden" 
    style={{ 
      backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", 
      borderColor: theme?.colors?.cardBorder || "rgba(39, 39, 42, 0.8)", 
      borderTop: `4px solid ${theme?.colors?.accent || theme?.colors?.primary || "#6366f1"}`,
      boxShadow: `0 4px 20px -2px rgba(0,0,0,0.5), 0 0 20px -5px ${theme?.colors?.accent || theme?.colors?.primary || "#6366f1"}80`
    }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 blur-2xl pointer-events-none" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", opacity: 0.1 }}></div>
    <div className="relative z-10">
      <h3 className="text-[clamp(1.25rem,2.2cqw,1.75rem)] font-bold mb-3 text-white drop-shadow-sm">{data.title}</h3>
      <p className="text-[clamp(0.875rem,1.5cqw,1.125rem)] opacity-80 leading-relaxed text-zinc-300">{data.description}</p>
    </div>
  </motion.div>

);
