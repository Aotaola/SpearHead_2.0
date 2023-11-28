import 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Linking, Alert, FlatList, TextInput} from 'react-native';
import {useEffect, useState} from 'react';
import SpearHealthLogoBW from './assets/SpearHealthLogoBW.png';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import Afc_NPP_2022 from './Afc_NPP_2022.pdf'
import  * as Clipboard from '@react-native-community/clipboard';
import { debounce } from 'lodash';
import { MaterialCommunityIcons, Ionicons, Octicons} from '@expo/vector-icons';



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


function LocationScreen ({navigation}){
  const [searchQuery, setSearchQuery] = useState('');
 // const [userLocation, setUserLocation] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [locations, setLocations] = useState([
    {
      id: 'hollywood',
      title: 'Hollywood',
      coordinates: {
        latitude: 26.011201,
        longitude: -80.149490,
      },
      address: '5812 Hollywood Blvd Hollywood, FL, 33021',
    },
    {
      id: 'clearwater',
      title: 'Clearwater',
      coordinates: {
        latitude: 27.976914,
        longitude: -82.710480,
      },
      address: '1500 McMullen Booth Rd. Ste. A1-A2 Clearwater, FL, 33759',
    },
    {
      id: 'largo',
      title: 'Largo',
      coordinates: {
        latitude: 27.892392,
        longitude: -82.783243,
      },
      address: '9040 Ulmerton Rd, Suite 200 Largo, FL, 33771',
    },
    
  ]);

  const centerLatitude = (locations[0].coordinates.latitude + locations[1].coordinates.latitude + locations[2].coordinates.latitude) / 3;
  const centerLongitude = (locations[0].coordinates.longitude + locations[1].coordinates.longitude + locations[2].coordinates.longitude) / 3;

  // Set your map's initial region to this center
  const [region, setRegion] = useState({
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta: 2, // Adjust as necessary to include all markers
    longitudeDelta: 2, // Adjust as necessary to include all markers
  });

  const handleSelectClinic = (clinic) => {
    setSelectedClinic(clinic);
    setDetailsVisible(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const result = await Location.geocodeAsync(searchQuery);
    if (result.length > 0) {
      const { latitude, longitude } = result[0];
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 1.1922,
        longitudeDelta: 1.1421,
      });
    } else {
      alert('No locations found');
    }
  };

  const visitClinic = (clinic) => {
    navigation.navigate('Contact'
    , {clinic: clinic}
    )
  };
  

  return (
    <View style={styles.locationScrollview}>

      <View style={styles.locationPickerContainer}>
      <View style={styles.locationSearchBar}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for a clinic"
          value={searchQuery}
          onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.findLocationBtn}>
            <Octicons name="search" size={20} color="black"/>
          </TouchableOpacity>
      </View>
      <View style= {styles.visitClinicCont}>
        {selectedClinic && (
          <TouchableOpacity onPress={() => visitClinic(selectedClinic)} style={styles.visitClinicBtn}>
            <Text style={styles.clinicButtonText}> Visit Clinic +</Text>
          </TouchableOpacity>
        )}
      </View>
      <MapView
        style={styles.locationMap}
        region={region}
        onRegionChangeComplete={setRegion}
        >
        {locations.map((location) => (
          <Marker
          key={location.id}
          coordinate={location.coordinates}
          title={location.title}
          description={location.address}
          onPress={() => handleSelectClinic(location)}
          >
            <View style={styles.customMarker}>
              <Ionicons name="location" size={40} color="crimson" />
            </View>
            <Callout  style={styles.customCallout}>
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{location.title}</Text>
                <Text style={styles.calloutDescription}>{location.address}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>          
      </View>
    </View>
  );
};

function ContactScreen({route, navigation}) {
  
  const [userLocation, setUserLocation] = useState(null);
  const clinic = route.params.clinic
  const [errorMsg, setErrorMsg] = useState(null);

  console.log(clinic)
  
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
        {/* <Text>{clinic.address}</Text> */}
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
        <Text>{clinic.address}</Text>
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
    <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: 'steelblue', // Color of the header bar
        borderBottomEndRadius: 20,    // Rounded corners on the bottom end
        borderBottomStartRadius: 20,  // Rounded corners on the bottom start
        shadowOpacity: 0.5,           // Shadow for iOS
        shadowOffset: { height: 5 },  // Shadow offset for iOS
        shadowRadius: 5,              // Shadow blur radius for iOS
        height: 40,                  // Height of the header bar
      },
      headerTintColor: 'lightsteelblue',        // Color of the back button and title
      headerTitleStyle: {
        color: 'transparent',              // Font size for the title
      },
      headerTitleAlign: 'center',     // Align the title to the center
      headerBackTitleVisible: true,  
      headerShadowVisible: true,
    }}>
      <Stack.Screen name = "Profile" component={ProfileScreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
    </Stack.Navigator>
  );
}

