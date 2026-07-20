export const DATA_CHANGED_EVENT = "jindungo:data-changed";

export type DataChangedDetail = {
  scope?: string;
};

/**
 * Notifica ecrãs subscritos de que os dados da API mudaram
 * (após criar/editar/eliminar/aprovar).
 */
export function notifyDataChanged(scope?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<DataChangedDetail>(DATA_CHANGED_EVENT, {
      detail: { scope },
    }),
  );
}
