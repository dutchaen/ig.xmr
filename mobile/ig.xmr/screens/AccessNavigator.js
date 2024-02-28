import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DirectStackNavigator from './DirectStackNavigator';
import TabNavigator from './TabNavigator';
import { GlobalProvider } from '../global/GlobalContext';

const AccessStack = createNativeStackNavigator();

export default function AccessStackNavigator({ route }) {
	return (
		<GlobalProvider>
			<NavigationContainer independent={true}>
				<AccessStack.Navigator
					screenOptions={{
						headerShown: false,
					}}
					initialRouteName={'MainAccess'}>
					<AccessStack.Screen
						name={'MainAccess'}
						component={TabNavigator}
						initialParams={{
							where: 'profile',
						}}
					/>
					<AccessStack.Screen
						name={'Direct'}
						component={DirectStackNavigator}
						options={{
							animation: 'slide_from_right',
							animationDuration: 50,
						}}
					/>
				</AccessStack.Navigator>
			</NavigationContainer>
		</GlobalProvider>
	);
}
