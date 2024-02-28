import React from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	Image,
	TextInput,
	Alert,
} from 'react-native';
import { View } from 'react-native';
import XMR from '../../xmr';
import { FlatList } from 'react-native';
import InstagramDirectHeartIcon from '../../components/svg/InstagramDirectHeartIcon';
import InstagramMessageHeart from '../../components/svg/InstagramMessageHeart';
import InstagramVerifiedSvg from '../../components/InstagramVerifiedSvg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
	HTTPS_PREFIX,
	WEBSOCKET_PREFIX,
} from '../../constants';

export default function ContactMessageListScreen({ route, navigation }) {
	const [xmr, _] = React.useState(new XMR());
	const websocket = React.useRef(null);
	const [threadId, setThreadId] = React.useState(route.params?.thread_id);
	const [contact, setContact] = React.useState(route.params?.contact);
	const [messages, setMessages] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(true);
	const isLoadingMoreMessages = React.useRef(false);
	const canLoadMoreMessages = React.useRef(true);

	const flatListRef = React.useRef();

	React.useEffect(() => {
		async function getRecentMessages() {
			let msgs = await xmr.Private.Direct.get_messages(threadId);
			setMessages(msgs);
			setIsLoading(false);
		}

		getRecentMessages();
	}, []);

	React.useEffect(() => {
		websocket.current = new WebSocket(`${WEBSOCKET_PREFIX}/direct/ws/join`);
		websocket.current.onmessage = (e) => {
			let json = JSON.parse(e.data);

			switch (json['event']) {
				case 'new_message':
					let messages_clone = [...messages];

					let msg = json['data'];
					messages_clone.unshift(msg);

					setMessages(messages_clone);

					break;
			}
		};
	}, []);

	React.useEffect(() => {
		websocket.current.onmessage = (e) => {
			let json = JSON.parse(e.data);

			switch (json['event']) {
				case 'new_message':
					let messages_clone = [...messages];

					let msg = json['data'];
					messages_clone.unshift(msg);

					setMessages(messages_clone);

					break;
			}
		};
	}, [messages]);

	return (
		<View style={[styles.root, { backgroundColor: 'white' }]}>
			{isLoading ? (
				<View></View>
			) : (
				<View style={styles.root}>
					<InstagramContactHeader
						xmr={xmr}
						navigation={navigation}
						profile={contact}
					/>

					<FlatList
						ref={flatListRef}
						data={messages}
						renderItem={({ item }) => (
							<InstagramMessage
								id={item.id}
								text={item.text}
								is_heart={item.is_heart}
								is_mine={item.is_mine}
							/>
						)}
						onScroll={async (event) => {
							if (
								event.nativeEvent.contentOffset.y >=
									event.nativeEvent.contentSize.height / 2 &&
								!isLoadingMoreMessages.current &&
								canLoadMoreMessages.current
							) {
								isLoadingMoreMessages.current = true;
								console.log('Loading more messages....');
								let last_message = messages[messages.length - 1];
								let previous_messages =
									await xmr.Private.Direct.get_messages_before(
										threadId,
										last_message.id
									);

								let messages_clone = [...messages];
								let new_messages = messages_clone.concat(previous_messages);
								setMessages(new_messages);

								if (messages_clone.length === 0) {
									canLoadMoreMessages.current = false;
								}
								isLoadingMoreMessages.current = false;
							}
						}}
						inverted={true}
						showsVerticalScrollIndicator={false}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{
							padding: 14,
						}}
						ItemSeparatorComponent={<View style={{ height: 6 }}></View>}
					/>

					<InstagramMessageTextBox
						xmr={xmr}
						messages={messages}
						setMessages={setMessages}
						thread_id={threadId}
						listRef={flatListRef}
					/>
				</View>
			)}
		</View>
	);
}

function InstagramMessage({ id, text, is_heart, is_mine }) {
	let content = is_heart ? <InstagramMessageHeart /> : <Text>{text}</Text>;
	let message_styles = [styles.message];

	if (is_mine) {
		message_styles.push(styles.my_message);
	} else {
		message_styles.push(styles.their_message);
	}

	if (is_heart) {
		message_styles.push(styles.heart);
	}

	message_styles = StyleSheet.flatten(message_styles);

	return <View style={message_styles}>{content}</View>;
}

