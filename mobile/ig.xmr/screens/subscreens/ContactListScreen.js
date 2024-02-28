import XMR from '../../xmr';
import {
	View,
	Text,
	Image,
	StyleSheet,
	FlatList,
	Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native';
import InstagramVerifiedSvg from '../../components/InstagramVerifiedSvg';
import {
	HTTPS_PREFIX,
	WEBSOCKET_PREFIX,
	DEFAULT_PROFILE_PHOTO,
} from '../../constants';

export default function ContactListScreen({ route, navigation }) {

	const websocket = React.useRef(null);
	const xmr = React.useRef(new XMR());
	const [contacts, setContacts] = React.useState([]);
	const [messages, setMessages] = React.useState({});
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		async function getInbox() {
			let inbox = await xmr.current.Private.Direct.inbox();
			setContacts(inbox['threads']);
			setIsLoading(false);
		}

		getInbox();
	}, []);

	// open websocket for live comms
	React.useEffect(() => {
		websocket.current = new WebSocket(`${WEBSOCKET_PREFIX}/direct/ws/join`);
	}, []);

	React.useEffect(() => {
		if (!websocket.current) {
			return;
		}

		websocket.current.onmessage = (e) => {
			let json = JSON.parse(e.data);

			switch (json['event']) {
				case 'new_message':
					let contacts_clone = [...contacts];
					let messages_clone = { ...messages };

					console.log(contacts);

					if (!messages_clone.hasOwnProperty(json['thread_id'])) {
						messages_clone[json['thread_id']] = [];
					}

					let msg = json['data'];
					messages_clone[json['thread_id']].push(msg);

					let modified_contact = undefined;

					for (let i = 0; i < contacts.length; i++) {
						if (contacts_clone[i].id === json['thread_id']) {
							modified_contact = { ...contacts_clone[i] };
							contacts_clone.splice(i, 1);
							break;
						}
					}

					if (modified_contact !== undefined) {
						modified_contact.preview_message = msg['text'];
						contacts_clone.unshift(modified_contact);

						setContacts(contacts_clone);
						setMessages(messages_clone);
					}

					break;
			}
		};
	}, [messages, contacts]);

	return (
		<View style={styles.root}>
			{isLoading ? (
				<ActivityIndicator size={'large'} />
			) : (
				<View style={styles.root}>
					<InstagramContactsHeader navigation={navigation} />
					<FlatList
						data={contacts}
						renderItem={({ item }) => (
							<InstagramContactItem
								contact={item}
								navigation={navigation}
							/>
						)}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.contact_list_style}
					/>
				</View>
			)}
		</View>
	);
}

function InstagramContactsHeader({ navigation }) {
	return (
		<View
			style={{
				width: '100%',
				borderBottomWidth: 0,
				borderBottomColor: '#ccc',
				padding: 20,
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				gap: 15,
			}}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => {
					navigation.goBack(null);
				}}>
				<Ionicons
					name='arrow-back-outline'
					size={20}
				/>
			</TouchableOpacity>

			<Text style={{ fontWeight: '600', fontSize: 20 }}>Direct</Text>
		</View>
	);
}

function InstagramContactItem({ contact, navigation }) {
	const [xmr, setXMR] = React.useState(new XMR());

	console.log(contact.reciptent);

	return (
		<View style={[styles.root, { width: '100%' }]}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => {
					navigation.navigate('ContactMessages', {
						thread_id: contact.id,
						contact: contact.reciptent,
					});
				}}>
				<View style={[styles.root, { padding: 12, width: '100%' }]}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 10,
						}}>
						<Image
							source={{
								uri:
									HTTPS_PREFIX +
									`/${contact.reciptent.username}/avatar?time=${new Date()}`,
							}}
							style={{ height: 50, width: 50, borderRadius: 100 }}
						/>

						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
							}}>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									alignItems: 'center',
									gap: 5,
								}}>
								<Text style={{ fontWeight: 500 }}>
									{contact.reciptent.username}
								</Text>

								{contact.reciptent.is_verified ? (
									<InstagramVerifiedSvg
										width={12}
										height={12}
									/>
								) : (
									<View></View>
								)}
							</View>

							<View
								style={{
									flex: 1,
									flexDirection: 'column',
								}}>
								<View>
									<Text
										style={{
											opacity: 0.6,
											fontWeight: '400',
										}}>
										{contact.preview_message}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	contact_list_style: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
	},
});
