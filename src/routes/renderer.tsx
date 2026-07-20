import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import * as fs from 'fs';
import * as path from 'path';
import { SlideCanvas } from '../renderer/SlideCanvas';
import { EditorProvider } from '../renderer/EditorContext';
import type { PresentationIR } from '../types/presentation-ir.types';

const getPresentationIR = createServerFn({ method: 'GET' }).handler(async () => {
  const filePath = path.resolve(process.cwd(), 'output', 'presentation-ir.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as PresentationIR;
  }
  return null;
});

export const Route = createFileRoute('/renderer')({
  component: RendererPage,
  loader: async () => {
    const ir = await getPresentationIR();
    return { ir };
  },
});

function RendererPage() {
  const { ir } = Route.useLoaderData();

  if (!ir) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Waiting for presentation-ir.json to be generated...</p>
      </div>
    );
  }

  return (
    <EditorProvider initialIr={ir}>
      <SlideCanvas />
    </EditorProvider>
  );
}