function InstagramContactHeader({ xmr, navigation, profile }) {
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

			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => {
					navigation.navigate('MainAccess', {
						screen: 'MyProfile',
						params: {
							where: 'profile',
							screen: 'profile',
							params: {
								isMine: false,
								id: profile.id,
								hasBack: true,
							},
						},
					});
				}}>
				<View
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 8,
					}}>
					<Image
						source={{
							uri:
								HTTPS_PREFIX + `/${profile.username}/avatar?time=${new Date()}`,
						}}
						style={{ height: 30, width: 30, borderRadius: 100 }}
					/>

					<View
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							gap: 4,
						}}>
						<Text style={{ fontWeight: '600', fontSize: 16 }}>
							{profile.username}
						</Text>

						{profile.is_verified ? (
							<InstagramVerifiedSvg
								width={12}
								height={12}
							/>
						) : (
							<View></View>
						)}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
}

function InstagramMessageTextBox({
	xmr,
	messages,
	setMessages,
	thread_id,
	listRef,
}) {
	const [message, setMessage] = React.useState('');
	const canSend = message.length !== 0;

	return (
		<View
			style={{
				display: 'flex',
				height: 60,
				padding: 10,
			}}>
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					borderWidth: 0,
					borderColor: '#666',
					borderRadius: 20,
					padding: 5,
					alignItems: 'center',
					gap: 10,
				}}>
				<TouchableOpacity
					onPress={() => {
						xmr.Private.Direct.send_heart(thread_id)
							.then(() => {
								let heart_message = {
									id: Date.now(),
									text: '',
									is_heart: true,
									is_mine: true,
								};

								let messages_clone = [...messages];
								messages_clone.unshift(heart_message);
								setMessages(messages_clone);
								listRef.current.scrollToIndex({ index: 0 });
							})
							.catch((e) => console.error(e));
					}}>
					<InstagramDirectHeartIcon />
				</TouchableOpacity>

				<TextInput
					placeholder='Message...'
					onChangeText={setMessage}
					value={message}
					multiline={true}
					style={{
						flex: 1,
					}}
					onKeyPress={(e) => {
						if (e.nativeEvent.key === 'Enter') {
							e.preventDefault();

							if (!canSend) {
								return;
							}

							xmr.Private.Direct.send_text(thread_id, message)
								.then((data) => {
									let messages_clone = [...messages];
									messages_clone.unshift(data['message']);
									setMessages(messages_clone);
									listRef.current.scrollToIndex({ index: 0 });
								})
								.catch((e) => {
									try {
										let json = JSON.parse(e.message);
										Alert.alert(json['error']);
									} catch {
										Alert.alert(e.message);
									}
								})
								.finally(() => {
									setMessage('');
								});
						}
					}}
				/>

				<TouchableOpacity
					onPress={() => {
						if (!canSend) {
							return;
						}

						xmr.Private.Direct.send_text(thread_id, message)
							.then((data) => {
								let messages_clone = [...messages];
								messages_clone.unshift(data['message']);
								setMessages(messages_clone);
								listRef.current.scrollToIndex({ index: 0 });
							})
							.catch((e) => {
								try {
									let json = JSON.parse(e.message);
									Alert.alert(json['error']);
								} catch {
									Alert.alert(e.message);
								}
							})
							.finally(() => {
								setMessage('');
							});
					}}>
					{canSend ? (
						<Text style={styles.send_enabled}>Send</Text>
					) : (
						<Text style={styles.send_disabled}>Send</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	message: {
		maxWidth: '80%',
		padding: 10,
		borderRadius: 18,
	},
	their_message: {
		backgroundColor: '#fff',
		borderWidth: 0.5,
		borderColor: 'lightgray',
		alignSelf: 'flex-start',
	},
	my_message: {
		backgroundColor: 'rgb(242, 244, 247)',
		alignSelf: 'flex-end',
	},
	heart: {
		backgroundColor: 'transparent',
		borderWidth: 0,
	},
	send_disabled: {
		fontWeight: '600',
		color: '#999',
	},
	send_enabled: {
		fontWeight: '600',
		color: 'hotpink',
	},
});
