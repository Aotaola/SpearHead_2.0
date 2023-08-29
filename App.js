import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity} from 'react-native';
import {useEffect, useState} from 'react';
import afc_logo from './assets/afc_logo.png';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';

async function getCoordinatesFromAddress(address) {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`);
  const data = await response.json();
  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { latitude: location.lat, longitude: location.lng };
  }
  return null; // handle error or no results scenario
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
    <ScrollView >
      <Button 
          title="Contact"
          onPress={() => navigation.navigate('Contact')}
        />
      <Button
        title="Info"
        onPress={() => navigation.navigate('Info')}  
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
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
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
              {
        location ? (
          <MapView 
            style={{  width: '100%', height: '70%'}} // Estyle={{ width: '100%', height: '100%' }} nsure the map fills the space
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
          >
            <Marker 
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              }}
              title="Your Location"
            />
          </MapView>
          //<Text style={styles.paragraph}>{text}</Text>
        ) : ( <Text style={styles.paragraph}> no location found </Text>
      )
    }
    </View>
  );
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
  paragraph: {
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
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

