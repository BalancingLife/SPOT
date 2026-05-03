import { Text, TextInput } from "react-native";

const text = Text as unknown as {
  defaultProps?: { allowFontScaling?: boolean };
};

text.defaultProps = text.defaultProps ?? {};
text.defaultProps.allowFontScaling = false;

const textInput = TextInput as unknown as {
  defaultProps?: { allowFontScaling?: boolean };
};

textInput.defaultProps = textInput.defaultProps ?? {};
textInput.defaultProps.allowFontScaling = false;
