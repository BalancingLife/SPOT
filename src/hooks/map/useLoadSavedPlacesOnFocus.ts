import { useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { fetchMyNewSavedPlaces } from "@/src/lib/api/places";
import { useLocationStore } from "@/src/stores/useLocationStore";
import { useSavedPlacesStore } from "@/src/stores/useSavedPlacesStore";

export function useLoadSavedPlacesOnFocus() {
  const lastSavedPlacesKeyRef = useRef<string | null>(null);

  const refreshOnce = useLocationStore((s) => s.refreshOnce);

  const setSavedList = useSavedPlacesStore((s) => s.setSavedList);
  const setSavedLoading = useSavedPlacesStore((s) => s.setSavedLoading);
  const setSavedError = useSavedPlacesStore((s) => s.setSavedError);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadSavedPlaces = async () => {
        await refreshOnce();

        if (cancelled) return;

        const { coords } = useLocationStore.getState();
        if (!coords) return;

        const roundedLat = Number(coords.lat.toFixed(4));
        const roundedLng = Number(coords.lng.toFixed(4));
        const requestKey = `${roundedLat},${roundedLng}`;

        if (lastSavedPlacesKeyRef.current === requestKey) {
          return;
        }

        lastSavedPlacesKeyRef.current = requestKey;

        setSavedLoading(true);
        setSavedError(null);

        try {
          const list = await fetchMyNewSavedPlaces({
            lat: roundedLat,
            lng: roundedLng,
          });

          if (!cancelled) {
            setSavedList(list);
          }
        } catch (e: any) {
          if (!cancelled) {
            setSavedError(e?.message ?? "failed to load");
            lastSavedPlacesKeyRef.current = null;
          }
        } finally {
          if (!cancelled) {
            setSavedLoading(false);
          }
        }
      };

      loadSavedPlaces();

      return () => {
        cancelled = true;
      };
    }, [refreshOnce, setSavedList, setSavedLoading, setSavedError]),
  );
}
