import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";

export default function BlockedScreen() {
  return (
    <ProfileLayout>
      <ProfileHeader title="차단 목록" showBack={true} />
    </ProfileLayout>
  );
}
