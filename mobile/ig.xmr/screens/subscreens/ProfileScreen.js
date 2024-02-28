import {
	StyleSheet,
	View,
	Text,
	Image,
	ActivityIndicator,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	Modal,
	Alert,
	BackHandler
} from 'react-native';

import Svg, { SvgProps, Path } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';
import XMR from '../../xmr';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { GlobalContext } from '../../global/GlobalContext';
import {
	HTTPS_PREFIX,
	DEFAULT_PROFILE_PHOTO,
} from '../../constants';
import InstagramButton from '../../components/InstagramButton';
import { kmbFormatter } from '../../globals';
import FloatLabelTextField from '../../components/FloatLabelTextInput';

export default function ProfileScreen({ route, navigation }) {
	const [hasBeenChanged, setHasBeenChanged] = React.useState(false);
	const [isMine, setIsMine] = React.useState(route.params?.isMine);
	const [hasBack, setHasBack] = React.useState(route.params?.hasBack);
	const [desiredId, setDesiredId] = React.useState(route.params?.id);

	const [xmr, _] = React.useState(new XMR());
	const [profile, setProfile] = React.useState({});
	const [currentUser, setCurrentUser] = React.useState({});
	const [profilePhoto, setProfilePhoto] = React.useState(DEFAULT_PROFILE_PHOTO);

	const [isLoaded, setIsLoaded] = React.useState(false);
	const [isFollowing, setIsFollowing] = React.useState(false);
	const [refreshing, setRefreshing] = React.useState(false);
	const [followedBeforeRender, setFollowedBeforeRender] = React.useState(false);
	const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
		React.useState(false);

	const [isSetUsernameModalVisible, setIsSetUsernameModalVisible] =
		React.useState(false);

	const { myProfilePhoto, setMyProfilePhoto } = React.useContext(GlobalContext);
	const [posts, setPosts] = React.useState([]);

	const onRefresh = React.useCallback(() => {
		(async () => {
			let currentUser = await xmr.Private.Accounts.get_current_user();
			setCurrentUser(currentUser);

			let id = route.params?.id;

			if (isMine) {
				id = currentUser.id;
			}

			let _profile = await xmr.Guest.User.get_user_id_info(id);
			console.log(_profile);

			setProfile(_profile);
			setIsMine(_profile.id === currentUser.id);
			console.log('loaded');
			setIsFollowing(_profile.is_following);

			let _posts = await xmr.Guest.User.get_medias_via_user_id(_profile.id);
			setPosts(_posts);
			console.log(_posts);

			setProfilePhoto(
				HTTPS_PREFIX + `/${_profile.username}/avatar?time=${new Date()}`
			);

			if (isMine) {
				setMyProfilePhoto(
					HTTPS_PREFIX + `/${_profile.username}/avatar?time=${new Date()}`
				);
			}
			setIsLoaded(true);
		})();
	}, []);

	React.useEffect(() => {
		(async () => {
			let currentUser = await xmr.Private.Accounts.get_current_user();
			setCurrentUser(currentUser);

			let id = route.params?.id;

			if (isMine) {
				id = currentUser.id;
			}

			let _profile = await xmr.Guest.User.get_user_id_info(id);
			console.log(_profile);

			setProfile(_profile);
			setIsMine(_profile.id === currentUser.id);
			console.log('loaded');
			setIsFollowing(_profile.is_following);
			setFollowedBeforeRender(_profile.is_following);

			let _posts = await xmr.Guest.User.get_medias_via_user_id(_profile.id);
			setPosts(_posts);
			console.log(_posts);

			setProfilePhoto(
				HTTPS_PREFIX + `/${_profile.username}/avatar?time=${new Date()}`
			);
			setIsLoaded(true);
		})();
	}, []);

	React.useEffect(() => {
		(async () => {
			if (hasBeenChanged) {
				if (isFollowing) {
					let result = await xmr.Private.User.create_friendship(profile.id);
					let newProfile = { ...profile };
					newProfile.follower_count++;
					setProfile(newProfile);
				} else {
					let result = await xmr.Private.User.destroy_friendship(profile.id);
					let newProfile = { ...profile };
					newProfile.follower_count--;
					setProfile(newProfile);
				}
			}
		})();
	}, [isFollowing]);

	return (
		<View style={styles.root}>
			{!isLoaded ? (
				<ActivityIndicator size={'large'} />
			) : (
				<FlatList
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
					ListEmptyComponent={
						<View>
							<ProfileNameHeader
								xmr={xmr}
								user={profile}
								isVerified={profile.is_verified}
								isMine={isMine}
								hasBack={hasBack}
								navigation={navigation}
							/>
							<ProfileDataView
								profile={profile}
								profilePhoto={profilePhoto}
								isMine={isMine}
								isFollowing={isFollowing}
								setIsFollowing={setIsFollowing}
								setHasBeenChanged={setHasBeenChanged}
								setIsEditProfileModalVisible={setIsEditProfileModalVisible}
								posts={posts}
							/>

							<ProfileMediaViewer me={profile} />

							<ProfilePostsGrid
								posts={posts}
								navigation={navigation}
							/>
						</View>
					}></FlatList>
			)}

			<InstagramEditProfileModal
				xmr={xmr}
				currentUser={currentUser}
				isEditProfileModalVisible={isEditProfileModalVisible}
				setIsEditProfileModalVisible={setIsEditProfileModalVisible}
				isSetUsernameModalVisible={isSetUsernameModalVisible}
				setIsSetUsernameModalVisible={setIsSetUsernameModalVisible}
			/>

		</View>
	);
}


