import { useRouter, Tabs } from "expo-router";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Pressable, Image, Text } from "react-native";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

const CustomTabBarButton = ({
  children,
  onPress,
  style,
  ...restProps
}: BottomTabBarButtonProps) => {
  return (
    <Pressable
      {...restProps}
      ref={undefined}
      onPress={onPress}
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
};

export default function TabLayout() {
  const router = useRouter();

  const createTabBarIcon = (
    focused: boolean,
    iconSource: any,
    label: string
  ) => {
    const marginTop = label === "프로필" ? 11 : 0;

    return (
      <>
        <Image
          source={iconSource}
          style={{ width: 24, height: 24, marginBottom: 3, marginTop }}
        />
        <Text
          style={[
            TextStyles.Regular12, // 기존 텍스트 스타일
            {
              color: focused ? Colors.gray_900 : Colors.gray_300,
            },
          ]}
        >
          {label}
        </Text>
      </>
    );
  };

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 11,
          height: 86, // 기본 높이보다 높게 조절 가능
        },

        headerShown: false,
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarLabel: () => null, // 기본 라벨 숨김
          tabBarIcon: ({ focused }) =>
            createTabBarIcon(
              focused,
              focused
                ? require("@/assets/images/spot-icon-orange.png")
                : require("@/assets/images/spot-icon-gray.png"),
              "홈"
            ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "친구",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) =>
            createTabBarIcon(
              focused,
              focused
                ? require("@/assets/images/friends-icon-orange.png")
                : require("@/assets/images/friends-icon-gray.png"),
              "친구"
            ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: "여정",
          tabBarLabel: () => null, // 기본 라벨 숨김
          tabBarIcon: ({ focused }) =>
            createTabBarIcon(
              focused,
              focused
                ? require("@/assets/images/journey-icon-orange.png")
                : require("@/assets/images/journey-icon-gray.png"),
              "여정"
            ),
        }}
      />
      <Tabs.Screen
        name="[username]"
        options={{
          title: "프로필",
          tabBarLabel: () => null, // 기본 라벨 숨김
          tabBarIcon: ({ focused }) =>
            createTabBarIcon(
              focused,
              focused
                ? require("@/assets/images/profile-icon-orange.png")
                : require("@/assets/images/profile-icon-gray.png"),
              "프로필"
            ),
        }}
      />
    </Tabs>
  );
}
