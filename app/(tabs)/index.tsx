import {
  View,
  Image,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

export default function Home() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* 좌측 로고, 우측 친구 아이콘 */}
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

            <TouchableOpacity>
              <Image
                source={require("@/assets/images/friends-add-icon-black.png")}
                style={styles.friendsIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 스토리 (친구 / 나의닉네임 / 닉네임예시...) */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.black },
  headerContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  topBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  spotLogo: { width: 63, height: 29 },
  friendsIconContainer: {
    flexDirection: "row",
    gap: 16,
  },
  friendsIcon: { width: 24, height: 24 },
});
