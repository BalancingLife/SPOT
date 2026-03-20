import { useState, useMemo, useRef } from "react";
import {
  ScrollView,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

import FilterBar from "../bottomSheet/FilterBar";
import OptionModal from "../common/OptionModal";
import { CommentCard } from "../comment/CommentCard";

import {
  type HomeScope,
  type HomeCommentItem,
} from "@/src/components/home/types";

type CommentTabSectionProps = {
  scope: HomeScope;
  commentList: HomeCommentItem[];
  onScrollDirection?: (direction: "up" | "down") => void;
};

const SCROLL_THRESHOLD = 16;
const BOTTOM_EDGE_THRESHOLD = 24;
const BOTTOM_BOUNCE_UP_IGNORE_THRESHOLD = 20;

export const CommentTabSection = ({
  scope,
  commentList,
  onScrollDirection,
}: CommentTabSectionProps) => {
  const [sort, setSort] = useState<string[]>(["latest"]);
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null,
  );

  const lastOffsetYRef = useRef(0);

  const sortOptions = useMemo(
    () => [
      { label: "최신순", value: "latest" },
      { label: "거리순", value: "distance" },
    ],
    [],
  );

  const sortLabel =
    sortOptions.find((option) => option.value === sort[0])?.label ?? "최신순";

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;

    const currentY = contentOffset.y;
    const prevY = lastOffsetYRef.current;
    const diff = currentY - prevY;

    const layoutHeight = layoutMeasurement.height;
    const contentHeight = contentSize.height;

    const distanceFromBottom = contentHeight - layoutHeight - currentY;
    const isNearBottom = distanceFromBottom <= BOTTOM_EDGE_THRESHOLD;

    if (currentY <= 0) {
      onScrollDirection?.("up");
      lastOffsetYRef.current = currentY;
      return;
    }

    if (Math.abs(diff) < SCROLL_THRESHOLD) {
      lastOffsetYRef.current = currentY;
      return;
    }

    if (
      isNearBottom &&
      diff < 0 &&
      Math.abs(diff) < BOTTOM_BOUNCE_UP_IGNORE_THRESHOLD
    ) {
      lastOffsetYRef.current = currentY;
      return;
    }

    onScrollDirection?.(diff > 0 ? "down" : "up");
    lastOffsetYRef.current = currentY;
  };

  return (
    <View style={{ flex: 1 }}>
      <FilterBar
        sortLabel={sortLabel}
        categoryLabel=""
        onPressSort={() => setOpened("sort")}
        showSaveType={false}
        showCategory={false}
      />

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <CommentCard commentList={commentList} />
      </ScrollView>

      <OptionModal
        visible={opened === "sort"}
        title="정렬 기준"
        options={sortOptions}
        selected={sort}
        onSelect={(next) => setSort(next)}
        onClose={() => setOpened(null)}
      />
    </View>
  );
};
