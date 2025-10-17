import { e } from "../../../public/assets/chunk-4DSQ3C7T.js";
import { days, minutes } from "../utils/time.ts";

interface Expirable<T> {
  // The actual item/data being stored
  data: T;
  // A timestamp (in milliseconds) indicating when the item expires
  expiresAt: number;
}

type ExpirableStore<T> = Map<string | number, Expirable<T>>;

export interface MemoryStoreOptions<T> {
  expiry?: number;
  idKey?: keyof T;
  timerFn?: (handler: TimerHandler, timeout?: number) => number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export class MemoryStore<T> {
  private idKey: keyof T;
  private map: ExpirableStore<T>;
  private expiry: number;

  constructor(options: MemoryStoreOptions<T> = {}) {
    this.idKey = options.idKey || "id" as keyof T;
    this.map = new Map();
    this.expiry = options.expiry ?? days(1);
    const timerFn = options.timerFn || setInterval;

    // Set up a timer to invalidate expired items every minute
    timerFn(() => this.invalidateExpiredItems(), minutes(1));
  }

  createUniqueId(): string {
    const id = generateId() + generateId();
    // Ensure the ID is unique
    if (this.map.has(id)) {
      return this.createUniqueId();
    }
    return id;
  }

  invalidateExpiredItems() {
    const now = Date.now();
    for (const [key, item] of this.map) {
      if (item.expiresAt <= now) {
        this.map.delete(key);
      }
    }
  }

  has(id: string | number) {
    return this.map.has(id);
  }

  getOrSet(data: T) {
    const id = data[this.idKey];
    if (typeof id !== "string" && typeof id !== "number") {
      throw new Error(
        `Item is missing a valid "${
          String(this.idKey)
        }" property of type string or number`,
      );
    }

    let item = this.get(id);
    if (!item) {
      item = this.set(id, data);
    }
    return item;
  }

  get(id: string | number) {
    const item = this.map.get(id);
    if (item) {
      // If the item has expired, remove it and return undefined
      if (item.expiresAt <= Date.now()) {
        this.map.delete(id);
        return undefined;
      }
      return item.data;
    }
    return undefined;
  }

  set(id: string | number, data: T) {
    this.map.set(id, {
      data,
      expiresAt: Date.now() + this.expiry,
    });

    return data;
  }

  addItems(items: T[]) {
    const now = Date.now();
    for (const item of items) {
      const id = item[this.idKey];

      if (typeof id !== "string" && typeof id !== "number") {
        throw new Error(
          `Item is missing a valid "${
            String(this.idKey)
          }" property of type string or number`,
        );
      }

      this.map.set(id, {
        data: item,
        expiresAt: now + this.expiry,
      });
    }
  }

  get size() {
    return this.map.size;
  }
}
