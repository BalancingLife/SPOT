import { useState, useMemo } from "react";
import { View } from "react-native";

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
};

export const CommentTabSection = ({
  scope,
  commentList,
}: CommentTabSectionProps) => {
  // 필터 선택 상태
  const [sort, setSort] = useState<string[]>(["latest"]);

  // 필터 모달 열림 상태
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null,
  );

  // 정렬 옵션은 고정값이므로 메모이제이션해 불필요한 재생성을 막는다.
  const sortOptions = useMemo(
    () => [
      { label: "최신순", value: "latest" },
      { label: "거리순", value: "distance" },
    ],
    [],
  );

  // 현재 선택된 정렬값에 대응하는 라벨을 계산한다.
  const sortLabel =
    sortOptions.find((option) => option.value === sort[0])?.label ?? "최신순";

  return (
    <View style={{ flex: 1 }}>
      <FilterBar
        sortLabel={sortLabel}
        categoryLabel="" // 안 쓸 거라 빈 값
        onPressSort={() => setOpened("sort")}
        showSaveType={false}
        showCategory={false}
      />

      <CommentCard commentList={commentList} scope={scope} />

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
