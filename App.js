import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity  } from 'react-native';
//import MapView from 'react-native-maps';
//import Geolocation from 'react-native-geolocation-service';
//import Geolocation from '@react-native-community/geolocation';
import {useEffect, useState} from 'react';
import afc_logo from './assets/afc_logo.png';

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
    <ScrollView >
      <Button 
          title="Contact"
          onPress={() => navigation.navigate('Contact')}
        />
      <Button
        title="Info"
        onPress={() => navigation.navigate('Info')}  
      />
      <Button
        title="Location"
        onPress={() => navigation.navigate('Location')}  
      />
      {updates.map((item, index) => (
        <TouchableOpacity 
        key={index}
        onPress={() => navigation.navigate('Update', {item})}
        >
        <Text style={styles.newsTitle}>{item.title}</Text>
        </TouchableOpacity>
        ))}
    </ScrollView>
  );
}


function UpdateScreen({route}){
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
  const [location, setLocation] = useState(null)

  useEffect(() => {
    requestLocationPermission();
    getCurrentLocation();
  },[])

  const requestLocationPermission = async() => {

  }
  
  const getCurrentLocation = () => {
    geolocation.getCurrentPosition(
      position => {
        const coords = position.coords
        const lat = coords.latitude
        const lon = coords.longitude
        setLocation({lat, lon})
      }
    )
  }
  return (
    <View>
      <Button
        title="Info"
        onPress={() => navigation.navigate('Info')}  
        />
      <Button 
        title = "Home"
        onPress={() => navigation.navigate('Home')}
        />
      {/* <MapView
        region={{
          latitude: location.lat,
          longitude: location.lng
        }}>
        {/* <Marker 
          coordinate={{latitude: location.lat, longitude: location.lng}}/> */}
      {/* </MapView> */} 
    </View>
  );
}

function LocationScreen({navigation}){
  Geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
  });
    // Apple Maps
 // let url = `https://maps.apple.com/?q=afc&near=${lat},${lng}`;

// Google Maps 
  //let url = `https://www.google.com/maps/search/?api=1&query=afc&query_place_id=${lat},${lng}`;
  
    // Use lat/lng  

  
  return (
    <View>
      <Button 
  title="Find AFC Near You"
  onPress={() => {
    getUserLocation();
    openMapsApp(); 
  }}
/>

    </View>
  )
}


function InfoScreen({navigation}) {
  return (
    <View>
      <Text >Info Screen</Text>
      <Button
        title="Contact"
        onPress={() => navigation.navigate('Contact')}  
        />
      <Button 
        title = "Home"
        onPress={() => navigation.navigate('Home')}
        />
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    
     <NavigationContainer style={styles.container}>
        <Image source = {afc_logo}  style={styles.logo} />
        <Text>American Family Care</Text> 
        <Stack.Navigator screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerMode: 'screen',
          headerLayoutPreset: 'left'}}
          >
          <Stack.Screen name="Home" component={HomeScreen} 
          options={({ navigation }) => ({
            headerMode: 'screen',
            headerLayoutPreset: 'left'
          })}  />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="Info" component={InfoScreen} />
          <Stack.Screen name="Update" component={UpdateScreen}/>
          <Stack.Screen name="Location" component={LocationScreen} />
        </Stack.Navigator>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Built by Alejandro Otaola</Text>
        </View>
      </NavigationContainer>
     
    
  );
}

const styles = StyleSheet.create({
 
  container: {
    paddingTop: 10,
    fontFamily: 'Helvetica',
    flex: 1,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsContainer: {

  },
  newsTitle: {
    padding: 10,
    fontSize: 30,
    fontFamily: 'Helvetica',
    backgroundColor: 'white',
  },
  newsBody: {
    paddingTop: 10,
    fontSize: 15,
    fontFamily: 'Helvetica',
    backgroundColor: 'white',
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
    height: 50,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: 'Helvetica',
    color: 'red',
    fontSize: 15,
  },
});


export default App;

