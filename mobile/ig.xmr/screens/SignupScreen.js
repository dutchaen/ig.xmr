import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	View,
	Image,
	Pressable,
} from 'react-native';
import instagram_logo from '../assets/instagram-logo.png';
import InstagramButton from '../components/InstagramButton';

export default function SignupScreen({ navigation }) {
	const [xmr, _] = React.useState(new XMR());
	const [fullname, setFullname] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [email, setEmail] = React.useState('');
	const [setSignup, setCanSignup] = React.useState(false);
	const [controlsEnabled, setControlsEnabled] = React.useState(true);

	return (
		<View style={styles.container}>
			<StatusBar style='auto' />

			<Image
				source={instagram_logo}
				style={styles.main_logo}
			/>
			<View style={styles.text_input_container}>
				<TextInput
					onChangeText={(new_value) => {
						setFullname(new_value);
						setCanSignup(
							password.length >= 6 && username.length != 0 && email.length != 0
						);
					}}
					value={fullname}
					placeholder='Full Name'
					style={styles.text_input}
					spellCheck={false}
					disabled={!controlsEnabled}
					cursorColor={'darkgray'}
				/>

				<TextInput
					onChangeText={(new_value) => {
						setUsername(new_value);
						setCanSignup(
							password.length >= 6 && username.length != 0 && email.length != 0
						);
					}}
					value={username}
					placeholder='Username'
					style={styles.text_input}
					spellCheck={false}
					disabled={!controlsEnabled}
					cursorColor={'darkgray'}
				/>

				<TextInput
					onChangeText={(new_value) => {
						setPassword(new_value);
						setCanSignup(
							password.length >= 6 && username.length != 0 && email.length != 0
						);
					}}
					value={password}
					placeholder='Password'
					style={styles.text_input}
					secureTextEntry={true}
					disabled={!controlsEnabled}
					cursorColor={'darkgray'}
				/>

				<TextInput
					onChangeText={(new_value) => {
						setEmail(new_value);
						setCanSignup(
							password.length >= 6 && username.length != 0 && email.length != 0
						);
					}}
					value={email}
					placeholder='Email address'
					style={styles.text_input}
					spellCheck={false}
					disabled={!controlsEnabled}
					cursorColor={'darkgray'}
					keyboardType='email-address'
				/>

				<InstagramButton
					text='Sign up'
					disabled={!setSignup || !controlsEnabled}
					onPress={async (e) => {
						console.log('Pressed button');
						setControlsEnabled(false);

						await delay(3000);
						try {
							xmr.Guest.signup(username, password)
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


						setControlsEnabled(true);
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
					<Text style={{}}>Have an account?</Text>
					<Pressable
						onPress={() => {
							navigation.navigate('Login');
						}}>
						<Text style={{ color: '#33f', fontWeight: '600' }}>Log in?</Text>
					</Pressable>
				</View>
			</View>
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
