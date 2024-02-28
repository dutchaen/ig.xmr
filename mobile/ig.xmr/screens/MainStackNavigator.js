import { View, Text } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import ProfileScreen from './subscreens/ProfileScreen';
import HomeScreen from './subscreens/HomeScreen';
import SearchScreen from './subscreens/SearchScreen';
import CreatePostScreen from './subscreens/CreatePostScreen';
import PostScreen from './subscreens/PostScreen';

const MainStack = createNativeStackNavigator();

export default function MainStackNavigator({ route }) {
	return (
		<MainStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
			initialRouteName={route.params?.where}>
			<MainStack.Screen
				name={'home'}
				component={HomeScreen}
			/>
			<MainStack.Screen
				name={'search'}
				component={SearchScreen}
			/>
			<MainStack.Screen
				name={'create_post'}
				component={CreatePostScreen}
			/>
			<MainStack.Screen
				name={'notifications'}
				component={OutOfOrderComponent}
			/>
			<MainStack.Screen
				name={'post'}
				component={PostScreen}
				options={{
					animation: 'slide_from_bottom',
					animationDuration: 50,
				}}
			/>
			<MainStack.Screen
				name={'profile'}
				component={ProfileScreen}
				initialParams={{
					isMine: true,
					id: -1,
					hasBack: false,
				}}
			/>
		</MainStack.Navigator>
	);
}

function TestComponent() {
	return (
		<View style={{ flex: 1 }}>
			<Text>Hello</Text>
		</View>
	);
}


function OutOfOrderComponent() {
	return (
		<View
			style={{
				flex: 1,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 60,
				backgroundColor: '#eee',
				gap: 10,
			}}>
			<Ionicons
				name='code-working-outline'
				size={50}
			/>
			<Text style={{ fontWeight: 300, fontSize: 20, textAlign: 'center' }}>
				This screen has not been implemented yet.
			</Text>

			<Text style={{ fontWeight: 300, fontSize: 14, opacity: 0.7 }}>
				
			</Text>
		</View>
	);
}