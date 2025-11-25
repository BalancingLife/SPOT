import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";
import SpotButton from "@/src/components/SpotButton";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

const NICKNAME_MAX = 15;
const ID_MAX = 15;
const INTRO_MAX = 30;

const VALID_COLOR = "#2EBD5C"; // 초록
const ERROR_COLOR = "#FF5A3C"; // 주황

export default function EditScreen() {
  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState("");
  const [intro, setIntro] = useState("");

  const [focusNickname, setFocusNickname] = useState(false);
  const [focusUserId, setFocusUserId] = useState(false);
  const [focusIntro, setFocusIntro] = useState(false);

  // ---- 닉네임 상태
  const nicknameLen = nickname.length;
  const nicknameStatus =
    nicknameLen === 0
      ? "empty"
      : nicknameLen <= NICKNAME_MAX
      ? "valid"
      : "tooLong";
  const nicknameIsError = nicknameStatus === "tooLong";
  const nicknameHelperColor =
    nicknameStatus === "valid"
      ? VALID_COLOR
      : nicknameStatus === "tooLong"
      ? ERROR_COLOR
      : Colors.gray_400;
  const nicknameHelperText =
    nicknameStatus === "tooLong"
      ? "15자를 초과했어요"
      : "15자 이내로 입력해 주세요";

  // ---- 아이디 상태
  const idLen = userId.length;
  let idStatus:
    | "empty"
    | "valid"
    | "tooShort"
    | "tooLong"
    | "invalidChar"
    | "invalidCombo" = "empty";

  const onlyEngOrNum = /^[a-zA-Z0-9]*$/.test(userId);
  const hasLetter = /[a-zA-Z]/.test(userId);
  const hasNumber = /[0-9]/.test(userId);

  if (idLen === 0) {
    idStatus = "empty";
  } else if (!onlyEngOrNum) {
    idStatus = "invalidChar"; // 특수문자 포함
  } else if (idLen > ID_MAX) {
    idStatus = "tooLong";
  } else if (idLen < 4) {
    idStatus = "tooShort";
  } else if (!hasLetter || !hasNumber) {
    idStatus = "invalidCombo"; // 영문 + 숫자 조합 필수
  } else {
    idStatus = "valid";
  }
  const idIsError =
    idStatus === "invalidChar" ||
    idStatus === "tooLong" ||
    idStatus === "tooShort" ||
    idStatus === "invalidCombo";
  const idHelperColor =
    idStatus === "valid"
      ? VALID_COLOR
      : idIsError
      ? ERROR_COLOR
      : Colors.gray_400;

  const idHelperText =
    idStatus === "invalidChar"
      ? "특수문자 사용은 불가능해요"
      : idStatus === "tooLong"
      ? "15자를 초과했어요"
      : idStatus === "tooShort"
      ? "4자 이상 입력해 주세요"
      : idStatus === "invalidCombo"
      ? "영문과 숫자를 모두 포함해야 해요"
      : "영문자와 숫자 조합으로 4-15자 입력해 주세요";

  // ---- 한 줄 소개 상태
  const introLen = intro.length;
  const introStatus =
    introLen === 0 ? "empty" : introLen <= INTRO_MAX ? "valid" : "tooLong";
  const introIsError = introStatus === "tooLong";
  const introHelperColor =
    introStatus === "valid"
      ? VALID_COLOR
      : introStatus === "tooLong"
      ? ERROR_COLOR
      : Colors.gray_400;
  const introHelperText =
    introStatus === "tooLong"
      ? "30자를 초과했어요"
      : "30자 이내로 입력해 주세요";

  // ---- 확인 버튼 활성 여부 (일단 간단 규칙)
  const isFormValid =
    nicknameStatus === "valid" &&
    idStatus === "valid" &&
    introStatus !== "tooLong";

  return (
    <ProfileLayout>
      <ProfileHeader title="프로필 수정" showBack={true} />

      {/* 내용 영역 */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 프로필 이미지 영역 */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Image
                  style={{ width: 60, height: 60 }}
                  source={require("@/assets/images/profile-icon-gray.png")}
                />
              </View>
              <Pressable style={styles.cameraButton}>
                <Image
                  style={{ width: 24, height: 24 }}
                  source={require("@/assets/images/camera-icon.png")}
                />
              </Pressable>
            </View>
          </View>

          {/* 폼 섹션  */}
          <View style={styles.sectionContainer}>
            {/* 닉네임 */}
            <View
              style={[
                styles.fieldBlock,
                {
                  borderBottomColor: nicknameIsError
                    ? ERROR_COLOR
                    : focusNickname
                    ? Colors.gray_800
                    : Colors.gray_100,
                },
              ]}
            >
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>닉네임</Text>
                <Text
                  style={[
                    styles.counter,
                    nicknameIsError && { color: ERROR_COLOR },
                  ]}
                >
                  {nicknameLen}/{NICKNAME_MAX}
                </Text>
              </View>

              <TextInput
                style={styles.input}
                value={nickname}
                onFocus={() => setFocusNickname(true)}
                onBlur={() => setFocusNickname(false)}
                onChangeText={setNickname}
                placeholder="닉네임을 입력해 주세요"
                placeholderTextColor={Colors.gray_400}
              />
            </View>
            <View style={styles.helperRow}>
              <Text style={[styles.helperIcon, { color: nicknameHelperColor }]}>
                {nicknameIsError ? "✗" : "✓"}
              </Text>
              <Text style={[styles.helperText, { color: nicknameHelperColor }]}>
                {nicknameHelperText}
              </Text>
            </View>

            {/* 아이디 */}
            <View
              style={[
                styles.fieldBlock,
                {
                  borderBottomColor: idIsError
                    ? ERROR_COLOR
                    : focusUserId
                    ? Colors.gray_800
                    : Colors.gray_100,
                },
              ]}
            >
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>아이디</Text>
                <Text
                  style={[styles.counter, idIsError && { color: ERROR_COLOR }]}
                >
                  {idLen}/{ID_MAX}
                </Text>
              </View>

              <View style={styles.idRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={userId}
                  onFocus={() => setFocusUserId(true)}
                  onBlur={() => setFocusUserId(false)}
                  onChangeText={setUserId}
                  placeholder="아이디를 입력해 주세요"
                  placeholderTextColor={Colors.gray_400}
                  autoCapitalize="none"
                />

                <Pressable style={styles.dupButton}>
                  <Text style={styles.dupButtonText}>중복확인</Text>
                  {/* TODO 중복확인 서버 요청 */}
                </Pressable>
              </View>
            </View>
            <View style={styles.helperRow}>
              <Text style={[styles.helperIcon, { color: idHelperColor }]}>
                {idIsError ? "✗" : "✓"}
              </Text>
              <Text style={[styles.helperText, { color: idHelperColor }]}>
                {idHelperText}
              </Text>
            </View>

            {/* 한 줄 소개 */}
            <View
              style={[
                styles.fieldBlock,
                {
                  borderBottomColor: introIsError
                    ? ERROR_COLOR
                    : focusIntro
                    ? Colors.gray_800
                    : Colors.gray_100,
                },
              ]}
            >
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>한 줄 소개</Text>
                <Text
                  style={[
                    styles.counter,
                    introIsError && { color: ERROR_COLOR },
                  ]}
                >
                  {introLen}/{INTRO_MAX}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                value={intro}
                onFocus={() => setFocusIntro(true)}
                onBlur={() => setFocusIntro(false)}
                onChangeText={setIntro}
                placeholder="나를 한 줄로 소개해 보세요"
                placeholderTextColor={Colors.gray_300}
                multiline
              />
            </View>
            <View style={styles.helperRow}>
              <Text style={[styles.helperIcon, { color: introHelperColor }]}>
                {introIsError ? "✗" : "✓"}
              </Text>
              <Text style={[styles.helperText, { color: introHelperColor }]}>
                {introHelperText}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 확인 버튼 */}
        <SpotButton
          label="확인"
          variant={"primary"}
          size="large"
          disabled={!isFormValid}
        />
      </View>
    </ProfileLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 25,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 60,
    backgroundColor: Colors.gray_100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.gray_100,
  },
  avatarText: {
    ...TextStyles.Bold12,
    color: Colors.gray_400,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionContainer: {},

  fieldBlock: {
    paddingVertical: 8,
    marginBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray_100,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    ...TextStyles.SemiBold20,
    color: Colors.gray_800,
  },
  counter: {
    ...TextStyles.Medium14,
    color: Colors.gray_400,
  },
  input: {
    ...TextStyles.Medium16,
    color: Colors.gray_800,
  },

  idRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  dupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#303030",
  },
  dupButtonText: {
    ...TextStyles.Medium12,
    color: Colors.white,
  },

  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  helperIcon: {
    ...TextStyles.Medium12,
    marginRight: 4,
  },
  helperText: {
    ...TextStyles.Medium12,
  },
});
