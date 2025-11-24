import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";

export default function EditScreen() {
  return (
    <ProfileLayout>
      <ProfileHeader title="프로필 수정" showBack={true} />
    </ProfileLayout>
  );
}
