import 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Linking, Alert, FlatList, TextInput} from 'react-native';
import {useEffect, useState} from 'react';
import SpearHealthLogoBW from './assets/SpearHealthLogoBW.png';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import Afc_NPP_2022 from './Afc_NPP_2022.pdf'
import  * as Clipboard from '@react-native-community/clipboard';
import { debounce } from 'lodash';
import { MaterialCommunityIcons } from '@expo/vector-icons';



function truncate(str, maxLength, continuation = "...") {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - continuation.length) + continuation;
}

function HomeScreen({navigation}) {
  
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [updates, setUpdates] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetch(`http://localhost:3000/api/v1/articles?page=${page}&per_page=${itemsPerPage}`)
    .then(response => response.json())
    .then(json => {
      if (json.length === 0) {  
        setHasMoreItems(false);
      } else {
        setUpdates(prevUpdates => [...prevUpdates, ...json]);
        //console.log('updates per page' + page, json)
      }
      setLoading(false);
    })
    .catch((error) => {
      console.error("There was an error fetching the articles", error);
      setLoading(false);
    });
  }, [page]);
  
  if (loading && page === 1) {
    return <ActivityIndicator size="large" color="#0000ff"/>;
  }
  
  const loadMoreItems = debounce(() => {
    if (hasMoreItems && !loading) { 
      setPage(prevPage => prevPage + 1)
    }
  },500);
  
  const renderUpdate = ({ item }) => {
    console.log('item ID', item.id)
    return (
      <TouchableOpacity 
      style={styles.TouchableOpacityStyleStyle}
      onPress={() => navigation.navigate('Update', { item })}
      >
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSubTitle}>{truncate(item.description, 85)}</Text>
      </TouchableOpacity>
    )
  }
  
  const renderFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }
    
    if (!hasMoreItems) {
      return <Text style={{ textAlign: 'center', padding: 10 }}>No more articles available</Text>;
    }
    return null;
  };
  
  
  return (
    <View style={{flex: 1}}>
      <FlatList
      data={updates}
      renderItem={renderUpdate}
      keyExtractor={(item) => item.id.toString()}
      onEndReached={loadMoreItems}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter} 
      />
    </View>
  );
}
   
  function UpdateScreen({route}){
    
    if (!route.params) {
      return <Text style={styles.newsError}>Error loading data, please select an article from the homepage</Text> 
    }
    const {item} = route.params;
    console.log(item.admin)
    
    return(
      <ScrollView style={styles.newsContainer}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSubTitle}>{item.description}</Text>
        <View style={styles.imageContainer}>
          <Image source={{uri: 'http://content.health.harvard.edu/wp-content/uploads/2023/08/6c4e88b9-3890-4cf8-aab4-cc0eb928d98f.jpg'}} style={styles.image} />
        </View>
        <Text style={styles.newsBody}>{item.body}</Text> 
        <Text style={styles.newsBody}>{item.admin}</Text> 
    </ScrollView>
  );
}

const LocationScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleAddressSearch = async () => {
    if (searchQuery.trim() === '') return;

    const geocodeResult = await Location.geocodeAsync(searchQuery);
    if (geocodeResult.length > 0) {
      const { latitude, longitude } = geocodeResult[0];
      setMapRegion({
        ...mapRegion,
        latitude: latitude,
        longitude: longitude,
      });
    } else {
      alert('No results found');
    }
  };

  return (
    <View style={styles.locationPickerContainer}>
      <TextInput
        style={styles.locationSearchBar}
        placeholder="Enter address or location"
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        onSubmitEditing={handleAddressSearch}
      />
      <Button
        title="Search Location"
        onPress={handleAddressSearch}
        color="#1a73e8"
      />
      <MapView
        style={styles.locationMap}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        <Marker coordinate={mapRegion} />
      </MapView>
    </View>
  );
};

