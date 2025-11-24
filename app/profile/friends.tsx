import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";

export default function FriendsScreen() {
  return (
    <ProfileLayout>
      <ProfileHeader title="친구 " showBack={true} />
    </ProfileLayout>
  );
}
