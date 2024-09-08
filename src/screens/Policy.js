import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AccountInfo = () => {
    const navigate = useNavigation();
  
    return (
        <View style={styles.container}>
        <MaterialCommunityIcons
          style={styles.back}
          name="arrow-left"
          size={35}
          color="#D27C2C"
          onPress={() => navigate.goBack()}
        />
            <Text>What is that , Nah We don't have and We don't care</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    back: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 100,
        zIndex: 1,
      },
});

export default AccountInfo;