function ContactScreen({navigation}) {
  
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // business location is hardcoded. 
  
  const businessAddress = "5812 Hollywood Blvd, Hollywood, FL 33021";
  
  const handleCopyToClipboard = () => {

    if (Clipboard && Clipboard.setString) {
        Clipboard.setString(businessAddress);
        Alert.alert('Success', 'Address copied to clipboard!');
    } else {
        console.error('Clipboard is not available', error);
        Alert.alert('Error', 'Failed to copy address to clipboard');
    }
};

  const businessPhoneNumber = 'tel: +1(954) 866-7435';
  
  const handleCallBusiness = () => {
    Linking.canOpenURL(businessPhoneNumber)
    .then(supported => {
      if (!supported) {
        console.log('Can\'t handle the URL: ' + businessPhoneNumber);
      } else {
        return Linking.openURL(businessPhoneNumber);
      }
    })
    .catch(err => console.error('An error occurred', err));
  };
  const appointmentURL = 'https://www.clockwisemd.com/hospitals/5482/visits/new?utm_source=google&utm_medium=organic&utm_campaign=&utm_content=&utm_keyword=';
  const handleMakeAppointment = () => {
    Linking.canOpenURL(appointmentURL)
    .then(supported => {
      if (!supported) {
        console.log('Can\'t handle the URL: ' + appointmentURL);
      } else {
        return Linking.openURL(appointmentURL);
      }
    })
    .catch(err => console.error('An error occurred', err));
  };
  
  const businessLocation = {latitude:  26.0089697, longitude: -80.2038731}
  console.log('business location: ', businessLocation)
  
  
  //when multiple locations are required, the below code will help set up business location services
  //const GOOGLE_API_KEY = 'AIzaSyBGAPK3-L4ipbDv7LZN6VmK1TqalvOGfmg';
  // async function getBusinessCoordinates() {
    //   const address = "5812 Hollywood Blvd, Hollywood, FL 33021";
    //   const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=5812%20Hollywood%20Blvd%2C%20Hollywood%2C%20FL%2033021&key=AIzaSyBGAPK3-L4ipbDv7LZN6VmK1TqalvOGfmg`);
    //   const articles = await response.json();
    
    //   if (articles.results && articles.results.length > 0) {
      //     const location = articles.results[0].geometry.location;
      //     console.log("Extracted Location:", location);
      //     console.log(location.lat, location.lng);
      //     return { latitude: location.lat, longitude: location.lng };
      //   }
      //   //console.log('Geocode API response:', location);
      
      //   print ("no results found"); 
      
      // }
      
      
      useEffect(() => {
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
          
          // fetching user location
          let userLoc = await Location.getCurrentPositionAsync({});
          setUserLocation(userLoc);
          console.log('Fetched user location:', userLoc);
          
          //fetching business location when necessary. remember to use a useState set to (null) when creating businessLocaiton variable
          //let businessLoc = await getBusinessCoordinates({});
          //setBusinessLocation[businessLoc];
          //console.log('Fetched business location:', businessLoc);
          
        })();
      }, []);
      
      let text = 'Waiting..';
      if (errorMsg) {
        text = errorMsg;
      } else if (userLocation) {
        text = JSON.stringify(userLocation);
      }
      
      {/* bellow is to open the privacy policy for this location */}
      const openAfcNPP = () => {
        const fileUri = FileSystem.documentDirectory + Afc_NPP_2022;
        Linking.openURL(fileUri);
        console.log('fileURI:' + fileUri)
      }
      //  
      return (
        <ScrollView style = {{backgroundColor: 'aliceblue'}}> 
        {userLocation  && businessLocation  ? 
        (
          <MapView 
          style={{  width: '100%', height: 350}} 
          region={{
            latitude: businessLocation.latitude,
            longitude: businessLocation.longitude,
            latitudeDelta: 0.0522,
            longitudeDelta: 0.0421
          }}>
            <Marker 
             coordinate={{
               latitude: 26.0089697, 
               longitude: -80.2038731
              }}
              title="American Family Care, Hollywood, Fl."
              />
            <Marker  
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude
              }}
              title="your location"
              pinColor='crimson'
              />
          </MapView>
        ) : ( <Text style={styles.paragraph}> no location found </Text>
        )
      }

    <View style={styles.contactButtonContainer}>
      <TouchableOpacity onPress={handleCopyToClipboard} style={styles.contactButton}>
        <Text style={styles.contactButtonText}>
          {businessAddress}
        </Text>
      </TouchableOpacity>
    </View>

    <View style={styles.contactButtonContainer}>
      <TouchableOpacity onPress={handleCallBusiness} style={styles.contactButton}>
        <Text style={styles.contactButtonText}>
          Call: +1(954) 866-7435
        </Text>
      </TouchableOpacity>
    </View>
    <View  style = {styles.contactButtonContainer}>
      <TouchableOpacity onPress={handleMakeAppointment} style={styles.contactButton}>
        <Text style={styles.contactButtonText}>
          Make an Appointment
        </Text>
      </TouchableOpacity>
    </View>

    <View style={styles.informationButton} >
      <TouchableOpacity 
      onPress={() => navigation.navigate('Info')} >
      <Text style={styles.InfobuttonText}>more information +</Text>
      </TouchableOpacity>
    </View>

    
  </ScrollView>
  );
}

