import 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Linking, Alert, FlatList} from 'react-native';
import {useEffect, useState} from 'react';
import afc_logo from './assets/afc_logo.png';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import Afc_NPP_2022 from './Afc_NPP_2022.pdf'
import Clipboard from '@react-native-community/clipboard';
import { debounce } from 'lodash';


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
        console.log('updates per page' + page, json)
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
    
    function truncate(str, maxLength, continuation = "...") {
      if (str.length <= maxLength) return str;
      return str.slice(0, maxLength - continuation.length) + continuation;
    }
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
  
  const renderUpdate = ({ item }) => {
    console.log('item ID', item.id)
    return (
      <TouchableOpacity 
      style={styles.serviceBtn}
      onPress={() => {item.url}}
      >
        <Text style={styles.serviceText}>{item.title}</Text>
        <Text style={styles.serviceTextDescription}>{truncate(item.description, 85)}</Text>
      </TouchableOpacity>
    )
    
    function truncate(str, maxLength, continuation = "...") {
      if (str.length <= maxLength) return str;
      return str.slice(0, maxLength - continuation.length) + continuation;
    }
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
      keyExtractor={(item) => item.id.toString()}
      onEndReached={loadMoreItems}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter} 
      />
    </View>

);
}

const Tab = createMaterialBottomTabNavigator();

const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name = "Home" component={HomeScreen} />
      <Stack.Screen name="Update" component={UpdateScreen} options={{presentation: 'transparentModal', TransitionPresets: 'ModalSlideFromBottomIOS'}}/>
    </Stack.Navigator>
  );
}

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
          <Tab.Screen name="Home" component={HomeStack} style={styles.navButton} options={{
            tabBarIcon: 'home-circle-outline', 

          }}/>
          <Tab.Screen name="Contact" component={ContactScreen} style={styles.navButton} options={{
            tabBarIcon: 'map-marker-plus-outline'}}/>
          <Tab.Screen name="Info" component={InfoScreen} style={styles.navButton} options={{
            tabBarIcon: 'information-outline'}}/>
          <Tab.Screen name="Services" component={ServiceScreen} style={styles.navButton} options={{
            tabBarIcon: 'heart'
          }}/>
        </Tab.Navigator>
      </NavigationContainer>
  </View> 
  );
}

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: 'aliceblue',
  },
  pagerView: {
    flex: 1,
  },
  scrollView: {
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
  serviceContainer:{
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    backgroundColor: 'lavender',
    paddingHorizontal: 15,
    paddingTop: 5
  },
  serviceBtn: {
    margin: 8,
    width: '95%',
    height: 125,
    padding: 10,
    backgroundColor: 'darkblue',
    borderWidth: 2,
    borderColor: 'cornflowerblue',
    borderRadius: 15,
  },
  serviceText: {
    color: 'aliceblue',
    fontFamily: 'Helvetica',
    fontSize: 21,
    fontWeight: 400,
    marginHorizontal: 10,
    marginVertical: 5
  },
  serviceTextDescription:{
    fontFamily: 'Helvetica',
    color: 'lightsteelblue',
    fontSize: 18,
    fontWeight: 400,
    marginHorizontal: 10
  },
  mainHeading: {
    display: 'flex',
    alignContent: 'center',
    alignContenr: 'center',
    justifyContent: 'center',
    fontFamily: 'Helvetica',
    fontSize: 20,                
    fontWeight: '200',           
    color: 'aliceblue',               
    letterSpacing: 0.7,          
    position: 'absolute', 
    bottom: 10,
    left: 100
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

