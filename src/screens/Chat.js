import { View, Text, ActivityIndicator } from "react-native";
import ChatHeader from "../components/ChatHeader";
import ChatList from "../components/ChatList";
import { useEffect, useState } from "react";
import { getDocs, query, where } from 'firebase/firestore';
import { usersRef } from "../configs/firebaseConfig";
import useAuth from "../hooks/useAuth";

const Chat = () => {
    const { logout, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            getUsers();
        }
    }, [user?.uid]);

    const getUsers = async () => {
        try {
            const q = query(usersRef, where('uid', '!=', user.uid));
            const querySnapshot = await getDocs(q);
            let data = [];
            querySnapshot.forEach(doc => {
                data.push({ ...doc.data() });
            });
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users: ", error);
            setLoading(false);
        }
    }

    return (
        <View style={styles.screen}>
            <ChatHeader  />
            {
                loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    users.length > 0 ? (
                        <ChatList users={users} />
                    ) : (
                        <Text>No users found</Text>
                    )
                )
            }
        </View>
    );
}
const styles = {
    screen: {
        flex: 1,
        backgroundColor: '#fff',
    },
};

export default Chat;
