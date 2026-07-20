import React, { useState, useRef, useEffect } from "react";
import { useEditor } from "./EditorContext";

interface EditableTextProps {
  slideId: string;
  componentId: string;
  field: string;
  value: string;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  slideId,
  componentId,
  field,
  value,
  className,
  style,
  multiline = false
}) => {
  const { isEditable, updateComponentData } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      updateComponentData(slideId, componentId, { [field]: tempValue });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditable) {
    return <span className={className} style={style}>{value}</span>;
  }

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: tempValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTempValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: `${className || ""} bg-blue-50 border-b-2 border-blue-500 outline-none w-full`,
      style: { ...style, resize: 'none' } as React.CSSProperties
    };

    return multiline ? (
      <textarea {...commonProps} rows={tempValue.split('\n').length} />
    ) : (
      <input type="text" {...commonProps} />
    );
  }

  return (
    <span 
      className={`cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 rounded transition-shadow ${className || ""}`}
      style={style}
      onClick={() => setIsEditing(true)}
    >
      {value || " "}
    </span>
  );
};
