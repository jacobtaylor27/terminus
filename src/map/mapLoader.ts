import { fetchMapShapes, type MapShape } from './mapShapes.ts'

// Each map data file, fetched once and shared by everything drawn from it: the world map, each
// Continent's and their thumbnails are all drawn from world-50m.json.
const shapesByUrl = new Map<string, Promise<MapShape[]>>()

export function shapesAt(url: string): Promise<MapShape[]> {
  let shapes = shapesByUrl.get(url)
  if (!shapes) {
    shapes = fetchMapShapes(url)
    shapesByUrl.set(url, shapes)
  }
  return shapes
}

// Something worked out from a map's data, once, such as a map's geometry or its thumbnail. It tells
// its subscribers when it has been.
export interface MapLoader<T> {
  // What was worked out, once it has been, or null if the map's data couldn't be fetched; undefined
  // until then.
  current(): T | null | undefined
  subscribe(listener: () => void): () => void
  // Starts working it out, unless it already has.
  load(): void
}

export function mapLoader<T>(work: () => Promise<T>): MapLoader<T> {
  let current: T | null | undefined
  let loadStarted = false
  const listeners = new Set<() => void>()

  function load() {
    if (loadStarted) return
    loadStarted = true
    work()
      .catch(() => null)
      .then((loaded) => {
        current = loaded
        for (const listener of listeners) listener()
      })
  }

  return {
    current: () => current,
    subscribe(listener) {
      listeners.add(listener)
      load()
      return () => {
        listeners.delete(listener)
      }
    },
    load,
  }
}
