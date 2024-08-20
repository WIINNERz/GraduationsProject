import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../configs/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch additional user details from Firestore
        setUser(user);

        try {
          const userDocRef = doc(firestore, 'Users', user.uid); // Assume 'Users' is the collection
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserDetails(userDoc.data()); // Set user details from Firestore
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user details from Firestore:", error);
        }
      } else {
        // No user is signed in
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to authenticate user:", error);
      setLoading(false);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  const authState = useMemo(() => ({ user, userDetails, loading }), [user, userDetails, loading]);

  return authState;
};

export default useAuth;
