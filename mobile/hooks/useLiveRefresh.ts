import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";
import { subscribeDataChanged } from "@/lib/data-refresh";

type LoadFn = () => void | Promise<void>;

/**
 * Recarrega dados ao focar o ecrã, ao voltar à app e após mutações API.
 */
export function useLiveRefresh(load: LoadFn, enabled = true): void {
  const loadRef = useRef(load);
  loadRef.current = load;

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }

      void loadRef.current();

      return subscribeDataChanged(() => {
        void loadRef.current();
      });
    }, [enabled]),
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onChange = (state: AppStateStatus) => {
      if (state === "active") {
        void loadRef.current();
      }
    };

    const subscription = AppState.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, [enabled]);
}
