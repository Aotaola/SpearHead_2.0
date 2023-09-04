import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity} from 'react-native';
import { WebView } from 'react-native-webview';
import {useEffect, useState} from 'react';
import afc_logo from './assets/afc_logo.png';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const GOOGLE_API_KEY = 'AIzaSyBGAPK3-L4ipbDv7LZN6VmK1TqalvOGfmg';

async function getBusinessCoordinates() {
  const address = "5812 Hollywood Blvd, Hollywood, FL 33021";
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`);
  const data = await response.json();
  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { latitude: location.lat, longitude: location.lng };
  }
  console.log('Geocode API response:', data);
  return null; 
}


function HomeScreen({navigation}) {
const [updates, setUpdates] = useState([])
const [loading, setLoading] = useState(true);


useEffect(() => {
  fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(json => {
        setUpdates(json);
        setLoading(false);
        console.log(json);
      })
        .catch((error) => {
          console.error("There was an error fetching the data", error);
          setLoading(false);
        });
    }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  
  return (
    <ScrollView>
      {updates.map((item, index) => (
        <TouchableOpacity 
        key={index}
        onPress={() => navigation.navigate('Update', {item})}
        > 
        <Text style={styles.newsTitle}> * {item.title}</Text>
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

  return(
    
    <View style={styles.newsContainer}>
      
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsBody}>{item.body}</Text> 
      <Text>{item.date}</Text>
    </View>
  );
}


function ContactScreen({navigation}) {
  const [userLocation, setUserLocation] = useState(null);
  const [businessLocation, setBusinessLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  

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

      //
      //fetching business location
      let businessLoc = await getBusinessCoordinates({});
      setBusinessLocation(businessLoc);
      console.log('Fetched business location:', businessLoc);

    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (userLocation) {
    text = JSON.stringify(userLocation);
  }


  console.log("Business Location:", businessLocation);
  console.log("User Location:", userLocation);
  


  return (
    <View>
              {
        userLocation && businessLocation ? (
          <MapView 
            style={{  width: '100%', height: '70%'}} // Estyle={{ width: '100%', height: '100%' }} nsure the map fills the space
            region={{
              latitude: Location.coords.latitude,
              longitude: Location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
          >
            <Marker 
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude
              }}
              title="your location"
            />
            <Marker 
             coordinates={{
              latitude: businessLocation.coords.latitude,
              longitude: businessLocation.coords.longitude
             }}
             title="American Family Care, Hollywood, Fl."/>
          </MapView>
        ) : ( <Text style={styles.paragraph}> no location found </Text>
      )
    }
    <View style={styles.container}>
  
    </View>
    </View>
  );
}

function InfoScreen({navigation}) {
  const [showWebview, setShowWebview] = useState(false);
  return (
    <View style={styles.infoscontainer}>
      <View style={styles.container}>
        <Text style={styles.newsBody}>
          5812 Hollywood Blvd, Hollywood, FL 33021 {'\n'}
          Contact information: +19548667435{'\n'} 
          {/* add call access to the phone number */}
        </Text>
        {showWebview ? (
        <WebView source={{ uri: 'https://www.afcurgentcare.com/hollywood/' }} />
      ) : (
      <View style={styles.buttonContainer}>
        <Button title="Open Link" onPress={() => setShowWebview(true)}  color="darkgrey" />
      </View> 
      )}
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
          inactiveColor="lightsteelblue"
          iconActiveColor="red"
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
            tabBarIconColor: 'red'
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
    backgroundColor: 'lightsteelblue',
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
    
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#D32F2F', // A shade of red
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
    paddingHorizontal: 30,
    fontSize: 18,
    fontFamily: 'Helvetica',
    color: 'midnightblue',
    backgroundColor: 'whitesmoke',
  },
  newsBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 15,
    fontFamily: 'Helvetica',
    backgroundColor: 'white',
  },
  newsError: {
    padding: 10,
    fontSize: 20,
    fontFamily: 'Helvetica',
    backgroundColor: 'white',
  },
  newsContainer: {

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

