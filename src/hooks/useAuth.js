import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../configs/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDocExists, setUserDocExists] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        try {
          const userDocRef = doc(firestore, 'Users', user.uid); 
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserDetails(userDoc.data()); 
            setUserDocExists(true);
          } else {
            console.log("No such document!");
            setUserDocExists(false);
          }
        } catch (error) {
          console.error("Error fetching user details from Firestore:", error);
          setUserDocExists(false);
        }
      } else {
        setUser(null);
        setUserDetails(null);
        setUserDocExists(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to authenticate user:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const authState = useMemo(() => ({ user, userDetails, loading, userDocExists }), [user, userDetails, loading, userDocExists]);

  return authState;
};

export default useAuth;