function ProfilePostsGrid({ posts, navigation }) {
	console.log('renderer');
	let posts_copy = [...posts].reverse();
	return (
		<View style={[styles.root]}>
			<FlatList
				data={posts_copy}
				renderItem={({ item }) => {
					console.log(item);
					return (
						<View style={{ minWidth: 138, maxWidth: 138, height: 138, borderWidth: 1, borderColor: '#fff' }}>
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => {
									navigation.navigate('post', {
										postId: item.id,
										userId: item.posted_by,
									});
								}}>
								<Image
									source={{
										uri: `${HTTPS_PREFIX}/rest/guest/media/${item.short_code}`,
									}}
									style={{ height: '100%', width: '100%' }}
								/>
							</TouchableOpacity>
						</View>
					);
				}}
				contentContainerStyle={{
					flexDirection: 'row',
				}}
				numColumns={3}
			/>
		</View>
	);
}

function InstagramEditProfileModal({
	xmr,
	currentUser,
	isEditProfileModalVisible,
	setIsEditProfileModalVisible,
	isSetUsernameModalVisible,
	setIsSetUsernameModalVisible,
}) {
	const [username, setUsername] = React.useState(currentUser.username);
	const [isModifying, setIsModifying] = React.useState(false);
	const [changingProfile, setChangingProfile] = React.useState(false);
	const [tempCurrentUser, setTempCurrentUser] = React.useState({});

	React.useEffect(() => {
		setTempCurrentUser({
			...currentUser,
		});

		setUsername(currentUser.username);
	}, [currentUser]);

	console.log({
		...currentUser,
	});

	React.useEffect(() => {
		if (!changingProfile) {
			return;
		}

		async function edit_profile() {
			try {
				await xmr.Private.Accounts.edit_profile(
					tempCurrentUser.name,
					tempCurrentUser.username,
					tempCurrentUser.email,
					tempCurrentUser.bio,
					tempCurrentUser.website,
					tempCurrentUser.gender
				);

				setIsSetUsernameModalVisible(false);
				setIsEditProfileModalVisible(false);
			} catch (e) {
				try {
					let error_json = JSON.parse(e.message);
					Alert.alert(error_json['error']);
					setTempCurrentUser({
						...currentUser,
					});
				} catch {}
			} finally {
				setIsModifying(false);
				setChangingProfile(false);
			}
		}

		edit_profile();
	}, [changingProfile]);

	return (
		<Modal
			visible={isEditProfileModalVisible}
			onRequestClose={() => setIsEditProfileModalVisible(false)}
			animationType='slide'>
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					alignItems: 'center',
				}}>
				<InstagramEditProfileHeader
					isModifying={isModifying}
					changingProfile={changingProfile}
					setChangingProfile={setChangingProfile}
					setIsSetUsernameModalVisible={setIsSetUsernameModalVisible}
					setIsEditProfileModalVisible={setIsEditProfileModalVisible}
				/>

				<InstagramEditProfileContent
					xmr={xmr}
					previousCurrentUser={currentUser}
					currentUser={tempCurrentUser}
					setCurrentUser={setTempCurrentUser}
					isModifying={isModifying}
					setIsModifying={setIsModifying}
					changingProfile={changingProfile}
					setChangingProfile={setChangingProfile}
					setIsSetUsernameModalVisible={setIsSetUsernameModalVisible}
					setIsEditProfileModalVisible={setIsEditProfileModalVisible}
				/>

				<InstagramSetUsernameModal
					xmr={xmr}
					username={username}
					setUsername={setUsername}
					isSetUsernameModalVisible={isSetUsernameModalVisible}
					setIsSetUsernameModalVisible={setIsSetUsernameModalVisible}
					setIsEditProfileModalVisible={setIsEditProfileModalVisible}
				/>
			</View>
		</Modal>
	);
}

