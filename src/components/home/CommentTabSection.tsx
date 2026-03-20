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
    const currentY = e.nativeEvent.contentOffset.y;
    const diff = currentY - lastOffsetYRef.current;

    if (Math.abs(diff) < 16) return;

    if (currentY <= 0) {
      onScrollDirection?.("up");
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
