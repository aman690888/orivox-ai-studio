export interface SharedMemoryContext {
  audience?: string;
  tone?: string;
  language?: string;
  theme?: string;
  image_style?: string;
  keywords?: string[];
  research?: Record<string, any>;
  citations?: Record<string, string>;
  company_profile?: string;
  presenter_notes?: string;
  visual_preferences?: string[];
  narrative_context?: string;
}

export class SharedMemory {
  private data: SharedMemoryContext;

  constructor(initialData: SharedMemoryContext = {}) {
    // Deep clone to ensure immutability when passed around
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  public getSlice<K extends keyof SharedMemoryContext>(keys: K[]): Pick<SharedMemoryContext, K> {
    const slice: any = {};
    for (const key of keys) {
      if (this.data[key] !== undefined) {
        // Deep clone the slice so agents cannot mutate the shared memory
        slice[key] = JSON.parse(JSON.stringify(this.data[key]));
      }
    }
    return slice;
  }

  public update(updates: Partial<SharedMemoryContext>): SharedMemory {
    const nextData = { ...this.data, ...updates };
    return new SharedMemory(nextData);
  }

  public getFullContext(): SharedMemoryContext {
    return JSON.parse(JSON.stringify(this.data));
  }
}
