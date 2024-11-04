import { View, Text, ActivityIndicator  } from "react-native";
import ChatHeader from "../components/ChatHeader";
import ChatList from "../components/ChatList";
import { useEffect, useState, useCallback } from "react";
import { getDocs, collection, doc, getDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from "../configs/firebaseConfig";
import useAuth from "../hooks/useAuth";

const Chat = () => {
    const { user } = useAuth();
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = fetchChatRooms();
            return () => unsubscribe && unsubscribe();
        }
    }, [user?.uid]);

    const fetchChatRooms = useCallback(() => {
        if (!user) return;
        const roomsRef = collection(db, 'Rooms');
        const unsubscribe = onSnapshot(roomsRef, async (querySnapshot) => {
            let rooms = [];
            let userIds = new Set();

            const roomPromises = querySnapshot.docs.map(async (doc) => {
                const roomData = { id: doc.id, ...doc.data() };
                const { roomId } = roomData;
                const [userId1, userId2] = roomId.split('_');

                if (userId1 === user.uid || userId2 === user.uid) {
                    const messagesRef = collection(db, 'Rooms', doc.id, 'Messages');
                    const latestMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
                    const latestMessageSnapshot = await getDocs(latestMessageQuery);
                    const latestMessageDoc = latestMessageSnapshot.docs[0];
                    const latestMessage = latestMessageDoc ? { id: latestMessageDoc.id, ...latestMessageDoc.data() } : null;

                    rooms.push({ ...roomData, latestMessage });
                    userIds.add(userId1 === user.uid ? userId2 : userId1);
                }
            });

            await Promise.all(roomPromises);

            if (userIds.size > 0) {
                const usersData = await Promise.all([...userIds].map(async (uid) => {
                    const userDocRef = doc(db, 'Users', uid);
                    const userDoc = await getDoc(userDocRef);
                    return userDoc.exists() ? userDoc.data() : null;
                }));

                setUsers(usersData.filter(Boolean));
            } 
            setChatRooms(rooms);
            setLoading(false);
        });

        return unsubscribe;
    }, [user?.uid]);
 
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
                            currentUserId={user?.uid} 
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