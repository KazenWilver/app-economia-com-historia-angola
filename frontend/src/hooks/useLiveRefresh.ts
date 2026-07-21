"use client";

import { useEffect, useRef } from "react";
import {
  DATA_CHANGED_EVENT,
  subscribeCrossTabDataChanged,
  type DataChangedDetail,
} from "@/lib/data-refresh";

type LoadFn = (options?: { silent?: boolean }) => void | Promise<void>;

interface UseLiveRefreshOptions {
  /** Se false, não corre no mount (útil quando outro efeito já carrega). */
  runOnMount?: boolean;
  /** Escopos a ouvir; se omitido, reage a qualquer notifyDataChanged. */
  scopes?: string[];
  enabled?: boolean;
}

/**
 * Recarrega dados no mount, ao focar a janela, ao voltar ao separador
 * e quando notifyDataChanged() é disparado após mutações (mesmo separador
 * ou outro).
 */
export function useLiveRefresh(
  load: LoadFn,
  options: UseLiveRefreshOptions = {},
): void {
  const { runOnMount = true, scopes, enabled = true } = options;
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const refreshSilent = () => {
      void loadRef.current({ silent: true });
    };

    const refreshMount = () => {
      void loadRef.current(runOnMount ? undefined : { silent: true });
    };

    if (runOnMount) {
      refreshMount();
    }

    const onFocus = () => {
      refreshSilent();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshSilent();
      }
    };

    const shouldRefresh = (detail?: DataChangedDetail) => {
      if (
        scopes &&
        scopes.length > 0 &&
        detail?.scope &&
        !scopes.includes(detail.scope)
      ) {
        return false;
      }
      return true;
    };

    const onDataChanged = (event: Event) => {
      const detail = (event as CustomEvent<DataChangedDetail>).detail;
      if (!shouldRefresh(detail)) {
        return;
      }
      refreshSilent();
    };

    const unsubscribeCrossTab = subscribeCrossTabDataChanged((detail) => {
      if (!shouldRefresh(detail)) {
        return;
      }
      refreshSilent();
    });

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(DATA_CHANGED_EVENT, onDataChanged);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(DATA_CHANGED_EVENT, onDataChanged);
      unsubscribeCrossTab();
    };
  }, [enabled, runOnMount, scopes]);
}
