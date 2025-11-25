import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";

export default function AccountSettingScreen() {
  return (
    <ProfileLayout>
      <ProfileHeader title="계정설정" showBack={true} />
    </ProfileLayout>
  );
}
