import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";

export default function SettingScreen() {
  return (
    <ProfileLayout>
      <ProfileHeader title="설정" showBack={true} />
    </ProfileLayout>
  );
}
