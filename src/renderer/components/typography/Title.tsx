import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';
import { useFitText } from "../../hooks/useFitText";

export const Title: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => {
  const ref = useFitText({ minFontSize: 24, maxFontSize: 120 });
  
  return (
    <h1 
      ref={ref as any}
      className="font-black tracking-tight leading-tight mb-2 w-full" 
      style={{ 
        fontFamily: theme?.typography?.headingFont || theme?.typography?.heading || "sans-serif", 
        color: theme?.colors?.textPrimary || theme?.colors?.primary || "#ffffff", 
        textAlign: data.alignment || "left",
        textWrap: "balance"
      }}
    >
      <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} />
    </h1>
  );
};
