import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	View,
	Image,
	Pressable,
	Alert,
} from 'react-native';
import instagram_logo from '../assets/instagram-logo.png';
import * as SecureStore from 'expo-secure-store';
import XMR from '../xmr';
import InstagramButton from '../components/InstagramButton';


export default function LoginScreen({ navigation }) {
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [canLogin, setCanLogin] = React.useState(false);
	const [controlsEnabled, setControlsEnabled] = React.useState(true);
	const [xmr, _] = React.useState(new XMR());

	const [initialized, setInitialized] = React.useState(false);

	React.useEffect(() => {
		async function init() {
			try {
				const cookie = SecureStore.getItem('xmr-cookie');
				if (cookie) {
					if (await xmr.verify_credentials(cookie)) {
						navigation.reset({
							index: 0,
							routes: [{ name: 'Access' }],
						});
					}
					else {
						await SecureStore.deleteItemAsync('xmr-cookie');
					}
				}
			} catch (e) {
				console.error(e);
			}

			setInitialized(true);
		}
		init();
	}, []);

	return (
		<View style={styles.container}>
			<StatusBar style='auto' />
			{!initialized ? (
				<View style={styles.container}></View>
			) : (
				<View style={styles.container}>
					<Image
						source={instagram_logo}
						style={styles.main_logo}
					/>
					<View style={styles.text_input_container}>
						<TextInput
							onChangeText={(new_value) => {
								setUsername(new_value);
								setCanLogin(password.length >= 6 && username.length != 0);
							}}
							value={username}
							placeholder='Phone number, username, or email'
							style={styles.text_input}
							spellCheck={false}
							disabled={!controlsEnabled}
							cursorColor={'darkgray'}
						/>

						<TextInput
							onChangeText={(new_value) => {
								setPassword(new_value);
								setCanLogin(password.length >= 6 && username.length != 0);
							}}
							value={password}
							placeholder='Password'
							style={styles.text_input}
							secureTextEntry={true}
							disabled={!controlsEnabled}
							cursorColor={'darkgray'}
						/>

						<InstagramButton
							text={'Log in'}
							disabled={!canLogin || !controlsEnabled}
							onPress={async (e) => {
								console.log('Pressed button');
								setControlsEnabled(false);

								try {
									xmr.Guest.login(username, password)
										.then((data) => {
											let cookie = data[0];
											SecureStore.setItem('xmr-cookie', cookie);

											navigation.reset({
												index: 0,
												routes: [{ name: 'Access' }],
											});
										})
										.catch((e) => {
											try {
												let error_json = JSON.parse(e.message);
												Alert.alert(error_json['error']);
												setControlsEnabled(true);
											} catch (e0) {
												console.error(e.message);
												console.error(e0.message);
											}
										});
								} catch (e) {
									console.error(e);
								}
							}}
							style={{
								backgroundColor: 'rgb(40, 159, 246)',
								padding: 13,
							}}
							textStyle={{
								color: '#fff',
							}}
						/>

						<Text style={{ color: 'blue', textAlign: 'center' }}>
							Reset your password?
						</Text>
					</View>

					<View style={styles.footer}>
						<View style={styles.footer_content}>
							<Text style={{}}>Don't have an account?</Text>
							<Pressable
								onPress={() => {
									navigation.navigate('Signup');
								}}>
								<Text style={{ color: '#33f', fontWeight: '600' }}>
									Sign up?
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	text_input_container: {
		marginTop: 20,
		gap: 10,
	},
	main_logo: {
		width: 160,
		height: 60,
	},
	text_input: {
		paddingVertical: 10,
		paddingHorizontal: 10,
		textAlign: 'left',
		borderWidth: 0.3,
		borderColor: 'gray',
		width: 300,
		borderRadius: 2,
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		height: 75,
		width: '100%',
		borderWidth: 1,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
		borderColor: 'rgba(200, 200, 200, 0.45)',
		backgroundColor: 'transparent',
		flexDirection: 'column',
		alignItems: 'center',
	},
	footer_content: {
		flexDirection: 'row',
		alignItems: 'center',
		height: '100%',
		gap: 3,
	},
});
