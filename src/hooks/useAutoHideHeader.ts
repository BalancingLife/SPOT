import { useRef, useState, useCallback } from "react";
import { Animated, LayoutChangeEvent } from "react-native";

type Options = {
  duration?: number;
};

export function useAutoHideHeader(options?: Options) {
  const duration = options?.duration ?? 220;

  const [headerMeasuredHeight, setHeaderMeasuredHeight] = useState(0);
  const [isHeaderReady, setIsHeaderReady] = useState(false);

  const headerHeightAnim = useRef(new Animated.Value(0)).current;
  const isHeaderHiddenRef = useRef(false);

  /** 헤더 보여주기 */
  const showHeader = useCallback(() => {
    if (headerMeasuredHeight <= 0) return;
    if (!isHeaderHiddenRef.current) return;

    isHeaderHiddenRef.current = false;

    Animated.timing(headerHeightAnim, {
      toValue: headerMeasuredHeight,
      duration,
      useNativeDriver: false,
    }).start();
  }, [headerMeasuredHeight, headerHeightAnim, duration]);

  /** 헤더 숨기기 */
  const hideHeader = useCallback(() => {
    if (headerMeasuredHeight <= 0) return;
    if (isHeaderHiddenRef.current) return;

    isHeaderHiddenRef.current = true;

    Animated.timing(headerHeightAnim, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [headerMeasuredHeight, headerHeightAnim, duration]);

  /** 최초 height 측정 */
  const handleHeaderLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;
      if (height <= 0) return;

      if (!isHeaderReady) {
        setHeaderMeasuredHeight(height);
        headerHeightAnim.setValue(height);
        isHeaderHiddenRef.current = false;
        setIsHeaderReady(true);
      }
    },
    [isHeaderReady, headerHeightAnim],
  );

  /** 스크롤 방향 전달받아서 처리 */
  const handleScrollDirection = useCallback(
    (direction: "up" | "down") => {
      if (direction === "down") {
        hideHeader();
        return;
      }
      showHeader();
    },
    [hideHeader, showHeader],
  );

  /** Animated style (외부에서 바로 쓰기) */
  const animatedHeaderStyle = {
    height: headerHeightAnim,
  };

  return {
    isHeaderReady,
    animatedHeaderStyle,
    handleHeaderLayout,
    handleScrollDirection,
    showHeader,
    hideHeader,
  };
}