function InstagramEditProfileHeader({
	isModifying,
	changingProfile,
	setChangingProfile,
	setIsSetUsernameModalVisible,
	setIsEditProfileModalVisible,
}) {
	return (
		<View
			style={{
				display: 'flex',
				padding: 14,
				width: '100%',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottomWidth: 0.2,
				borderBottomColor: '#ccc',
			}}>
			<TouchableOpacity
				disabled={isModifying || changingProfile}
				onPress={() => {
					setIsEditProfileModalVisible(false);
					setIsSetUsernameModalVisible(false);
				}}>
				<Text style={{ fontWeight: '500', fontSize: 15 }}>Cancel</Text>
			</TouchableOpacity>

			<Text style={{ fontWeight: '600', fontSize: 17 }}>Edit Profile</Text>

			<TouchableOpacity
				disabled={isModifying || changingProfile}
				onPress={() => {
					setChangingProfile(true);
				}}>
				{isModifying || changingProfile ? (
					<ActivityIndicator
						size='small'
						color={'#aaa'}
					/>
				) : (
					<Text style={{ fontWeight: '500', fontSize: 15 }}>Done</Text>
				)}
			</TouchableOpacity>
		</View>
	);
}

function InstagramEditProfileContent({
	xmr,
	previousCurrentUser,
	currentUser,
	setCurrentUser,
	isModifying,
	setIsModifying,
	changingProfile,
	setChangingProfile,
	setIsSetUsernameModalVisible,
	setIsEditProfileModalVisible,
}) {
	const [name, setName] = React.useState(currentUser.name);
	const [username, setUsername] = React.useState(currentUser.username);
	const [bio, setBio] = React.useState(currentUser.bio);
	const [email, setEmail] = React.useState(currentUser.email);
	const pfp = React.useRef(
		`${HTTPS_PREFIX}/${previousCurrentUser.username}/avatar?time=${new Date()}`
	);

	const { myProfilePhoto, setMyProfilePhoto } = React.useContext(GlobalContext);
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
			base64: true,
		});

		if (!result.canceled) {
			setIsModifying(true);

			let b64 = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;

			await xmr.Private.Accounts.change_profile_photo(b64);

			setIsModifying(false);

			setIsSetUsernameModalVisible(false);
			setIsEditProfileModalVisible(false);
			setMyProfilePhoto(
				`${HTTPS_PREFIX}/${currentUser.username}/avatar?time=${Date.now()}`
			);
		}
	};

	return (
		<View
			style={{
				flex: 1,
				flexDirection: 'column',
				width: '100%',
				padding: 20,
				gap: 10,
			}}>
			<View>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={pickImage}>
					<View
						style={{
							flexDirection: 'column',
							gap: 10,
							alignItems: 'center',
							display: 'flex',
						}}>
						<Image
							source={{
								uri: pfp.current,
							}}
							style={{
								width: 100,
								height: 100,
								borderRadius: 100,
							}}
						/>

						<Text style={{ color: 'rgb(0, 148, 210)', fontSize: 16 }}>
							Change Profile Photo
						</Text>
					</View>
				</TouchableOpacity>
			</View>

			<View
				style={{
					height: 200,
					width: '100%',
					flexDirection: 'row',
					alignItems: 'flex-start',
				}}>
				<View
					style={{
						display: 'flex',
						width: '100%',
						flexDirection: 'column',
						gap: 5,
					}}>
					<FloatLabelTextField
						value={name}
						onChangeTextValue={(value) => {
							setCurrentUser({
								...currentUser,
								name: value,
							});
							setName(value);
						}}
						placeholder='Name'
						style={{}}
					/>

					<FloatLabelTextField
						value={username}
						onChangeTextValue={(value) => {
							setCurrentUser({
								...currentUser,
								username: value,
							});
							setUsername(value);
						}}
						placeholder='Username'
						style={{}}
						onFocus={() => {
							console.log('set username modal visible');
							setIsSetUsernameModalVisible(true);
						}}
					/>

					<FloatLabelTextField
						value={bio}
						onChangeTextValue={(value) => {
							setCurrentUser({
								...currentUser,
								bio: value,
							});
							setBio(value);
						}}
						placeholder='Bio'
						style={{}}
					/>

					<FloatLabelTextField
						value={email}
						onChangeTextValue={(value) => {
							setCurrentUser({
								...currentUser,
								email: value,
							});
							setEmail(value);
						}}
						placeholder='Email'
						style={{}}
					/>
				</View>
			</View>
		</View>
	);
}

