import { View, Text, Image, StyleSheet } from 'react-native';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import XMR from '../xmr';
import React from 'react';
import MainStackNavigator from './MainStackNavigator';
import InstagramHomeIcon from '../components/svg/InstagramHomeIcon';
import InstagramHomeIconSelected from '../components/svg/InstagramHomeIconSelected';
import InstagramSearchIcon from '../components/svg/InstagramSearchIcon';
import InstagramSearchIconSelected from '../components/svg/InstagramSearchIconSelected';
import InstagramCreatePostIcon from '../components/svg/InstagramCreatePostIcon';
import InstagramHeartIconSelected from '../components/svg/InstagramHeartIconSelected';
import InstagramHeartIcon from '../components/svg/InstagramHeartIcon';
import { GlobalContext } from '../global/GlobalContext';
import { HTTPS_PREFIX } from '../constants';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ rootNavStack }) {
	const [xmr, _] = React.useState(new XMR());
	const [currentUser, setCurrentUser] = React.useState(null);

	const { myProfilePhoto, setMyProfilePhoto } = React.useContext(GlobalContext);

	React.useEffect(() => {
		(async () => {
			let currentUser = await xmr.Private.Accounts.get_current_user();
			console.log(currentUser);
			setCurrentUser(currentUser);
			setMyProfilePhoto(
				HTTPS_PREFIX + `/${currentUser.username}/avatar?time=${new Date()}`
			);
		})();
	}, []);

	return (
		<Tab.Navigator
			initialRouteName='MyProfile'
			screenOptions={{
				tabBarShowLabel: false,
				tabBarActiveTintColor: 'black',
			}}>
			<Tab.Screen
				name='Home'
				component={MainStackNavigator}
				initialParams={{
					where: 'home',
				}}
				options={{
					headerShown: false,
					tabBarIcon: ({ focused, color }) => (
						<View>
							{focused ? <InstagramHomeIconSelected /> : <InstagramHomeIcon />}
						</View>

					),
				}}
			/>

			<Tab.Screen
				name='Search'
				component={MainStackNavigator}
				initialParams={{
					where: 'search',
				}}
				options={{
					headerShown: false,
					tabBarIcon: ({ focused, color }) => (
						<View>
							{focused ? (
								<InstagramSearchIconSelected />
							) : (
								<InstagramSearchIcon />
							)}
						</View>
					),
				}}
			/>

			<Tab.Screen
				name='Share'
				component={MainStackNavigator}
				initialParams={{
					where: 'create_post',
				}}
				options={{
					headerShown: false,
					tabBarIcon: ({ focused, color }) => <InstagramCreatePostIcon />,
				}}
			/>

			<Tab.Screen
				name='Notifications'
				component={MainStackNavigator}
				initialParams={{
					where: 'notifications',
				}}
				options={{
					headerShown: false,
					tabBarIcon: ({ focused, color }) => (
						<View>
							{focused ? (
								<InstagramHeartIconSelected />
							) : (
								<InstagramHeartIcon />
							)}
						</View>
					),
				}}
			/>

			<Tab.Screen
				name='MyProfile'
				component={MainStackNavigator}
				initialParams={{
					where: 'profile',
				}}
				options={{
					headerShown: false,
					tabBarIcon: ({ focused, color }) => (
						<View
							style={
								focused ? styles.active_pfp_icon : styles.default_pfp_icon
							}>
							<Image
								source={{
									uri: myProfilePhoto,
								}}
								width={24}
								height={24}
								style={{
									borderRadius: 100,
								}}
							/>
						</View>
					),
				}}
			/>
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	active_pfp_icon: {
		padding: 2,
		borderRadius: 100,
		borderWidth: 1,
	},
	default_pfp_icon: {
		padding: 2,
		borderRadius: 100,
		borderWidth: 0,
	},
});

function TestComponent() {
	return (
		<View style={{ flex: 1 }}>
			<Text>Hello</Text>
		</View>
	);
}