function InfoScreen({route}) {
  const openAfcNPP = () => {
    const fileUri = FileSystem.documentDirectory + Afc_NPP_2022;
    Linking.openURL(fileUri);
    console.log('fileURI:' + fileUri)
  }
  
  return (
    <ScrollView style={styles.infoContainer}> 
          <Text style={styles.infoBody}>
            If you’re in need of medical care for an illness or injury that’s not life-threatening, 
            look no further than American Family Care®. We offer urgent care in the Hollywood area for patients of all ages. 
            Our medical team is staffed with medical professionals that are dedicated to ensuring your health and overall well-being.
          </Text>
          <Text style={styles.infoMainText}>
            Our Mission
          </Text>
          <Text style={styles.infoBody}>
            Our mission is to provide the best healthcare possible in a kind and caring environment, 
            in an economical manner,
            while respecting the rights of all of our patients,
            at times and locations convenient to the patient.
          </Text>
        <View style={styles.buttonContainer}>
          <Button title="Privacy Policy" onPress={openAfcNPP} style={styles.privacyBtn}/>
        </View>
        <Text style={styles.infoMainText}>Hours of Operation</Text>
        <Text style={styles.infoBody}>
        Monday - Friday: 8:00 AM - 8:00 PM {`\n`}
        Saturday - Sunday: 8:00 AM - 5:00 PM
        </Text>
    </ScrollView>
  );
};

function ServiceScreen(){
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [services, setServices] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetch(`http://localhost:3000/api/v1/services?page=${page}&per_page=${itemsPerPage}`)
    .then(response => response.json())
    .then(json => {
      if (json.length === 0) {  
        setHasMoreItems(false);
      } else {
        setServices(prevServices => [...prevServices, ...json]);
        console.log('services per page' + page, json)
      }
      setLoading(false);
    })
    .catch((error) => {
      console.error("There was an error fetching the articles", error);
      setLoading(false);
    });
  }, [page]);
  
  if (loading && page === 1) {
    return <ActivityIndicator size="large" color="crimson" padding="20"/>;
  }

  async function openServiceUrl(item){
    const canOpen = await Linking.canOpenURL(item.url);
    if (canOpen) {
       Linking.openURL(item.url);
    } else {
       console.error("Can't open URL");
    }
 }
  
  const renderUpdate = ({ item }) => {
    
    return (
      <TouchableOpacity 
      style={styles.serviceBtn}
      onPress={() => openServiceUrl(item)}
      > 
        <Text style={styles.serviceText}>{item.title}</Text>
        <Text style={styles.serviceTextDescription}>{truncate(item.description, 85)}</Text>
      </TouchableOpacity>
    )
  }
  
  const loadMoreItems = debounce(() => {
    if (hasMoreItems && !loading) { 
      setPage(prevPage => prevPage + 1)
    }
  },500);
  
  const renderFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }
    
    if (!hasMoreItems) {
      return <Text style={{ textAlign: 'center', padding: 10 }}>No more articles available</Text>;
    }
    return null;
  };
  
  return (
    <View style={styles.serviceContainer} >
      <FlatList
      data={services}
      renderItem={renderUpdate}
      keyExtractor={(item) => item.id.toString()} // 
      onEndReached={loadMoreItems}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter} 
      />
    </View>

);
}

