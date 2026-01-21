import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import {
  requestFollow,
  acceptFollow,
  declineFollow,
  blockFriend,
  unblockFriend,
  deleteFriend,
  reportFriend,
} from "@/src/lib/api/friends";

type ResultState =
  | { ok: true; title: string; data: any }
  | { ok: false; title: string; data: any }
  | null;

export default function FriendsApiTestScreen() {
  const [friendIdText, setFriendIdText] = React.useState("");
  const [reason, setReason] = React.useState("spam");
  const [loadingKey, setLoadingKey] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ResultState>(null);

  const friendId = Number(friendIdText);

  const canUseFriendId = Number.isFinite(friendId) && friendId > 0;

  const run = async (key: string, fn: () => Promise<any>) => {
    if (!canUseFriendId && key !== "noop") {
      setResult({
        ok: false,
        title: "입력 에러",
        data: { message: "friendId를 숫자로 입력해" },
      });
      return;
    }

    try {
      setLoadingKey(key);
      const data = await fn();

      // deleteFriend는 boolean이라 ok 판정 다르게
      const ok =
        typeof data === "boolean"
          ? data === true
          : data !== null && data !== undefined;

      setResult({
        ok,
        title: key,
        data,
      });
    } catch (e: any) {
      setResult({
        ok: false,
        title: key,
        data: { message: e?.message ?? "unknown error" },
      });
    } finally {
      setLoadingKey(null);
    }
  };

  const Btn = ({
    label,
    actionKey,
    onPress,
    danger,
  }: {
    label: string;
    actionKey: string;
    onPress: () => void;
    danger?: boolean;
  }) => {
    const isLoading = loadingKey === actionKey;

    return (
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={[
          styles.btn,
          danger ? styles.btnDanger : styles.btnPrimary,
          isLoading && styles.btnDisabled,
        ]}
      >
        <Text style={styles.btnText}>{isLoading ? "요청중..." : label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[TextStyles.Bold16, styles.title]}>Friends API Test</Text>

        <View style={styles.card}>
          <Text style={TextStyles.Medium14}>friendId</Text>
          <TextInput
            value={friendIdText}
            onChangeText={setFriendIdText}
            placeholder="예: 12"
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={Colors.gray_400 ?? "#999"}
          />

          <Text style={[TextStyles.Medium14, { marginTop: 12 }]}>
            report reason
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="예: spam / abuse ..."
            style={styles.input}
            placeholderTextColor={Colors.gray_400 ?? "#999"}
          />

          <Text style={[TextStyles.Medium12, styles.hint]}>
            * accept/decline의 friendId는 “요청 보낸 사람 ID” 넣는 거다.
          </Text>
        </View>

        <View style={styles.grid}>
          <Btn
            label="POST follow"
            actionKey="follow"
            onPress={() => run("follow", () => requestFollow(friendId))}
          />
          <Btn
            label="POST accept_follow"
            actionKey="accept"
            onPress={() => run("accept", () => acceptFollow(friendId))}
          />
          <Btn
            label="POST decline_follow"
            actionKey="decline"
            onPress={() => run("decline", () => declineFollow(friendId))}
          />
          <Btn
            label="POST block"
            actionKey="block"
            onPress={() => run("block", () => blockFriend(friendId))}
            danger
          />
          <Btn
            label="POST unblock"
            actionKey="unblock"
            onPress={() => run("unblock", () => unblockFriend(friendId))}
          />
          <Btn
            label="DELETE friend"
            actionKey="delete"
            onPress={() => run("delete", () => deleteFriend(friendId))}
            danger
          />
          <Btn
            label="POST report"
            actionKey="report"
            onPress={() =>
              run("report", () => reportFriend(friendId, { reason }))
            }
            danger
          />
        </View>

        <View style={styles.card}>
          <View style={styles.resultHeader}>
            <Text style={TextStyles.Bold16}>Result</Text>
            {result ? (
              <View
                style={[
                  styles.badge,
                  result.ok ? styles.badgeOk : styles.badgeFail,
                ]}
              >
                <Text style={styles.badgeText}>
                  {result.ok ? "OK" : "FAIL"}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[
              TextStyles.Medium12,
              { marginBottom: 8, color: Colors.gray_600 ?? "#666" },
            ]}
          >
            {result ? `action: ${result.title}` : "아직 실행 안함"}
          </Text>

          <Text style={styles.mono}>
            {result
              ? JSON.stringify(result.data, null, 2)
              : "여기에 응답이 뜬다"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white ?? "#fff" },
  container: { padding: 16, gap: 12 },
  title: { marginBottom: 4 },
  card: {
    borderWidth: 1,
    borderColor: Colors.gray_200 ?? "#e5e5e5",
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.white ?? "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray_200 ?? "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: Colors.black ?? "#111",
  },
  hint: {
    marginTop: 10,
    color: Colors.gray_600 ?? "#666",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  btn: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: Colors.primary_500 ?? "#2EBD5C" },
  btnDanger: { backgroundColor: Colors.primary_400 ?? "#FF5A3C" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700" },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeOk: { backgroundColor: "#2EBD5C" },
  badgeFail: { backgroundColor: "#FF5A3C" },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  mono: {
    fontFamily: "Menlo",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.black ?? "#111",
  },
});
