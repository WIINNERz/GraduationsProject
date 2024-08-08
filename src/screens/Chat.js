import { View, Text, ActivityIndicator } from "react-native";
import HomeHeader from "../components/HomeHeader";
import ChatList from "../components/ChatList";
import { useEffect, useState } from "react";
import { getDocs, query, where,doc } from 'firebase/firestore';
import { usersRef } from "../configs/firebaseConfig";
import useAuth from "../hooks/useAuth";

const Chat = () => {
    const {logout, user} = useAuth();
    const [ users, setUsers ] = useState([]);
    useEffect(() => {
        if(user?.uid)
            getUsers();
    }, []);
    const getUsers = async () => {
        const q = query(usersRef,where('uid','!=',user.uid));

        const querySnapshot = await getDocs(q);
        let data = [];
        querySnapshot.forEach(doc=> {
            data.push({...doc.data()});
        });
        setUsers(data);
        console.log(data);
    }
    return (
        <View>
            <HomeHeader />
            {
                users.length > 0 ? (
                    <ChatList users={users} />
                ) : (
                    <ActivityIndicator size="large" color="#0000ff" />
                )
            
            }
        </View>
    );
}
export default Chat;