function InitialStack() {
  return (
    <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: 'steelblue', // Color of the header bar
        borderBottomEndRadius: 20,    // Rounded corners on the bottom end
        borderBottomStartRadius: 20,  // Rounded corners on the bottom start
        shadowOpacity: 0.5,           // Shadow for iOS
        shadowOffset: { height: 5 },  // Shadow offset for iOS
        shadowRadius: 5,              // Shadow blur radius for iOS
        height: 40,                  // Height of the header bar
      },
      headerTintColor: 'lightsteelblue',        // Color of the back button and title
      headerTitleStyle: {
        color: 'transparent',              // Font size for the title
      },
      headerTitleAlign: 'center',     // Align the title to the center
      headerBackTitleVisible: true,  
      headerShadowVisible: true,
    }}>
      <Stack.Screen name = "Home" component={HomeScreen} />
      <Stack.Screen name="Update" component={UpdateScreen} />
    </Stack.Navigator>
  );
}

function InformationalStack() {
  return (
    <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: 'steelblue', // Color of the header bar
        borderBottomEndRadius: 20,    // Rounded corners on the bottom end
        borderBottomStartRadius: 20,  // Rounded corners on the bottom start
        shadowOpacity: 0.5,           // Shadow for iOS
        shadowOffset: { height: 5 },  // Shadow offset for iOS
        shadowRadius: 5,              // Shadow blur radius for iOS
        height: 40,                  // Height of the header bar
      },
      headerTintColor: 'lightsteelblue', 
      headerFontSize: 20,       // Color of the back button and title
      headerTitleStyle: {
        color: 'transparent',  
      },
      headerTitleAlign: 'center',     // Align the title to the center
      headerBackTitleVisible: true,  
      headerShadowVisible: true,
    }}>
      <Stack.Screen name = "Location" component={LocationScreen} />
      <Stack.Screen name = "Contact" component={ContactScreen} />
      <Stack.Screen name="Info" component={InfoScreen}/>
    </Stack.Navigator>
  )
}

