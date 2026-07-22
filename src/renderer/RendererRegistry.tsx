import React from "react";
import type { ComponentType } from "../types/presentation-ir.types";
import {
  Title, Subtitle, Paragraph, Quote, Callout, SectionDivider, Footer,
  Image, HeroImage, Icon, Video,
  IconCard, FeatureCard, KPICard, TeamCard, PricingCard, Testimonial, Statistic, MetricGrid,
  BulletList, NumberedList, Table, IconGrid, Timeline, Process, Comparison, FAQ,
  CTA, Chart, Diagram, Flowchart, MindMap, CodeBlock
} from "./components";

export interface BaseComponentProps<T = any> {
  data: T;
  theme?: any;
  styleOverrides?: Record<string, string | number>;
  assets?: Record<string, any>;
  slideId: string;
  componentId: string;
}

export const RendererRegistry: Record<ComponentType, React.FC<BaseComponentProps>> = {
  Title,
  Subtitle,
  Paragraph,
  BulletList,
  NumberedList,
  Quote,
  Callout,
  Image,
  HeroImage,
  Icon,
  IconCard,
  FeatureCard,
  IconGrid,
  Timeline,
  Process,
  Comparison,
  Table,
  KPICard,
  Statistic,
  MetricGrid,
  Chart,
  Diagram,
  Flowchart,
  MindMap,
  CodeBlock,
  Video,
  CTA,
  Testimonial,
  TeamCard,
  PricingCard,
  FAQ,
  Footer,
  SectionDivider
};
