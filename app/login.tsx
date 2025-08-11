import * as WebBrowser from "expo-web-browser";
import { Image, StyleSheet, View, Text, Pressable } from "react-native";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY!;
const KAKAO_REDIRECT_URI = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI!;

const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(
  KAKAO_REDIRECT_URI
)}`;

export default function Login() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          더 똑똑하게{"\n"}친구들과 장소를 공유해봐요.
        </Text>
        <View style={styles.imageContainer}>
          <Image
            style={styles.loginImage}
            source={require("@/assets/images/loginImage.png")}
          />
        </View>
        <View style={styles.loginButtonContainer}>
          <Pressable
            style={styles.kakaoLoginButton}
            onPress={() => WebBrowser.openBrowserAsync(authUrl)}
          >
            <View pointerEvents="none">
              <Image
                style={styles.signUpImage}
                source={require("@/assets/images/login-3second.png")}
              ></Image>
            </View>
            <Image
              style={styles.kakaoIcon}
              source={require("@/assets/images/kakao-icon.png")}
            ></Image>
            <Text style={styles.kakaoLoginButtonText}>카카오로 계속하기</Text>
          </Pressable>
          <Pressable style={styles.appleLoginButton}>
            <Image
              style={styles.appleIcon}
              source={require("@/assets/images/apple-icon.png")}
            ></Image>
            <Text style={styles.appleLoginButtonText}>Apple로 계속하기</Text>
          </Pressable>
          <Pressable style={styles.googleLoginButton}>
            <Image
              style={styles.googleIcon}
              source={require("@/assets/images/google-icon.png")}
            ></Image>
            <Text style={styles.googleLoginButtonText}>Google로 계속하기</Text>
          </Pressable>
        </View>
        <View style={styles.termsNoticeTextContainer}>
          <Text style={styles.termsNoticeText}>
            진행 시 <Text style={styles.termsNoticeLink}>약관</Text> 및{" "}
            <Text style={styles.termsNoticeLink}>개인정보 보호정책</Text>에
            동의합니다
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 137,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  headerContainer: {},
  headerText: {
    ...TextStyles.Bold24,
    color: Colors.gray_900,
    marginBottom: 32,
  },
  imageContainer: {
    alignItems: "center",
  },
  loginImage: {
    width: 400,
    height: 339,
  },
  loginButtonContainer: { alignItems: "center", gap: 12, bottom: 20 },
  kakaoLoginButton: {
    backgroundColor: "#FFE500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    borderRadius: 10,
  },
  signUpImage: {
    position: "absolute",
    right: -20,
    bottom: 23,
    width: 135,
    height: 50.6,
  },
  kakaoIcon: { width: 18, height: 18, marginRight: 6 },
  kakaoLoginButtonText: { ...TextStyles.SemiBold14 },
  appleLoginButton: {
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    borderRadius: 10,
  },
  appleIcon: { width: 14.61, height: 18, marginRight: 6 },
  appleLoginButtonText: { ...TextStyles.SemiBold14, color: "white" },
  googleLoginButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  googleIcon: { width: 18, height: 18, marginRight: 6 },
  googleLoginButtonText: { ...TextStyles.SemiBold14 },
  termsNoticeTextContainer: {
    alignItems: "center",
  },
  termsNoticeText: {
    ...TextStyles.Regular12,
    color: Colors.gray_300,
  },
  termsNoticeLink: {
    ...TextStyles.Bold12,
    textDecorationLine: "underline",
  },
});
