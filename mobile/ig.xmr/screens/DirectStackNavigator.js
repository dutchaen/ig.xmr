import { createNativeStackNavigator } from '@react-navigation/native-stack';
import XMR from '../xmr';
import React from 'react';
import ContactListScreen from './subscreens/ContactListScreen';
import ContactMessageListScreen from './subscreens/ContactMessageListScreen';

const DirectStack = createNativeStackNavigator();

export default function DirectStackNavigator({ route }) {
	let [xmr, setXMR] = React.useState(new XMR());

	return (
		<DirectStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
			initialRouteName={route.params?.where}>
			<DirectStack.Screen
				name='ContactList'
				component={ContactListScreen}
			/>
			<DirectStack.Screen
				name={'ContactMessages'}
				component={ContactMessageListScreen}
				options={{
					animation: 'slide_from_right',
					animationDuration: 50,
				}}
			/>
		</DirectStack.Navigator>
	);
}
