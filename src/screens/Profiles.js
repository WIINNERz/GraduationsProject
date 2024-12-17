import React, {useEffect, useState} from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import {auth, firestore, storage} from '../configs/firebaseConfig'
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {doc, updateDoc, onSnapshot} from 'firebase/firestore'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {launchImageLibrary, launchCamera} from 'react-native-image-picker'
import Keymanagement from '../components/Keymanagement'
import E2EE from '../components/E2EE'
import FullScreenModal from '../components/FullScreenModal'

const Profiles = () => {
  const navigation = useNavigation()
  const [userData, setUserData] = useState(null)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [loading, setLoading] = useState(true)
  const [image, setImage] = useState(null)
  const [modalVisible, setModalVisible] = useState(false) // State for modal visibility
  const [uploading, setUploading] = useState(false)
  const user = auth.currentUser
  const KeymanagementInstance = Keymanagement()
  const E2EEInstance = E2EE()

  useEffect(() => {
    if (!user) return
    const userDoc = doc(firestore, 'Users', user.uid)
    const unsubscribe = onSnapshot(
      userDoc,
      async docSnap => {
        if (docSnap.exists() && docSnap.data().email === user.email) {
          setUserData(docSnap.data())
          const encfn = docSnap.data().firstname
          const encln = docSnap.data().lastname

          try {
            const decryptedFirstname = encfn
              ? await KeymanagementInstance.decryptviaapi(encfn)
              : ''
            const decryptedLastname = encln
              ? await KeymanagementInstance.decryptviaapi(encln)
              : ''
            setFirstname(decryptedFirstname ?? '')
            setLastname(decryptedLastname ?? '')
          } catch (error) {
            console.error('Error decrypting user data:', error)
            setFirstname('')
            setLastname('')
          }
        }
        setLoading(false)
      },
      error => {
        console.error('Error fetching user data:', error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.navigate('SignIn')
      })
      .catch(error => {
        console.error('Error signing out:', error)
      })
    KeymanagementInstance.clearKey()
    E2EEInstance.clearSecretKey()
  }

  const pickImage = () => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          openCamera()
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          openImageLibrary()
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ])
  }

  const openImageLibrary = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 1})

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      uploadImage(result.assets[0].uri)
    }
  }

  const openCamera = async () => {
    const result = await launchCamera({mediaType: 'photo', quality: 1})

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      uploadImage(result.assets[0].uri)
    }
  }

  const uploadImage = async uri => {
    if (!uri) return

    setUploading(true)

    try {
      const storageRef = ref(storage, `images/${user.uid}/${Date.now()}`)
      const response = await fetch(uri)
      const blob = await response.blob()

      const snapshot = await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(snapshot.ref)

      const userDoc = doc(firestore, 'Users', user.uid)
      await updateDoc(userDoc, {photoURL: downloadURL})

      setUserData(prevState => ({
        ...prevState,
        photoURL: downloadURL,
      }))

      Alert.alert('Success', 'Profile photo updated successfully.')
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.')
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#0000ff' />
      </View>
    )
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>No user data found or email mismatch.</Text>
        <Button title='Sign Out' onPress={handleSignOut} />
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.Content}>
          <View style={{paddingRight: 30}}>
            {userData.photoURL ? (
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={{uri: userData.photoURL}} style={styles.image} />
              </TouchableOpacity>
            ) : (
              <MaterialCommunityIcons name='account' size={50} color='gray' />
            )}
          </View>
          <View style={styles.myaccount}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.name}>{firstname}</Text>
              <Text> </Text>
              <Text style={styles.name}>{lastname}</Text>
            </View>
            <Text style={styles.username}>@{userData.username}</Text>
            {userData.verify ? (
              <TouchableOpacity onPress={() => navigation.navigate('Verify')}>
                <View style={styles.verified}>
                  <Text style={styles.verify}>Verified</Text>
                  <MaterialCommunityIcons
                    name='account-circle'
                    size={20}
                    color='#D27C2C'
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.verified}>
                <Text style={styles.notiverify}>Not Verified</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.menupanel}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileDetail')}>
            <View style={styles.panel}>
              <View style={styles.menucontainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name='account'
                    size={30}
                    color='#D27C2C'
                  />
                </View>
                <View style={styles.menuname}>
                  <Text style={styles.topic}>My Account</Text>
                  <Text style={styles.menudes}>
                    Make changes to your account
                  </Text>
                </View>
              </View>

              <View style={styles.rightContent}>
                <MaterialCommunityIcons
                  name='chevron-right'
                  size={30}
                  color='gray'
                />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MyPet')}>
            <View style={styles.panel}>
              <View style={styles.menucontainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name='paw'
                    size={30}
                    color='#D27C2C'
                  />
                </View>
                <View style={styles.menuname}>
                  <Text style={styles.topic}>My Pet</Text>
                  <Text style={styles.menudes}>View your own pets</Text>
                </View>
              </View>

              <View style={styles.rightContent}>
                <MaterialCommunityIcons
                  name='chevron-right'
                  size={30}
                  color='gray'
                />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <View style={styles.panel}>
              <View style={styles.menucontainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name='cog'
                    size={30}
                    color='#D27C2C'
                  />
                </View>

                <View style={styles.menuname}>
                  <Text style={styles.topic}>Setting</Text>
                  <Text style={styles.menudes}>
                    Further secure your account for safety
                  </Text>
                </View>
              </View>

              <View style={styles.rightContent}>
                <MaterialCommunityIcons
                  name='chevron-right'
                  size={30}
                  color='gray'
                />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Policy')}>
            <View style={styles.panel}>
              <View style={styles.menucontainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name='shield-lock'
                    size={30}
                    color='#D27C2C'
                  />
                </View>
                <View style={styles.menuname}>
                  <Text style={styles.topic}>Privacy Policy</Text>
                  <Text style={styles.menudes}>
                    Help you understand our privacy policy better
                  </Text>
                </View>
              </View>
              <View style={styles.rightContent}>
                <MaterialCommunityIcons
                  name='chevron-right'
                  size={30}
                  color='gray'
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignOut}>
            <View style={styles.panel}>
              <View style={styles.menucontainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name='logout'
                    size={30}
                    color='#D27C2C'
                  />
                </View>
                <View style={styles.menuname}>
                  <Text style={styles.topic}>Logout</Text>
                </View>
              </View>
              <View style={styles.rightContent}>
                <MaterialCommunityIcons
                  name='chevron-right'
                  size={30}
                  color='gray'
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <FullScreenModal
        imageUri={userData.photoURL}
        thumbnailStyle={styles.image}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verify: {
    color: 'black',
    fontFamily: 'InterRegular',
  },
  notiverify: {
    color: 'black',
    fontFamily: 'InterRegular',
    opacity: 0.5,
  },

  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '90%',
  },
  Content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(rgba(210, 124, 44, 1))',
    padding: 20,
    paddingTop: 50,
    width: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginBottom: 10,
  },
  menucontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    height: 40,
    width: '10%',
  },
  menuname: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10,

    width: '83%',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#d0d0d0',
  },
  cameraButton: {
    position: 'absolute',
    top: 50,
    left: 50,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  verified: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F0DFC8',
    marginTop: 5,
    padding: 5,
    paddingLeft: 10,
    marginRight: 20,
    borderRadius: 50,
    width: 100,
  },
  topic: {
    fontSize: 20,
    fontFamily: 'InterBold',
    color: 'black',
  },
  menudes: {
    fontSize: 14,
    fontFamily: 'InterItalic',
    color: 'black',
    opacity: 0.5,
  },
  name: {
    fontFamily: 'InterBold',
    fontSize: 16,
  },
  username: {
    fontFamily: 'InterLight',
    fontSize: 14,
    opacity: 0.5,
  },
  menupanel: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myaccount: {
    alignContent: 'flex-start',
  },
  rightContent: {
    width: '7%',
  },
})

export default Profiles