function App({navigation}) {

  return (
    
    <View style={styles.container}>
      <View style={styles.logoContainer}>
      <Image source={SpearHealthLogoBW} style={styles.logo} />
      <Text style={styles.mainHeading}>SPEARHEAD</Text>
      </View>
      {/* <AuthContext.Provider value={{ user, setUser }}> */}
      
        <NavigationContainer>
          <Tab.Navigator tabBarPosition="bottom" 
            initialRouteName="Home"
            activeColor="crimson"
            inactiveColor="grey"
            borderColor = "silver"
            fontFamily="Helvetica"
            barStyle={{ backgroundColor: 'whitesmoke',
            borderWidth: 1,
            borderColor: 'silver',
            height: 90,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 0,
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
  </View> 
  );
}

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: 'transparent',
   // height: 100
  },
  pagerView: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'aliceblue'
  },
  logoContainer: {
    backgroundColor: 'steelblue',
    flexDirection: 'row', 
   // borderRadius: 30,
    paddingStart: 20,
    paddingEnd: 10,
    paddingBottom: 0,
    paddingTop: 40,
    justifyContent: 'flex-start',
    alignContent: 'space between',
    borderBottomWidth: 1,
    borderBottomColor: 'steelblue',
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
    backgroundColor: 'aliceblue', 
    borderRadius: 10, 
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'lightseagreen', 
  },
  clinicDetailsCard: {
    backgroundColor: 'gainsboro',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // Remove width: '20%' to allow the card to expand based on content
  },
  clinicDetailsText: {
    fontFamily: 'Helvetica Neue',
    fontSize: 16,
    color: '#333', // A darker color for better readability
    marginBottom: 5, // Spacing between text elements
  },
  customCallout: {
    borderRadius: 10,
    zIndex: 10,
    flex: 1,
  },
  calloutView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 160, // Set a minimum width for the callout bubble
    maxWidth: 300, // Set a maximum width so it doesn't stretch too wide
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
  },

  invoiceText: {
    fontSize: 18, 
    color: 'cornflowerblue',
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
    bottom: 5,
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
    backgroundColor: 'aliceblue', 
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10, 
    borderWidth: 1,
    borderColor: 'lightseagreen', 
    //alignItems: 'center', 
    //justifyContent: 'center', 
  },
  contactButtonText: {
    color: 'cornflowerblue', 
    fontFamily: 'Helvetica',
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center', 
  },
  locationScrollview: {
    flex: 1,
    backgroundColor: 'aliceblue',
  },
  visitClinicCont: {
    height: 40,
    width: '100%',
    backgroundColor: 'aliceblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitClinicBtn: {
    height: '100%',
    width: '40%',
    backgroundColor: 'aliceblue',
    borderWidth: 1,
    borderColor: 'crimson',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10, // Added rounded corners
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Added subtle shadow
  },
  clinicButtonText: {
    color: 'cornflowerblue',
    fontFamily: 'Helvetica',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5, // Added letter spacing for better readability
  },
  locationPickerContainer: {
    justifyContent: 'space-between',
    backgroundColor: 'aliceblue',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    width: '100%',
    height: '100%',
  },
  locationSearchBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    padding: 0,
    fontSize: 20,
    backgroundColor: 'aliceblue',
    },
  mapContainer: {
    height: 200, 
    width: '100%'
  },
  locationMap: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'silver',
    borderRadius: 10,
  },
  findLocationBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
    borderBottomRightRadius: 30, 
    borderTopRightRadius: 30, 
    width: '18%',
    borderWidth: 1,
    borderColor: 'gainsboro'
  },
  findLocationText: {
    color: 'red', // Example text color
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentLocationBtn: {
    // Styles for the 'Use current location' button
    padding: 10,
    borderRadius: 5,
    //alignItems: 'center',
    //justifyContent: 'center',
    marginTop: 10,
  },
  currentLocationText: {
    // Styles for the text inside the 'Use current location' button
    fontSize: 16,
    color: '#1a73e8', // This can be any color you choose
  },
  searchBar: {
    height: 40,
    backgroundColor: 'lightgrey',
    borderTopLeftRadius: 30,
    borderWidth: 0,
    borderColor: 'silver',
    padding: 0,
    width: '60%',
    marginBottom: 0,
    paddingLeft: 20,
    fontSize: 16,
    placeholderTextColor: 'red',
    },
  clinicDetailsCard: {
    backgroundColor: '#f9f9f9', // Soft background color for the details card
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
    marginTop: 10,
  },
  clinicDetailsText: {
    display: 'inline-block',
    fontSize: 16,
    lineWeight: 'bold',
    color: 'crimson',
    marginBottom: 3,
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
    padding: 0,
    width: 65,
    height: 65,
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
    color: 'midnightblue', 
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
    backgroundColor: 'aliceblue',
    borderRadius: 10,
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
  },
  calloutButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    textAlign: 'center',
  },


});

export default App;