function ProfileScreen({navigation}){

  const [isCreatingAccount, setIsCreatingAccount] = useState(true)
  const [user, setUser] = useState(null); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [insurance, setInsurance] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [invoices, setInvoices] = useState([]);


  console.log('user', user)


  const handleSignUp = () => {
    fetch('http://localhost:3000/api/v1/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient: {
          first_name: firstName,
          last_name: lastName,
          insurance: insurance,
          phone_number: phoneNumber,
          email: email,
          password: password,
        },
      }),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok');
      })
      .then(data => {
        console.log(data);
        console.log(data.id)
        setUser(data)
        setInvoices(data.invoices) 
        
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  };

  const handleLogin = () => {
    fetch('http://localhost:3000/api/v1/patient_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok');
      })
      .then(data => {

        setUser(data.patient);
        setInvoices(data.invoices);
        console.log(data);

      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  };

  const toggleForm = () => {
    setIsCreatingAccount(!isCreatingAccount); 
  };
  
  const forceLogin = () => {
    fetch('http://localhost:3000/api/v1/patients/1')
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok');
    })
    .then(data => {
        // Assuming the data structure is similar to the one you provided earlier
        setUser(data.patient);
        setInvoices(data.invoices);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
};
const handleUserChange = (newUser) => {
  setUser(newUser);
};

  if (user && invoices) {
    return(
      < ScrollView style = {styles.profileContainer}>
        <TouchableOpacity  onPress={() => navigation.navigate('Setting', { onUserChange: handleUserChange, user})} style = {styles.settingsButton}>
        <MaterialCommunityIcons name="cog" size={20} color="black"/>
        </TouchableOpacity>        
        <Text style = {styles.profileMainText}>
          Welcome, {user.first_name}!
        </Text>
        <Text style = {styles.profileText}>
          here are your lab results from your most recent visits:
        </Text>
        <View style = {styles.invoicesContainer}>
          {invoices.map(invoice => (
            <View key = {invoice.id} style = {styles.invoiceContainer}>
            <Text style={styles.invoiceText}> {invoice.description} </Text>
            <Text style={styles.invoiceText}> {invoice.created_at} </Text>
          </View>
          ))}
        </View>
      </ScrollView>
    )
  } else {
  return(
    <View style = {styles.profileContainer}>
        {isCreatingAccount ? (
        <View style = {styles.profileInfoContainer}>
          
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            />
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            />
          <TextInput
            style={styles.input}
            value={insurance}
            onChangeText={setInsurance}
            placeholder="Insurance"
            />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            />
          <View style={styles.profileInfoButtons}>
              <TouchableOpacity style={styles.profileButton} onPress={handleSignUp}>
                <Text style={styles.profileButtonText}>Create an Account</Text>
              </TouchableOpacity>
              <Text style={styles.orText}> or </Text>
              <TouchableOpacity style={styles.profileButton} onPress={toggleForm}>
                <Text style={styles.profileButtonText}>Go Log In</Text>
              </TouchableOpacity>
            </View>
        </View>
            ):(
        <View style = {styles.profileInfoContainer}>
          <TextInput
            style={styles.input}
            value={loginEmail}
            onChangeText={setLoginEmail}
            placeholder="Email"
            />
          <TextInput
            style={styles.secureInput}
            value={loginPassword}
            onChangeText={setLoginPassword}
            placeholder="Password"
            secureTextEntry
            />
          <View style={styles.profileInfoButtons}>
            <TouchableOpacity onPress={handleLogin} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Log In</Text>
            </TouchableOpacity>
            <Text style={styles.orText}> or </Text>
            <TouchableOpacity onPress={toggleForm} style={styles.profileButton} >
              <Text style={styles.profileButtonText}> Go to Create Account </Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
    </View>
  )}
}

function SettingScreen({route, navigation}){

  const [email, setEmail] = useState(route.params.user.email);
  const [firstName, setFirstName] = useState(route.params.user.first_name);
  const [lastName, setLastName] = useState(route.params.user.last_name);
  const [phoneNumber, setPhoneNumber] = useState(route.params.user.phone_number);
  const [insurance, setInsurance] = useState(route.params.user.insurance); 
  const [password, setPassword] = useState(route.params.user.password_digest);
  const [confirmPassword, setConfirmPassword] = useState(route.params.user.password_digest);

  const passwordsMatch = password === confirmPassword;

  const onUserChange = route.params?.onUserChange;
  
  const patient = route.params.user

  console.log('patient', patient)

  const handleLogout = () => {
    fetch('http://localhost:3000/api/v1/patient_logout', {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        console.log('Logout successful');
      } else {
        throw new Error('Logout failed');
      }
    })
    .then(() => {
      // Clear user and invoices state
      onUserChange(null);
      navigation.navigate('Profile')
    })
    .catch(error => {
      console.error('There has been a problem with the logout operation:', error);
    });
  }; 

  const handleEdit = () => {

    const updatedPatient = {
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      insurance: insurance
    };
    if (!passwordsMatch) {
      alert("Passwords do not match!");
      return;
    }

    fetch(`http://localhost:3000/api/v1/patients/${patient.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPatient)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
      console.log(patient.id);
    })
    .then(data => {
      console.log('Success:', data);
      navigation.navigate('Profile', { onUserChange: handleUserChange, user})
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  const handleUserChange = (newUser) => {
    setUser(newUser);
  };


  return (
    <View style={styles.profileInfoContainer}>
      <TextInput
            style={styles.input}
            value={firstName}
            text={patient.first_name}
            onChangeText={setFirstName}
            placeholder= {patient.first_name}
            />
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder={patient.last_name}
            />
          <TextInput
            style={styles.input}
            value={insurance}
            onChangeText={setInsurance}
            placeholder={patient.insurance}
            />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={patient.email}
            />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder={patient.phone_number}
            />
          <TextInput
            style={styles.secureInput}
            value={password}
            onChangeText={setPassword}
            placeholder="PASSWORD"
            secureTextEntry
            />
          <TextInput
            style={styles.secureInput}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            />
            {!passwordsMatch && (
          <Text style={{ color: 'red' }}> Passwords do not match. </Text>
            )}
          <View style={styles.profileInfoButtons}>
            <TouchableOpacity  onPress={handleEdit} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfoButtons}>
            <TouchableOpacity  onPress={handleLogout} style={styles.profileDestroyButton}>
              <Text style={styles.profileDestroyButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
    </View>
  )
}

const Tab = createMaterialBottomTabNavigator();

const Stack = createStackNavigator();

function AccountStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name = "Profile" component={ProfileScreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
    </Stack.Navigator>
  );

}

function InitialStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name = "Home" component={HomeScreen} />
      <Stack.Screen name="Update" component={UpdateScreen} />
    </Stack.Navigator>
  );
}

function InformationalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name = "Location" component={LocationScreen} />
      <Stack.Screen name = "Contact" component={ContactScreen} />
      <Stack.Screen name="Info" component={InfoScreen}/>
    </Stack.Navigator>
  )
}

const ProfileButton = () => {
  const navigation = useNavigation(); // This hook gets the navigation prop

  return (
    <TouchableOpacity 
      style={styles.profileButton}
      onPress={() => navigation.navigate('Profile')} // Use the navigation object here
    >
      <Text style={styles.profileButtonText}>Profile</Text>
    </TouchableOpacity>
  );
};

function App({navigation}) {

  return (
    
    <View style={styles.container}>
          <Tab.Screen name="Profile" component={AccountStack} style={styles.navButton} options={{
            tabBarIcon: 'account-heart'
          }}/>
      <View style={styles.logoContainer}>
      <Image source={SpearHealthLogoBW} style={styles.logo} />
      <Text style={styles.mainHeading}>SPEARHEAD</Text>
      </View>
      {/* <AuthContext.Provider value={{ user, setUser }}> */}
      
        <NavigationContainer>
          <Tab.Navigator tabBarPosition="bottom" 
            initialRouteName="Home"
            activeColor="midnightblue"
            inactiveColor="aliceblue"
            fontFamily="Helvetica"
            barStyle={{ backgroundColor: 'steelblue',
            height: 80,
            position: 'absolute',
            left: 7,
            right: 7,
            bottom: 30,
            borderRadius: 20,
            overflow: 'hidden'
            }}>
            <Tab.Screen name="Home" component={InitialStack} style={styles.navButton} options={{
              tabBarIcon: 'home-circle-outline', 

            }}/>
            <Tab.Screen name="Contact" component={InformationalStack} style={styles.navButton} options={{
              tabBarIcon: 'map-marker-plus-outline'}}/>
      
            <Tab.Screen name="Services" component={ServiceScreen} style={styles.navButton} options={{
              tabBarIcon: 'heart'
            }}/>
            <Tab.Screen name="Profile" component={AccountStack} style={styles.navButton} options={{
            tabBarIcon: 'account-heart'
          }}/>
          </Tab.Navigator>
        </NavigationContainer>
      {/* </AuthContext.Provider> */}
  </View> 
  );
}

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: 'aliceblue',
   // height: 100
  },
  pagerView: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'aliceblue'
  },
  logoContainer: {
    //backgroundColor: 'mediumseagreen',
    //backgroundColor: 'lightseagreen',
    //backgroundColor: 'seagreen',
    //backgroundColor: 'darkseagreen',
    backgroundColor: 'steelblue',
    flexDirection: 'row', 
    paddingStart: 20,
    paddingEnd: 10,
    paddingBottom: 10,
    paddingTop: 40,
    justifyContent: 'flex-start',
    alignContent: 'space between',
    borderBottomWidth: 1,
    borderBottomColor: 'lightsteelblue',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: 'aliceblue',
    paddingLeft: 20,
    paddingRight: 5,
    paddingVertical: 5,
  },
  invoicesContainer: {
    flex: 1,
    backgroundColor: 'aliceblue',
    padding: 20,
    
  },
  profileMainText: {
    fontSize: 25,
    color: 'cornflowerblue',
    marginBottom: 10,

  },
  profileText: {
    fontSize: 20,
    color: 'midnightblue',
    marginBottom: 10,
  },
  invoiceContainer: {
    backgroundColor: 'aliceblue', // Aliceblue background for better readability
    borderRadius: 10, // Medium rounded corners
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'lightseagreen', // Lightseagreen border for a touch of color
  },
  invoiceText: {
    fontSize: 18, // Slightly larger text for better readability
    color: 'cornflowerblue', // Cornflowerblue text for readability and color consistency
  },
  serviceContainer:{
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'lavender',
    paddingHorizontal: 15,
    paddingTop: 5
  },
  serviceBtn: {
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'aliceblue', // Lightseagreen background
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'lightseagreen', // Cornflowerblue border for a touch of color
  },
  serviceText: {
    color: 'cornflowerblue', // Aliceblue text for readability and color consistency
    fontFamily: 'Helvetica',
    fontSize: 21,
    fontWeight: '400',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  serviceTextDescription:{
    fontFamily: 'Helvetica',
    color: 'cadetblue', // Silver text for a subtle contrast
    fontSize: 18,
    fontWeight: '400',
    marginHorizontal: 10,
  },
  mainHeading: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Helvetica',
    fontSize: 20,                
    fontWeight: '320',           
    color: 'lavender',               
    letterSpacing: 4,          
    position: 'absolute', 
    bottom: 20,
    left: 120,
  },
  TouchableOpacityStyleStyle: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: .3,
    borderColor: 'lavender',
    backgroundColor: 'aliceblue',
    borderBottomColor: 'midnightblue',
    difuseColor: 'steelblue',
  },
  contactMainText: {
    color: 'crimson',
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 2,
    fontFamily: 'Helvetica',
    letterSpacing: 0.7,  
    fontSize: 20, 
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  contactBody:{
    paddingTop: 5,
    paddingBottom: 20,
    paddingHorizontal: 10,
    fontFamily: 'Helvetica',
    letterSpacing: 0.7,  
    justifyContent: 'space-around',
    fontSize: 17, 
    textAlign: 'center'
  },
  contactButtonContainer: {
    marginHorizontal: 10,
    marginTop: 5,
  },
  contactButton: {
    backgroundColor: 'aliceblue', // Lightseagreen background
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10, // Added vertical padding for consistency
    borderWidth: 1,
    borderColor: 'lightseagreen', // Cornflowerblue border for a touch of color
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },
  contactButtonText: {
    color: 'cornflowerblue', // Aliceblue text for readability and color consistency
    fontFamily: 'Helvetica',
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center', // Centered text for a polished look
  },
  locationPickerContainer: {
    flex: 1,
    width: '100%',
  },
  locationSearchBar: {
    width: '100%',
    padding: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
  },
  locationMap: {
    width: '100%',
    flex: 1,
  },
  informationButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'gainsboro',
    borderWidth: 1,
    borderColor: 'cornflowerblue',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  InfobuttonText: {
    color: 'steelblue',
    fontFamily: 'Helvetica',
    fontSize: 20,
    fontStyle: 'italic',
  },
  infoContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: 'aliceblue',
  },
  infoMainText: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'aliceblue',
    paddingVertical: 10,
    paddingHorizontal: 2,
    fontFamily: 'Helvetica',
    letterSpacing: 0.7,  
    fontSize: 25, 
    textAlign: 'center'
  },
  infoBody: {
    backgroundColor: 'aliceblue',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    fontFamily: 'Helvetica',
    letterSpacing: 0.7,  
    fontSize: 16, 
    textAlign: 'center'
  },
  buttonContainer: {
    backgroundColor: 'whitesmoke',
    borderColor: 'crimson',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    fontFamily: 'Helvetica',
    width: '100%',
    fontSize: 10,
    borderWidth: 1,
  },
  privacyBtn:{
    borderWidth: 1,
    borderColor: 'crimson',
    backgroundColor: 'aliceblue',
    color: 'white',
  },
  buttonContainerPressed: {
    backgroundColor: 'crimson',
  },
  primaryButton: {
    backgroundColor: '#D32F2F', 
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    borderWidth: 1,
    paddingVertical: 1,
    borderColor: 'crimson',
    paddingLeft: '5%',
    display: 'flex',
    flexDirection: 'row', 
    alignItems: 'center', // Adjust as needed
    color: 'steelblue', // Add your styling here
    fontSize: 16, 
  },
  paragraph: {
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  newsTitle: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 10,
    fontSize: 22,
    fontFamily: 'Helvetica',
    color: 'midnightblue',
    backgroundColor: 'aliceblue',
    fontWeight: '400', 
    letterSpacing: 0.7,
    textDecorationLine: 'none'
  },
  newsSubTitle: {
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 4,
    fontSize: 16,
    fontFamily: 'Helvetica',
    fontStyle: 'italic',
    color: 'steelblue',
    backgroundColor: 'aliceblue',
    fontWeight: '200', 
    letterSpacing: 0.7,
    textDecorationLine: 'none',
    textDecorationColor: 'crimson'
  },
  newsBody: {
    paddingTop: 10,
    paddingBottom: 100,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 15,
    fontFamily: 'Helvetica',
    backgroundColor: 'aliceblue',
    fontWeight: '400',
  },
  newsError: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 20,
    fontSize: 25,
    fontFamily: 'Helvetica',
    color: 'midnightblue',
    backgroundColor: 'aliceblue',
    fontWeight: '400', 
    letterSpacing: 0.7,
    textDecoration: 'underline'
  },
  imageContainer: {
    flex: 1,
    height: 200,
    paddingHorizontal: 20,
    paddingVertical: 5,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'aliceblue'
  },
  image: { 
    paddingHorizontal: 20, 
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    height: '100%',
    width: '100%',
  },
  newsContainer: {
    backgroundColor: 'aliceblue',
    paggingHorizontal: 20,
    paddingTop: 1,
    paddingBottom: 150,
  },
  header: {
    fontFamily: 'Helvetica',
    backgroundColor: 'lightgrey',
    textColor: 'red',
  },
  headerTitle: {
    fontFamily: 'Helvetica',
    color: 'red',
    fontWeight: 'bold',
  },
  buttons: {
    backgroundColor: 'blue',
    color: 'white'
  },
  logo: {
    padding: 20,
    width: 60,
    height: 60,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: 'Helvetica',
    color: 'black',
    letterSpacing: 0.7,  
    fontSize: 10,
    position: 'absolute',
    top:5
  },
  settingsButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',   
    color: 'red', 
    alignItems: 'center',   
    backgroundColor: 'aliceblue', 
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'silver',
    borderRadius: 100,
    marginTop: 0, 
    marginRight: 10 
  },
  profileInfoContainer: {
    flex: 1, 
    padding: 20, 
    backgroundColor: 'aliceblue', 
  },
  textInput: {
    size: 30,
    borderColor: 'silver', 
    borderWidth: 1,
    borderColor: 'midnightblue', 
    borderRadius: 5,
    padding: 20,
    marginBottom: 10,
    color: 'midnightblue', // Text color
  },
  profileButtonText: {
    color: 'cornflowerblue', 
    textAlign: 'center',
    fontFamily: 'Helvetica',
    fontSize: 18,
  },
  profileDestroyButtonText: {
   fontFamily: 'Helvetica',
   fontSize: 15,
   color: 'crimson',
  },
  errorText: {
    color: 'red', 
    marginBottom: 1,
  },
  profileInfoButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: 'aliceblue', // Aliceblue background for better readability
    borderRadius: 10, // Medium rounded corners
    padding: 10,
    marginBottom: 1,
  },
  profileButton: {
    backgroundColor: 'aliceblue',
    borderRadius: 10, 
    padding: 10,
    margin: 1,
    color: 'cornflowerblue',
    borderWidth: 1,
    borderColor: 'lightseagreen' 
  },
  profileDestroyButton: {
    backgroundColor: 'aliceblue',
    borderRadius: 10, 
    padding: 10,
    margin: 1,
    color: 'cornflowerblue',
    borderWidth: 1,
    borderColor: 'firebrick' 
  },
  buttonText: {
    color: 'cornflowerblue',
    fontSize: 20,
    },
  orText: {
    color: 'midnightblue',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 1,
    fontSize: 18,
  },
  input: {
    backgroundColor: 'aliceblue', // Light background for input
    borderColor: 'cornflowerblue', // Border color
    borderWidth: 1,
    width: '100%',
    borderRadius: 5, // Rounded corners
    padding: 10, // Inner padding for text
    marginBottom: 2, // Space between each input
    color: 'midnightblue', // Text color
    fontSize: 16, // Text size
  },
  secureInput: {
    backgroundColor: 'aliceblue', 
    borderColor: 'steelblue',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 2,
    color: 'midnightblue',
    fontSize: 16,
  }

});

export default App;
