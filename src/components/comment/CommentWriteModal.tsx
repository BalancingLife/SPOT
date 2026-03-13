// src/components/comment/CommentWriteModal.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
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
import { createComment } from "@/src/lib/api/comment";
import { useMyProfileStore } from "@/src/stores/useMyProfileStore";

export type CommentWriteModalRef = {
  open: () => void;
  close: () => void;
};

const CommentWriteModal = forwardRef<CommentWriteModalRef>((props, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);

  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "friend">("public");
  const [rating, setRating] = useState<number | null>(null);
  const [length, setLength] = useState(0);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const profile = useMyProfileStore((s) => s.profile);
  const fetchMyProfile = useMyProfileStore((s) => s.fetchMyProfile);

  useEffect(() => {
    if (profile) return;
    fetchMyProfile();
  }, [profile, fetchMyProfile]);

  const nickname = profile?.spotNickname ?? "닉네임 없음";
  const profilePhoto = profile?.photo ?? null;
  const initial = nickname.trim().charAt(0).toUpperCase() || "?";

  const onChangeText = useCallback((value: string) => {
    setText(value);
    setLength(value.length);
  }, []);

  const resetForm = useCallback(() => {
    setText("");
    setLength(0);
    setRating(null);
    setVisibility("public");
    setIsRatingOpen(false);
    setIsSubmitting(false);
    Keyboard.dismiss();
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

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const placeId = 1; // TODO: 실제 place_id로 교체

      const payload = {
        place_id: placeId,
        content: trimmed,
        visibility,
        ...(rating != null ? { rating } : {}),
      };

      const data = await createComment(payload);

      console.log("createComment success:", data);

      bottomSheetRef.current?.dismiss();
    } catch (e: any) {
      console.log("createComment error:", e?.response?.data ?? e?.message ?? e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = text.trim().length === 0 || isSubmitting;
  const visibilityLabel = visibility === "public" ? "전체공개" : "친구만";
  const visibilityIcon =
    visibility === "public"
      ? require("@/assets/images/earth-logo.png")
      : require("@/assets/images/friends-icon-orange.png");

  const onPressVisibility = () => {
    setVisibility((prev) => (prev === "public" ? "friend" : "public"));
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
      onDismiss={resetForm}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dummyText}>더미</Text>
          </View>

          <Text style={styles.headerTitle}>나의 코멘트</Text>

          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={styles.headerCancel}>취소</Text>
          </Pressable>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarInitial}>{initial}</Text>
            )}
          </View>

          <Text style={styles.nickname}>{nickname}</Text>

          <Pressable style={styles.photoButton} hitSlop={8}>
            <Image
              source={require("@/assets/images/image-add.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
        </View>

        <View style={styles.inputArea}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="방문하신 곳은 어떠셨나요?"
            placeholderTextColor={Colors.gray_300}
            multiline
            value={text}
            onChangeText={onChangeText}
            maxLength={200}
          />
        </View>

        <CommentActionBar
          visibilityLabel={visibilityLabel}
          visibilityIcon={visibilityIcon}
          onPressVisibility={onPressVisibility}
          ratingLabel={rating == null ? "별점" : `${rating}`}
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
    overflow: "hidden",
  },
  avatarImage: {
    width: 32,
    height: 32,
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
