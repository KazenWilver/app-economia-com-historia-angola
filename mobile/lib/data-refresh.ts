type Listener = (scope?: string) => void;

const listeners = new Set<Listener>();

/**
 * Notifica ecrãs mobile de que os dados mudaram após uma mutação.
 */
export function notifyDataChanged(scope?: string): void {
  for (const listener of listeners) {
    listener(scope);
  }
}

export function subscribeDataChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
