import { View, Text, ActivityIndicator } from "react-native";
import ChatHeader from "../components/ChatHeader";
import ChatList from "../components/ChatList";
import { useEffect, useState } from "react";
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { db } from "../configs/firebaseConfig";
import useAuth from "../hooks/useAuth";

const Chat = () => {
    const { user } = useAuth();
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (user?.uid) {
            fetchChatRooms();
        }
    }, [user?.uid]);

    const fetchChatRooms = async () => {
        try {
            const roomsRef = collection(db, 'Rooms');
            const querySnapshot = await getDocs(roomsRef);
            let rooms = [];
            let userIds = new Set();

            querySnapshot.forEach(doc => {
                const roomData = { id: doc.id, ...doc.data() };
                const { roomId } = roomData;
                const [userId1, userId2] = roomId.split('_');

                if (userId1 === user.uid || userId2 === user.uid) {
                    rooms.push(roomData);
                    userIds.add(userId1 === user.uid ? userId2 : userId1);
                }
            });

            console.log("Fetched chat rooms:", rooms);
            console.log("User IDs to fetch:", Array.from(userIds));

            if (userIds.size > 0) {
                const usersData = [];
                for (const uid of userIds) {
                    const userDocRef = doc(db, 'Users', uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        usersData.push(userDoc.data());
                    } else {
                        console.log(`User with UID ${uid} does not exist.`);
                    }
                }
                console.log("Fetched users:", usersData);
                setUsers(usersData);
            } else {
                console.log("No additional users found.");
            }

            setChatRooms(rooms);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching chat rooms: ", error);
            setLoading(false);
        }
    }

    return (
        <View style={styles.screen}>
            <ChatHeader />
            {
                loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    chatRooms.length > 0 ? (
                        <ChatList
                            rooms={chatRooms}
                            users={users}
                            currentUserId={user.uid} 
                        />
                    ) : (
                        <View style={styles.nochat}>
                            <Text>No chats found.</Text>
                        </View>
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
    nochat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
};

export default Chat;