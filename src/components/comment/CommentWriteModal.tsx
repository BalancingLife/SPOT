// src/components/comment/CommentWriteModal.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  View,
  Pressable,
  TextInput,
  Keyboard,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import { TextStyles } from "../../styles/TextStyles";
import { Colors } from "../../styles/Colors";
import RatingModal from "./RatingModal";
import CommentActionBar from "./CommentActionBar";

export type CommentWriteModalRef = {
  open: () => void;
  close: () => void;
};

const CommentWriteModal = forwardRef<CommentWriteModalRef>((props, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);
  const textRef = useRef("");

  // 서버로 보낼 값(일단 하단바에 필요한 것만)
  const [visibility, setVisibility] = useState<"PUBLIC" | "FRIENDS">("PUBLIC");
  const [rating, setRating] = useState<number | null>(null);

  // 렌더 최소화: length만 state로
  const [length, setLength] = useState(0);

  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const onChangeText = useCallback((v: string) => {
    textRef.current = v;
    setLength(v.length);
  }, []);

  const snapPoints = useMemo(() => ["40%", "85%"], []);

  const handleAnimate = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex === 1) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 60);
      });
    }
    if (fromIndex === 1 && (toIndex === 0 || toIndex === -1)) {
      Keyboard.dismiss();
    }
  }, []);

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handleSubmit = () => {
    const trimmed = textRef.current.trim();
    if (!trimmed) return;

    const payload = {
      content: trimmed,
      rating, // 1~5 or null
      // visibility는 나중에 붙이면 됨
    };

    console.log("submit comment payload:", payload);

    textRef.current = "";
    setLength(0);
    bottomSheetRef.current?.dismiss();
  };

  const isSubmitDisabled = textRef.current.trim().length === 0;
  const visibilityLabel = visibility === "PUBLIC" ? "전체공개" : "친구만";
  const visibilityIcon =
    visibility === "PUBLIC"
      ? require("@/assets/images/earth-logo.png")
      : require("@/assets/images/friends-icon-orange.png");

  const onPressVisibility = () => {
    // TODO: 여기서 팝오버/모달 열기
    // 임시: 토글로 동작 확인
    setVisibility((prev) => (prev === "PUBLIC" ? "FRIENDS" : "PUBLIC"));
  };

  const onPressRating = () => {
    setIsRatingOpen(true);
  };

  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  useImperativeHandle(ref, () => ({
    open: () => {
      bottomSheetRef.current?.present();
    },
    close: () => bottomSheetRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      index={1}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ borderRadius: 24 }}
      onAnimate={handleAnimate}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dummyText}>더미</Text>
          </View>

          <Text style={styles.headerTitle}>나의 코멘트</Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={styles.headerCancel}>취소</Text>
          </Pressable>
        </View>

        {/* 프로필 영역 */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>C</Text>
          </View>
          <Text style={styles.nickname}>CoolDog</Text>

          <Pressable style={styles.photoButton} hitSlop={8}>
            <Image
              source={require("@/assets/images/image-add.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
        </View>

        {/* 입력 영역 */}
        <View style={styles.inputArea}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="방문하신 곳은 어떠셨나요?"
            placeholderTextColor={Colors.gray_300}
            multiline
            defaultValue=""
            onChangeText={onChangeText}
            maxLength={200}
          />
        </View>

        {/* 하단 바 (컴포넌트화) */}
        <CommentActionBar
          visibilityLabel={visibilityLabel}
          visibilityIcon={visibilityIcon}
          onPressVisibility={onPressVisibility}
          ratingLabel={rating == null ? "별점" : `별점 ${rating}`}
          onPressRating={onPressRating}
          length={length}
          maxLength={200}
          submitDisabled={isSubmitDisabled}
          onSubmit={handleSubmit}
        />

        <RatingModal
          visible={isRatingOpen}
          value={rating}
          onClose={() => setIsRatingOpen(false)}
          onSelect={(r) => setRating(r)}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CommentWriteModal.displayName = "CommentWriteModal";
export default CommentWriteModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  dummyText: {
    opacity: 0,
  },
  headerTitle: {
    ...TextStyles.Medium16,
    color: Colors.gray_300,
  },
  headerCancel: {
    ...TextStyles.Medium16,
    color: Colors.gray_300,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: "600",
  },
  nickname: {
    ...TextStyles.Bold16,
    color: Colors.gray_800,
  },
  inputArea: {
    flex: 1,
    marginTop: 4,
    minHeight: 230,
  },
  textInput: {
    ...TextStyles.Regular14,
    flex: 1,
    paddingTop: 8,
    paddingRight: 40,
    paddingBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  photoButton: {
    position: "absolute",
    right: 0,
    width: 24,
    height: 24,
  },
});
