import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Text, View, Image } from 'react-native';
import afc_logo from './assets/afc_logo.png';

function HomeScreen({navigation}) {
  return (
    <View>
      
      <Button 
        title="Contact"
        onPress={() => navigation.navigate('Contact')}
      />
      <Button
        title="Info"
        onPress={() => navigation.navigate('Info')}  
      />
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
      <Text>Info Screen</Text>
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
    
      <NavigationContainer >
          <Image source = {afc_logo} style={{width: 50, height: 50}} />
          <Text>American Family Care</Text> 
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />
            <Stack.Screen name="Info" component={InfoScreen} />
          </Stack.Navigator>
        
      </NavigationContainer>
    
  );
}

export default App;

