import { useRouter, Tabs } from "expo-router";
import { type BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Pressable, Image } from "react-native";

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
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
};

export default function TabLayout() {
  const router = useRouter();

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "홈",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("@/assets/images/spot-logo.png")}
                style={{ width: 25, height: 25, opacity: focused ? 1 : 0.6 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: "친구",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("@/assets/images/spot-logo.png")}
                style={{ width: 25, height: 25, opacity: focused ? 1 : 0.6 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="journey"
          options={{
            title: "여정",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("@/assets/images/spot-logo.png")}
                style={{ width: 25, height: 25, opacity: focused ? 1 : 0.6 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="[username]"
          options={{
            title: "프로필",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("@/assets/images/spot-logo.png")}
                style={{ width: 25, height: 25, opacity: focused ? 1 : 0.6 }}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