function InstagramSetUsernameModal({
	xmr,
	username,
	setUsername,
	isSetUsernameModalVisible,
	setIsSetUsernameModalVisible,
	setIsEditProfileModalVisible,
}) {
	const [canSendRequest, setCanSendRequest] = React.useState(false);
	const [tempUsername, setTempUsername] = React.useState('');
	const [isModifying, setIsModifying] = React.useState(false);

	React.useEffect(() => {
		setTempUsername(username);
	}, [username]);

	return (
		<Modal
			visible={isSetUsernameModalVisible}
			onRequestClose={() => setIsSetUsernameModalVisible(false)}
			animationType='slide'>
			<View style={styles.root}>
				<View
					style={{
						flex: 1,
						flexDirection: 'column',
						alignItems: 'center',
					}}>
					<InstagramSetUsernameHeader
						xmr={xmr}
						isModifying={isModifying}
						setIsModifying={setIsModifying}
						canSendRequest={canSendRequest}
						setCanSendRequest={setCanSendRequest}
						username={username}
						tempUsername={tempUsername}
						setUsername={setUsername}
						setTempUsername={setTempUsername}
						setIsSetUsernameModalVisible={setIsSetUsernameModalVisible}
						setIsEditProfileModalVisible={setIsEditProfileModalVisible}
					/>
					<InstagramSetUsernameContent
						previousUsername={username}
						username={tempUsername}
						setUsername={setTempUsername}
						isModifying={isModifying}
						canSendRequest={canSendRequest}
						setCanSendRequest={setCanSendRequest}
					/>
				</View>
			</View>
		</Modal>
	);
}

function InstagramSetUsernameHeader({
	xmr,
	isModifying,
	setIsModifying,
	canSendRequest,
	setCanSendRequest,
	username,
	tempUsername,
	setUsername,
	setTempUsername,
	setIsSetUsernameModalVisible,
	setIsEditProfileModalVisible,
}) {
	return (
		<View
			style={{
				display: 'flex',
				padding: 14,
				width: '100%',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottomWidth: 0.2,
				borderBottomColor: '#ccc',
			}}>
			<TouchableOpacity
				disabled={isModifying}
				onPress={() => {
					setIsSetUsernameModalVisible(false);
				}}>
				<Text style={{ fontWeight: '500', fontSize: 15 }}>Cancel</Text>
			</TouchableOpacity>

			<Text style={{ fontWeight: '500', fontSize: 17 }}>Set Username</Text>

			<TouchableOpacity
				disabled={isModifying && !canSendRequest}
				onPress={async () => {
					setIsModifying(true);

					try {
						await xmr.Private.Accounts.set_username(tempUsername);
						setUsername(tempUsername);
						setIsModifying(false);
						setIsSetUsernameModalVisible(false);
						setIsEditProfileModalVisible(false);
					} catch (e) {
						try {
							let error_json = JSON.parse(e.message);
							Alert.alert(error_json['error']);
						} catch {
							/* empty */
						}

						setTempUsername(username);
						setCanSendRequest(false);
						setIsModifying(false);
					}
				}}>
				{isModifying ? (
					<ActivityIndicator
						size='small'
						color={'#aaa'}
					/>
				) : (
					<View>
						{canSendRequest ? (
							<Text style={{ fontWeight: '500', fontSize: 15, color: 'blue' }}>
								Set
							</Text>
						) : (
							<Text style={{ fontWeight: '500', fontSize: 15, color: '#999' }}>
								Set
							</Text>
						)}
					</View>
				)}
			</TouchableOpacity>
		</View>
	);
}

