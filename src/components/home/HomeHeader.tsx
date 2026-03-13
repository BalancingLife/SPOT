import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import StoryList from "@/src/components/home/StoryList";
import UserCard from "@/src/components/UserCard";

import { Colors } from "@/src/styles/Colors";
import { useMyProfileStore } from "@/src/stores/useMyProfileStore";

import type { SelectedUser as StorySelectedUser } from "@/src/components/home/StoryList";

type HomeHeaderProps = {
  friends: any[];
  selectedUser: StorySelectedUser | null;
  onSelectStory: (user: StorySelectedUser | null) => void;
};

export const HomeHeader = ({
  friends,
  selectedUser,
  onSelectStory,
}: HomeHeaderProps) => {
  const DEFAULT_MY_IMAGE = require("@/assets/images/dog.png");

  const profile = useMyProfileStore((s) => s.profile);

  const myNickname = profile?.spotNickname ?? "내 닉네임";
  const myUserId = profile?.spotId ?? "";
  const myBio = profile?.oneLine ?? "";
  const myAvatarSource =
    profile?.photo && profile.photo.length > 0
      ? { uri: profile.photo }
      : DEFAULT_MY_IMAGE;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <Image
          source={require("@/assets/images/SPOT.png")}
          style={styles.spotLogo}
        />

        <View style={styles.friendsIconContainer}>
          <TouchableOpacity>
            <Image
              source={require("@/assets/images/friends-icon-black.png")}
              style={styles.friendsIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/searchFriends")}>
            <Image
              source={require("@/assets/images/friends-add-icon-black.png")}
              style={styles.friendsIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <StoryList
        myNickname={myNickname}
        myUserId={myUserId}
        myBio={myBio}
        myAvatarSource={myAvatarSource}
        friends={friends}
        onSelectStory={onSelectStory}
      />

      {selectedUser ? (
        <View style={{ paddingRight: 16, paddingTop: 12 }}>
          <UserCard
            variant="story"
            profileImage={selectedUser.profileImage}
            nickname={selectedUser.nickname}
            userid={
              selectedUser.scope === "friend"
                ? String(selectedUser.userId ?? "")
                : (selectedUser.userIdText ?? "")
            }
            bio={selectedUser.bio ?? ""}
            friendAvatars={[]}
            friendCount={0}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { backgroundColor: Colors.white, paddingLeft: 16 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingRight: 16,
  },
  spotLogo: { width: 63, height: 29 },
  friendsIconContainer: { flexDirection: "row", gap: 16 },
  friendsIcon: { width: 24, height: 24 },
});
