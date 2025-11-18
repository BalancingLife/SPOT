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

import { TextStyles } from "../styles/TextStyles";
import { Colors } from "../styles/Colors";

export type CommentWriteModalRef = {
  open: () => void;
  close: () => void;
};

const CommentWriteModal = forwardRef<CommentWriteModalRef>((props, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");

  // snap points (바텀시트 높이)
  const snapPoints = useMemo(() => ["40%", "85%"], []);

  // 시트 열렸을 때 TextsInput에 자동 포커스, 키보드 자동 오픈
  const handleAnimate = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex === 1) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 60); // 기기/감성에 맞춰 0~120 사이에서 튜닝
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
    const trimmed = text.trim();
    if (!trimmed) return;

    // TODO: API 호출 or 상위 콜백으로 전달
    console.log("submit comment:", trimmed);

    setText("");
    bottomSheetRef.current?.dismiss();
  };

  const length = text.length;
  const isSubmitDisabled = text.trim().length === 0;

  // 바깥(어두운 영역) 탭 시 닫히는 백드롭
  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0} // index 0에서 보이기 시작
        disappearsOnIndex={-1} // 닫힐 때 사라짐
        pressBehavior="close" // 배경 탭 → close
      />
    ),
    []
  );

  // 부모에서 .open(), .close()로 제어할 수 있게 expose
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
      enableDynamicSizing={false} // 콘텐츠 사이즈 만큼 동적 사이징 금지
      index={1}
      enablePanDownToClose // 아래로 스와이프 시 닫힘
      backdropComponent={renderBackdrop} // 밖 탭 시 닫힘
      backgroundStyle={{ borderRadius: 24 }}
      onAnimate={handleAnimate}
    >
      <BottomSheetView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.headerRow}>
          {/* 나의 코멘트 가운데 정렬을 위한 더미 View */}
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

          {/* 사진 추가 버튼 */}
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
            value={text}
            onChangeText={setText}
            maxLength={200}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={false}
          />
        </View>

        {/* 하단 바 */}
        <View style={styles.bottomRow}>
          <Pressable style={styles.leftChip}>
            <Image
              source={require("@/assets/images/earth-logo.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.leftChipText}>전체공개</Text>
          </Pressable>

          <Pressable style={styles.leftChip}>
            <Image
              source={require("@/assets/images/star-orange.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.leftChipText}>별점</Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <Text style={styles.lengthText}>
            {length}
            <Text style={styles.lengthMaxText}> / 200</Text>
          </Text>

          <Pressable
            style={[
              styles.submitButton,
              isSubmitDisabled && styles.submitButtonDisabled,
            ]}
            disabled={isSubmitDisabled}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>게시</Text>
          </Pressable>
        </View>
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
    paddingRight: 40, // 우측 사진 버튼 공간
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
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },
  leftChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  leftChipText: {
    ...TextStyles.Medium14,
    color: Colors.gray_800,
  },
  lengthText: {
    ...TextStyles.Bold12,
    paddingRight: 17,
  },
  lengthMaxText: {
    ...TextStyles.Regular12,
    color: Colors.gray_300,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#FF6A00",
  },
  submitButtonDisabled: {
    backgroundColor: "#D3D3D3",
  },
  submitButtonText: {
    ...TextStyles.Medium14,
    color: Colors.white,
  },
});
