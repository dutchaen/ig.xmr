
import React from 'react';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccessStackNavigator from './screens/AccessNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName={'Login'}>
				<Stack.Screen
					name='Login'
					component={LoginScreen}
					options={{
						headerShown: false,
					}}
				/>

				<Stack.Screen
					name='Signup'
					component={SignupScreen}
					options={{
						headerShown: false,
					}}
				/>

				<Stack.Screen
					name='Access'
					component={AccessStackNavigator}
					options={{
						headerShown: false,
					}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
