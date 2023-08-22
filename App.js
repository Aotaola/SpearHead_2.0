import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Text, View, Image, StyleSheet, ActivityIndicator, ScrollView, Link } from 'react-native';
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
      {updates.map((item, index) => (
        <View>
         <Text style = {styles.newsTitle} key={index}>{item.title}</Text>
         
        </View>
         
        ))}
    </ScrollView>
  );
}

function UpdateScreen({navigation, index}){
  return(
    <View>

    </View>
  );
}

function ContactScreen({navigation}) {
  return (
    <View>
      <Text>Contact Screen</Text>
      <Button
        title="Info"
        onPress={() => navigation.navigate('Info')}  
      />
      <Button 
        title = "Home"
        onPress={() => navigation.navigate('Home')}
        />
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
  newsTitle: {
    padding: 10,
    fontSize: 16,
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

