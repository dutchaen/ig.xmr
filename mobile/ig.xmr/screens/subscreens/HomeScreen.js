import { View, Text, Image, StyleSheet, FlatList, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import instagram_logo from '../../assets/instagram-logo.png';
import React from 'react';
import XMR from '../../xmr';
import { TouchableOpacity } from 'react-native';
import {
	HTTPS_PREFIX,
} from '../../constants';
import InstagramVerifiedSvg from '../../components/InstagramVerifiedSvg';

export default function HomeScreen({ navigation }) {
	const [xmr, setXMR] = React.useState(new XMR());
	const [timeline, setTimeline] = React.useState([]);

	React.useEffect(() => {
		async function updateTimeline() {
			let newTimeline = await xmr.Private.Media.timeline();
			setTimeline(newTimeline);
		}

		updateTimeline();
	}, []);

	return (
		<View style={styles.root}>
			<HomeBanner navigation={navigation} />
			<HomeTimeline
				timeline={timeline}
				navigation={navigation}
			/>
		</View>
	);
}

function HomeBanner({ navigation }) {
	return (
		<View style={styles.banner}>
			
			<TouchableOpacity 
				activeOpacity={0.8}
				onPress={() => {
					Linking.openURL('https://github.com/dutchaen');
				}}>
				<Ionicons
					name='logo-github'
					size={20}
				/>

			</TouchableOpacity>
			
			<Image
				source={instagram_logo}
				style={{ width: 75, height: 25 }}
			/>

			<TouchableOpacity
				activeOpacity={0.6}
				onPress={() => {
					navigation.navigate('Direct', {
						params: {
							screen: 'ContactList',
						},
					});
				}}>
				<Ionicons
					name='paper-plane-outline'
					size={20}
				/>
			</TouchableOpacity>
		</View>
	);
}

function HomeTimeline({ timeline, navigation }) {
	return (
		<View>
			<FlatList
				data={timeline}
				renderItem={({ item }) => (
					<NavigatablePost
						post={item}
						navigation={navigation}
					/>
				)}
				ListEmptyComponent={EmptyTimeline}
				ItemSeparatorComponent={
					<View style={{ height: 10 }}></View>
				}></FlatList>
		</View>
	);
}

function NavigatablePost({ post, navigation }) {
	return (
		<View>
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => {
					navigation.navigate('post', {
						userId: post.posted_by,
						postId: post.id,
					});
				}}>
				<View
					style={{
						padding: 10,
						flexDirection: 'row',
						alignItems: 'center',
						gap: 10,
					}}>
					<Image
						source={{
							uri:
								HTTPS_PREFIX +
								`/${post.owner.username}/avatar?time=${new Date()}`,
						}}
						style={{
							width: 30,
							height: 30,
							borderRadius: 100,
						}}
					/>

					<TouchableOpacity
						activeOpacity={0.8}
						onPress={() => {
							navigation.navigate('profile', {
								id: post.owner.id,
								isMine: false,
								hasBack: true,
							});
						}}>
						<View
							style={{
								flexDirection: 'row',
								gap: 3,
								alignItems: 'center',
							}}>
							<Text
								style={{
									fontWeight: '500',
									fontSize: 16,
								}}>
								{post.owner.username}
							</Text>

							{post.owner.is_verified ? (
								<InstagramVerifiedSvg
									height={10}
									width={10}
								/>
							) : (
								<View></View>
							)}
						</View>
					</TouchableOpacity>
				</View>

				<Image
					source={{
						uri: `${HTTPS_PREFIX}/rest/guest/media/${post.short_code}`,
					}}
					style={{
						height: 400,
						width: '100%',
					}}
				/>
			</TouchableOpacity>
		</View>
	);
}

function EmptyTimeline() {
	return (
		<View
			style={{
				flex: 1,
				alignItems: 'center',
				padding: 60,
				backgroundColor: '#eee',
				gap: 10,
			}}>
			<Ionicons
				name='accessibility-outline'
				size={50}
			/>
			<Text style={{ fontWeight: 300, fontSize: 20 }}>
				You have no timeline.
			</Text>

			<Text style={{ fontWeight: 300, fontSize: 14, opacity: 0.7 }}>
				Find your friends and create your timeline.
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		flexDirection: 'column',
	},
	banner: {
		display: 'flex',
		width: '100%',
		padding: 14,
		borderBottomWidth: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomColor: 'rgba(210, 210, 210, 0.4)',
	},
});
