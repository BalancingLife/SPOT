import { Tabs, Redirect, usePathname } from "expo-router";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Pressable, Image, Text } from "react-native";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
import { useAuthStore } from "@/src/stores/useAuthStore";

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
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const pathname = usePathname();

  const createTabBarIcon = (
    focused: boolean,
    iconSource: any,
    label: string,
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
            TextStyles.Regular12,
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

  // hydrate 끝나기 전에는 아무것도 렌더하지 않음
  if (!hasHydrated) return null;

  // 로그인 안 되어 있으면 login으로 보냄
  // returnTo에 현재 목적 경로를 실어 보냄
  if (!token) {
    return (
      <Redirect
        href={{
          pathname: "/login",
          params: {
            returnTo: pathname || "/",
          },
        }}
      />
    );
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 11,
          height: 86,
        },
        headerShown: false,
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) =>
            createTabBarIcon(
              focused,
              focused
                ? require("@/assets/images/spot-icon-black.png")
                : require("@/assets/images/spot-icon-gray.png"),
              "홈",
            ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "지도",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) =>
            createTabBarIcon(
              focused,
              focused
                ? require("@/assets/images/marker-gray.png")
                : require("@/assets/images/marker-gray.png"),
              "지도",
            ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) =>
            createTabBarIcon(
              focused,
              focused
                ? require("@/assets/images/profile-icon-orange.png")
                : require("@/assets/images/default-profile.png"),
              "프로필",
            ),
        }}
      />
    </Tabs>
  );
}
