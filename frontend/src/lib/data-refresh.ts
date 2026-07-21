export const DATA_CHANGED_EVENT = "jindungo:data-changed";

const BROADCAST_CHANNEL = "jindungo-data-changed";

export type DataChangedDetail = {
  scope?: string;
};

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
  }

  return broadcastChannel;
}

/**
 * Notifica ecrãs subscritos de que os dados da API mudaram
 * (após criar/editar/eliminar/aprovar), incluindo outros separadores.
 */
export function notifyDataChanged(scope?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const detail: DataChangedDetail = { scope };

  window.dispatchEvent(
    new CustomEvent<DataChangedDetail>(DATA_CHANGED_EVENT, {
      detail,
    }),
  );

  try {
    getBroadcastChannel()?.postMessage(detail);
  } catch {
    // BroadcastChannel pode falhar em contextos restritos.
  }
}

/**
 * Subscreve mudanças vindas de outros separadores do mesmo origem.
 */
export function subscribeCrossTabDataChanged(
  listener: (detail: DataChangedDetail) => void,
): () => void {
  const channel = getBroadcastChannel();
  if (!channel) {
    return () => undefined;
  }

  const onMessage = (event: MessageEvent<DataChangedDetail>) => {
    listener(event.data ?? {});
  };

  channel.addEventListener("message", onMessage);

  return () => {
    channel.removeEventListener("message", onMessage);
  };
}
