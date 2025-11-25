import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";
import UserRow from "@/src/components/UserRow";

const blockedUsers = [
  {
    id: 1,
    nickname: "맛있는 건 참을 수 없어",
    userId: "othernick",
    bio: "진짜 맛있는 집들만 픽해놓을거야",
    isBlocked: true,
  },
  {
    id: 2,
    nickname: "맛있는 건 참을 수 있어",
    userId: "fathernick",
    bio: "진짜 맛있는 집들만 피해놓을거야",
    isBlocked: true,
  },

  {
    id: 3,
    nickname: "빌런",
    userId: "villain",
    bio: "으하하하하하하하하하하하하하하하하하하하하하하하하",
    isBlocked: false,
  },

  // ...
];

export default function BlockedScreen() {
  return (
    <ProfileLayout>
      <ProfileHeader title="차단 목록" showBack />
      {blockedUsers.map((u) => (
        <UserRow
          key={u.id}
          nickname={u.nickname}
          userId={u.userId}
          bio={u.bio}
          avatarUri={null} // 프로필 이미지 있으면 넣고
          actionLabel={u.isBlocked ? "차단 해제" : "차단"}
          actionDisabled={!u.isBlocked} // 이미 차단 안 된 애는 검정? 로직은 니가 결정
          onPressAction={() => {
            // 차단/해제 API 호출
          }}
          onPressRow={() => {
            // 프로필로 이동 등
          }}
        />
      ))}
    </ProfileLayout>
  );
}
