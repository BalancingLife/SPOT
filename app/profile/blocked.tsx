import React, { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";
import UserRow from "@/src/components/UserRow";

import { fetchBlockList, type BlockItem } from "@/src/lib/api/settings";

// status 값은 백엔드 정의에 맞춰 수정
const isBlockedStatus = (status: string) =>
  status === "BLOCKED" ||
  status === "blocked" ||
  status === "Y" ||
  status === "ACTIVE";

export default function BlockedScreen() {
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<BlockItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBlockList();
      setBlocks(res.blocks);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // ✅ UI에서 쓰기 좋은 형태로 매핑
  const rows = useMemo(() => {
    return (
      blocks
        .map((b) => {
          const blocked = isBlockedStatus(b.status);

          return {
            key: b.id,
            friendId: b.friendId,
            // ⚠️ blocklist 응답엔 유저 정보가 없어서 임시로 표시
            nickname: `유저 #${b.friendId}`,
            userId: `friend-${b.friendId}`,
            bio: blocked ? "차단된 사용자" : "차단 해제됨",
            avatarUri: null as string | null,
            isBlocked: blocked,
          };
        })
        // 차단된 애들만 보여주고 싶으면 필터
        .filter((r) => r.isBlocked)
    );
  }, [blocks]);

  return (
    <ProfileLayout>
      <ProfileHeader title="차단 목록" showBack />

      {rows.map((u) => (
        <UserRow
          key={u.key}
          nickname={loading ? "불러오는 중..." : u.nickname}
          userId={loading ? "" : u.userId}
          bio={loading ? "" : u.bio}
          avatarUri={u.avatarUri}
          actionLabel={u.isBlocked ? "차단 해제" : "차단"}
          actionDisabled={loading || !u.isBlocked}
          onPressAction={() => {
            Alert.alert("차단 해제", `${u.nickname} 차단을 해제할까요?`, [
              { text: "취소", style: "cancel" },
              {
                text: "해제",
                style: "destructive",
                onPress: async () => {
                  // TODO: 여기에 unblock API 붙여야 함 (아래 2번 참고)
                  Alert.alert("알림", "차단 해제 API가 아직 없습니다.");
                },
              },
            ]);
          }}
          onPressRow={() => {
            // TODO: 프로필 이동(친구 프로필 화면 경로 있으면 여기서 router.push)
          }}
        />
      ))}
    </ProfileLayout>
  );
}