function InstagramSetUsernameContent({
	previousUsername,
	username,
	setUsername,
	isModifying,
	canSendRequest,
	setCanSendRequest,
}) {

	return (
		<View>
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					width: '100%',
					padding: 20,
					gap: 10,
				}}>
				<View
					style={{
						height: 50,
						width: '100%',
						flexDirection: 'row',
						alignItems: 'flex-start',
					}}>
					<View
						style={{
							display: 'flex',
							width: '100%',
							flexDirection: 'column',
							gap: 5,
						}}>
						<FloatLabelTextField
							value={username}
							onChangeTextValue={(value) => {
								setUsername(value);
								if (previousUsername !== value && value.length > 0) {
									setCanSendRequest(true);
								} else {
									setCanSendRequest(false);
								}
							}}
							placeholder='Username'
							style={{}}
						/>
					</View>
				</View>

				<Text style={{ opacity: 0.3 }}>
					Changing your username will also change your Instagram account
					address.
				</Text>
			</View>
		</View>
	);
}

function ProfileNameHeader({
	xmr,
	user,
	isVerified,
	isMine,
	hasBack,
	navigation,
}) {
	return (
		<View style={styles.header}>
			<View
				style={{
					display: 'flex',
					flexDirection: 'row',
					gap: 3,
					alignItems: 'center',
				}}>
				{hasBack ? (
					<TouchableOpacity
						onPress={() => {
							navigation.goBack(null);
						}}>
						<Ionicons
							name='arrow-back-outline'
							size={20}
							style={{
								marginRight: 10,
							}}
						/>
					</TouchableOpacity>
				) : (
					<View></View>
				)}

				<TouchableOpacity
					onPress={() => {
					}}>
					<View style={{ alignItems: 'center', flexDirection: 'row', gap: 3 }}>
						<Text style={{ fontSize: 23, fontWeight: 600 }}>{user.username}</Text>
						{isVerified ? (
							<InstagramVerifiedSvg
								width={14}
								height={14}
							/>
						) : (
							<Text></Text>
						)}

						{isMine ? (
							<Ionicons
								name='chevron-down-outline'
								style={styles.sandwich_icon}
								size={10}
							/>
						) : (
							<View></View>
						)}
					</View>
				</TouchableOpacity>
			</View>

			{isMine ? (
				
				<TouchableOpacity activeOpacity={0.7} onPress={() => {
					Alert.alert('Are you sure you want to log out?', undefined, [
						{
							text: 'Yes',
							onPress: () => {
								SecureStore.setItem('xmr-cookie', '');
								BackHandler.exitApp();
							},
							style: 'destructive',
						},
						{
							text: 'NO', 
							onPress: () => console.log('OK Pressed'),
						}
					]);
				}}>
					<View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
						<Ionicons
							name='log-out-outline'
							style={styles.sandwich_icon}
							size={25}
						/>
					</View>
				</TouchableOpacity>
				
			) : (
				<TouchableOpacity activeOpacity={0.7} onPress={async () => {

					let result = await xmr.Private.Direct.create_thread(user.id);

					if (result !== undefined) {
						if (result['created_thread_id'] !== undefined) {
							await xmr.Private.Direct.send_text(
								result['created_thread_id'],
								'Hi! :3'
							);
						}

						navigation.navigate('Direct', {
							params: {
								screen: 'ContactList',
							},
						});
					}
				}}>
					<View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
						<Ionicons
							name='mail-unread-outline'
							style={styles.sandwich_icon}
							size={25}
						/>
					</View>
				</TouchableOpacity>
			)}
		</View>
	);
}

