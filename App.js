import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Linking, Alert} from 'react-native';
import {useEffect, useState} from 'react';
import afc_logo from './assets/afc_logo.png';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import Afc_NPP_2022 from './Afc_NPP_2022.pdf'
import Clipboard from '@react-native-community/clipboard';
import Svg, {Path} from 'react-native-svg';


function HomeScreen({navigation}) {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true);
  
  
  useEffect(() => {
    fetch('http://localhost:3000/api/v1/articles')
    .then(response => response.json())
    .then(json => {
      setUpdates(json);
      setLoading(false);
      
    })
    .catch((error) => {
      console.error("There was an error fetching the data", error);
      setLoading(false);
    });
  }, []);
  
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff"/>;
  }
  
  const Hospital = () => {
    return(
      <Svg  style={styles.hospitalSvg} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
      <Path d="M18 14H14V18H10V14H6V10H10V6H14V10H18" />
    </Svg>
      )
    }
    
    return (
      <ScrollView>
      {updates.map((item, index) => (
        <TouchableOpacity 
        key={index}
        onPress={() => navigation.navigate('Update', {item})}
        > 
        <Text style={styles.newsTitle}><Hospital />{item.title}</Text>
        </TouchableOpacity>
        ))}
    </ScrollView>
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



function ContactScreen({navigation}) {
  
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // business location is hardcoded. 

  const businessAddress = '5812 Hollywood Blvd, Hollywood, FL 33021';
  
  const handleCopyToClipboard = () => {
    Clipboard.setString(businessAddress);
    Alert.alert('Success', 'Address copied to clipboard!');
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
  //   const data = await response.json();

  //   if (data.results && data.results.length > 0) {
  //     const location = data.results[0].geometry.location;
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
  
  return (
    <View>
        {userLocation  && businessLocation  ? 
        (
        <MapView 
          style={{  width: '100%', height: '70%'}} 
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title={businessAddress} onPress={handleCopyToClipboard} />
      <Button title="Call: +1(954) 866-7435" onPress={handleCallBusiness} />
      <Button title="Make an Appointment" onPress={handleMakeAppointment} />
    </View>
  </View>
  );
}

function InfoScreen({navigation}) {

  const openAfcNPP = () => {

    const fileUri = FileSystem.documentDirectory + Afc_NPP_2022;

    Linking.openURL(fileUri);
    console.log('fileURI:' + fileUri)
  }

  const [showWebview, setShowWebview] = useState(false);
  return (
    <View style={styles.infoscontainer}>
        <Text style={styles.infoMainText}>
        Urgent Care Center in Hollywood {'\n'}
        We Can Help Your Family Live Life, Uninterrupted. 
        </Text>
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
        <View  style={styles.buttonContainer}>
        <Button title="Privacy Policy" onPress={openAfcNPP} color='steelblue'/>
  
        </View>

    </View>
  );
}

const Tab = createMaterialBottomTabNavigator();

function App() {
  return (
    
    <View style={styles.container}>
      <View style={styles.logoContainer}>
       <Image source={afc_logo} style={styles.logo} />
       <Text style={styles.mainHeading}>American Family Care</Text>
      </View>

      <NavigationContainer>
        <Tab.Navigator tabBarPosition="bottom" 
          initialRouteName="Home"
          activeColor="midnightblue"
          inactiveColor="aliceblue"
          
          fontFamily="Helvetica"
          barStyle={{ backgroundColor: 'crimson',
          height: 80,
          position: 'absolute',
          left: 7,
          right: 7,
          bottom: 30,
          borderRadius: 20,
          overflow: 'hidden'
          }}>
          <Tab.Screen name="Home" component={HomeScreen} style={styles.navButton} options={{
            tabBarIcon: 'home-circle-outline', 
            
          }}/>
          <Tab.Screen name="Contact" component={ContactScreen} style={styles.navButton} options={{
            tabBarIcon: 'map-marker-plus-outline'}}/>
          <Tab.Screen name="Info" component={InfoScreen} style={styles.navButton} options={{
            tabBarIcon: 'information-outline'}}/>
          <Tab.Screen name="Update" component={UpdateScreen} style={styles.navButton} options={{
            tabBarVisible: false,
            tabBarIcon: 'update',
          }}/>
        </Tab.Navigator>
      </NavigationContainer>
  </View> 
  );
}

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    
    backgroundColor: 'aliceblue'
  },
  logoContainer: {
    backgroundColor: 'crimson',
    flexDirection: 'row', 
    paddingStart: 30,
    paddingEnd: 10,
    paddingBottom: 10,
    paddingTop: 40,
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'red',
  },
  hospitalSvg:{

    marginLeft: 10,
    height: 20,
    width: 20,
    position: 'absolute',
    
  },
  mainHeading: {
    fontFamily: 'Helvetica',
    fontSize: 20,                
    fontWeight: '200',           
    color: 'aliceblue',               
    letterSpacing: 0.7,          
    position: 'absolute', 
    bottom: 10,
    left: 100
  },
  infoscontainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: 'aliceblue',
  },
  infoMainText: {
    width: '100%',
    backgroundColor: 'aliceblue',
    paddingTop: 20,
    paddingHorizontal: 10,
    fontFamily: 'Helvetica',
    letterSpacing: 0.7,  
    fontSize: 20, 
    textAlign: 'center'
  },
  infoBody: {
    backgroundColor: 'aliceblue',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
    fontFamily: 'Helvetica',
    letterSpacing: 0.7,  
    fontSize: 15, 
    textAlign: 'center'
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    fontFamily: 'Helvetica',
    fontSize: 10,
    borderWidth: 1,
    borderColor: 'crimson'
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
  paragraph: {
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  newsTitle: {
    paddingTop: 18,
    paddingHorizontal: 20,
    fontSize: 25,
    fontFamily: 'Helvetica',
    color: 'midnightblue',
    backgroundColor: 'aliceblue',
    fontWeight: '400', 
    letterSpacing: 0.7,
    textDecorationLine: 'none'
  },
  newsSubTitle: {

    paddingTop: 18,
    paddingHorizontal: 25,
    fontSize: 18,
    fontFamily: 'Helvetica',
    fontStyle: 'italic',
    color: 'palevioletred',
    backgroundColor: 'aliceblue',
    fontWeight: '400', 
    letterSpacing: 0.7,
    textDecorationLine: 'none',
    textDecorationColor: 'crimson'

  },
  newsBody: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 18,
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
    paddingTop: 18,
    paddingBottom: 100
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
    padding: 10,
    width: 50,
    height: 50,
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
});


export default App;

