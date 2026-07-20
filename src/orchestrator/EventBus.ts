import { TelemetryEvent } from "./types";

type EventHandler = (event: TelemetryEvent) => void;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  public subscribe(eventType: string, handler: EventHandler): void {
    const current = this.handlers.get(eventType) || [];
    current.push(handler);
    this.handlers.set(eventType, current);
  }

  public publish(eventType: string, payload: any, workflow_id: string): void {
    const event: TelemetryEvent = {
      event: eventType,
      timestamp: Date.now(),
      workflow_id,
      payload,
    };
    
    const handlers = this.handlers.get(eventType) || [];
    handlers.forEach((h) => {
      try {
        h(event);
      } catch (err) {
        console.error(`[EventBus] Error in handler for ${eventType}:`, err);
      }
    });
  }
}