function ProfileDataView({
	profile,
	profilePhoto,
	isMine,
	isFollowing,
	setIsFollowing,
	setHasBeenChanged,
	setIsEditProfileModalVisible,
	posts,
}) {
	return (
		<View style={{ display: 'flex', flexDirection: 'column', padding: 15 }}>
			<View style={styles.profile_data}>
				<Image
					style={styles.profile_photo}
					source={{ uri: profilePhoto }}
				/>

				<View
					style={{
						display: 'flex',
						flex: 1,
						flexDirection: 'column',
						alignItems: 'center',
					}}>
					<View style={styles.followers}>
						<ProfileNameDataComponent
							name={'Posts'}
							data={posts.length}
						/>

						<ProfileNameDataComponent
							name={'Followers'}
							data={profile.follower_count}
						/>

						<ProfileNameDataComponent
							name={'Following'}
							data={profile.following_count}
						/>
					</View>
				</View>
			</View>

			<View style={{ marginTop: 7 }}>
				{profile.name.length === 0 ? (
					<View></View>
				) : (
					<Text style={{ fontWeight: 600 }}>{profile.name}</Text>
				)}

				{profile.bio.length === 0 ? (
					<View></View>
				) : (
					<Text style={styles.bio}>{profile.bio}</Text>
				)}
			</View>

			{isMine ? (
				<InstagramButton
					text='Edit profile'
					style={{}}
					onPress={() => {
						setIsEditProfileModalVisible(true);
					}}
				/>
			) : (
				<InstagramButton
					text={isFollowing ? 'Unfollow' : 'Follow'}
					style={{}}
					onPress={() => {
						setIsFollowing(!isFollowing);
						setHasBeenChanged(true);
					}}
				/>
			)}
		</View>
	);
}

function ProfileMediaViewer({ me }) {
	return (
		<View style={styles.media_navbar}>
			<View style={styles.media_navbar_item_selected}>
				<InstagramCrackerSvg />
			</View>
		</View>
	);
}

function InstagramVerifiedSvg({ width, height }) {
	return (
		<Svg
			width={width}
			height={height}
			fill='#0095F6'
			aria-label='Verified'
			viewBox='0 0 40 40'>
			<Path
				fillRule='evenodd'
				d='M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z'
			/>
		</Svg>
	);
}

function InstagramCrackerSvg() {
	return (
		<Svg
			width={12}
			height={12}
			fill='currentColor'
			viewBox='0 0 24 24'>
			<Path
				fill='none'
				stroke='black'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M3 3h18v18H3zM9.015 3v18M14.985 3v18M21 9.015H3M21 14.985H3'
			/>
		</Svg>
	);
}

function ProfileNameDataComponent({ name, data }) {
	return (
		<View style={{ display: 'flex', flexDirection: 'column' }}>
			<Text style={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
				{kmbFormatter(data)}
			</Text>
			<Text style={{ fontSize: 14, color: 'gray' }}>{name}</Text>
		</View>
	);
}

function ProfileKeyValueData({ item }) {
	return (
		<View style={{ display: 'flex', flexDirection: 'column' }}>
			<Text style={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
				{item.data}
			</Text>
			<Text style={{ fontSize: 14, color: 'gray' }}>{item.name}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	header: {
		width: '100%',
		textAlign: 'left',
		padding: 15,
		fontSize: 16,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderWidth: 0,
		borderColor: 'rgba(200, 200, 200, 0.30)',
	},
	profile_data: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 5,
		justifyContent: 'space-between',
	},
	profile_photo: {
		borderRadius: 100,
		width: 90,
		height: 90,
	},
	follower_and_controls: {
		display: 'flex',
		flexDirection: 'row',
		height: 90,
		alignItems: 'center',
	},
	followers: {
		display: 'flex',
		flexDirection: 'row',
		alignContent: 'center',
		justifyContent: 'space-evenly',
		gap: 40,
	},
	controls: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 5,
		width: '100%',
	},
	bio: {
		fontWeight: '400',
		color: 'rgba(30, 30, 30, 0.8)',
	},
	media_navbar: {
		marginTop: 30,
		borderTopWidth: 1,
		borderColor: 'rgba(200, 200, 200, 0.10)',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
	},
	media_navbar_item_selected: {
		padding: 10,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: 'rgba(30, 30, 30, 0.8)',
		width: 80,
	},
	media_navbar_item: {
		padding: 10,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: 'lightblue',
		width: 80,
	},
	edit_profile_text_input: {
		padding: 12,
		borderBottomWidth: 0.3,
		borderBottomColor: '#ccc',
		width: '100%',
	},
	sandwich_icon: {},
});
