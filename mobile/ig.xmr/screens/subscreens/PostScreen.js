import {
	ActivityIndicator,
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	Image,
	Modal,
	TextInput,
	FlatList,
	Alert,
	RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import XMR from '../../xmr';
import { HTTPS_PREFIX } from '../../constants';
import InstagramVerifiedSvg from '../../components/InstagramVerifiedSvg';
import InstagramLikeIcon from '../../components/svg/InstagramLikeIcon';
import InstagramLikedIcon from '../../components/svg/InstagramLikedIcon';
import InstagramCommentIcon from '../../components/svg/InstagramCommentIcon';
import { humanizeNumber } from '../../globals';
import { GlobalContext } from '../../global/GlobalContext';

export default function PostScreen({ route, navigation }) {
	const [xmr, setXMR] = React.useState(new XMR());
	const [post, setPost] = React.useState({});
	const [user, setUser] = React.useState({});
	const [isLoading, setIsLoading] = React.useState(true);
	const [refreshing, setRefreshing] = React.useState(false);
	const [comments, setComments] = React.useState([]);
	const [currentUser, setCurrentUser] = React.useState({});

	const [triggerLike, setTriggerLike] = React.useState(false);
	const [triggerUnlike, setTriggerUnlike] = React.useState(false);
	const [isCommentModalOpen, setIsCommentModalOpen] = React.useState(false);

	const onRefresh = React.useCallback(() => {
		async function getData() {
			let _user = await xmr.Guest.User.get_user_id_info(route.params?.userId);
			let _post = await xmr.Guest.Media.get_post_info_via_id(
				route.params?.postId
			);
			let _comments = await xmr.Guest.Media.get_post_comments_via_id(_post.id);
			let _current_user = await xmr.Private.Accounts.get_current_user();

			setUser(_user);
			setPost(_post);
			setComments(_comments);
			setCurrentUser(_current_user);

			setRefreshing(false);
		}

		getData();
	}, []);

	React.useEffect(() => {
		async function getData() {
			let _user = await xmr.Guest.User.get_user_id_info(route.params?.userId);
			let _post = await xmr.Guest.Media.get_post_info_via_id(
				route.params?.postId
			);
			let _comments = await xmr.Guest.Media.get_post_comments_via_id(_post.id);
			let _current_user = await xmr.Private.Accounts.get_current_user();

			setUser(_user);
			setPost(_post);
			setComments(_comments);
			setCurrentUser(_current_user);

			setIsLoading(false);
		}

		getData();
	}, []);


	React.useEffect(() => {
		async function likePost() {
			await xmr.Private.Media.like(post.id);
			setPost({
				...post,
				is_liked_by_me: true,
				like_count: post.like_count + 1,
			});
			setTriggerLike(false);
		}

		if (triggerLike) {
			likePost();
		}
	}, [triggerLike]);

	React.useEffect(() => {
		async function unlikePost() {
			await xmr.Private.Media.unlike(post.id);
			setPost({
				...post,
				is_liked_by_me: false,
				like_count: post.like_count - 1,
			});
			setTriggerUnlike(false);
		}

		if (triggerUnlike) {
			unlikePost();
		}
	}, [triggerUnlike]);

	return (
		<View style={styles.root}>
			{isLoading ? (
				<ActivityIndicator
					size={'large'}
					color={'#999'}
				/>
			) : (
				<View>
					<FlatList
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
							/>
						}
						ListEmptyComponent={
							<View>
								<PostScreenHeader
									user={user}
									navigation={navigation}
								/>

								<PostScreenContent
									user={user}
									post={post}
									navigation={navigation}
									setTriggerLike={setTriggerLike}
									setTriggerUnlike={setTriggerUnlike}
									setIsCommentModalOpen={setIsCommentModalOpen}
								/>

								<CommentsModal
									comments={comments}
									setComments={setComments}
									isCommentModalOpen={isCommentModalOpen}
									setIsCommentModalOpen={setIsCommentModalOpen}
									navigation={navigation}
									post={post}
									currentUser={currentUser}
									refreshing={refreshing}
									onRefresh={onRefresh}
								/>
							</View>
						}
					/>
				</View>
			)}
		</View>
	);
}

function PostScreenHeader({ user, navigation }) {
	let header = `${user.username}'s post`;
	return (
		<View
			style={{
				display: 'flex',
				padding: 16,
				flexDirection: 'row',
				gap: 10,
				alignItems: 'center',
			}}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => {
					navigation.goBack(null);
				}}>
				<Ionicons
					name='arrow-back-outline'
					size={24}
				/>
			</TouchableOpacity>

			<Text style={{ fontWeight: '600', fontSize: 20 }}>{header}</Text>
		</View>
	);
}

function PostScreenContent({
	user,
	post,
	navigation,
	setTriggerLike,
	setTriggerUnlike,
	setIsCommentModalOpen,
}) {
	return (
		<View>
			<View
				style={{
					padding: 10,
					flexDirection: 'row',
					alignItems: 'center',
					gap: 10,
				}}>
				<Image
					source={{
						uri: HTTPS_PREFIX + `/${user.username}/avatar?time=${new Date()}`,
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
							id: user.id,
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
							{user.username}
						</Text>

						{user.is_verified ? (
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
				source={{ uri: `${HTTPS_PREFIX}/rest/guest/media/${post.short_code}` }}
				style={{
					height: 400,
					width: '100%',
				}}
			/>

			<View
				style={{
					paddingHorizontal: 12,
					paddingTop: 12,
					flexDirection: 'row',
					gap: 16,
					alignItems: 'center',
				}}>
				{post.is_liked_by_me ? (
					<TouchableOpacity
						onPress={() => {
							setTriggerUnlike(true);
						}}>
						<InstagramLikedIcon />
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={() => {
							setTriggerLike(true);
						}}>
						<InstagramLikeIcon />
					</TouchableOpacity>
				)}

				<TouchableOpacity
					onPress={() => {
						setIsCommentModalOpen(true);
					}}>
					<InstagramCommentIcon />
				</TouchableOpacity>
			</View>

			<View
				style={{
					paddingHorizontal: 12,
					paddingTop: 12,
					flexDirection: 'row',
					gap: 12,
				}}>
				<Text
					style={{
						fontWeight: '500',
						fontSize: 17,
					}}>
					{humanizeNumber(post.like_count)} likes
				</Text>
			</View>

			<Text
				style={{
					paddingHorizontal: 12,
					paddingTop: 6,
					fontWeight: '500',
					fontSize: 17,
				}}>
				{user.username}
				<Text
					style={{
						fontWeight: '400',
						fontSize: 15,
					}}>
					{' '}
					{post.caption}
				</Text>
			</Text>

			<View
				style={{
					paddingHorizontal: 12,
					paddingTop: 6,
					fontWeight: '500',
					fontSize: 17,
				}}>
				<TouchableOpacity
					onPress={() => {
						setIsCommentModalOpen(true);
					}}>
					<Text
						style={{
							color: '#666',
							fontSize: 15,
						}}>
						View all {post.comment_count} comments...
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

function CommentsModal({
	comments,
	setComments,
	isCommentModalOpen,
	setIsCommentModalOpen,
	navigation,
	post,
	currentUser,
	refreshing,
	onRefresh,
}) {
	return (
		<Modal
			visible={isCommentModalOpen}
			onRequestClose={() => setIsCommentModalOpen(false)}
			animationType='slide'>
			<View style={styles.root}>
				<CommentsModalHeader setIsCommentModalOpen={setIsCommentModalOpen} />
				<CommentsModalContent
					navigation={navigation}
					comments={comments}
					setComments={setComments}
					post={post}
					currentUser={currentUser}
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
				<CommentsModalTextBox
					navigation={navigation}
					comments={comments}
					setComments={setComments}
					post={post}
					currentUser={currentUser}
				/>
			</View>
		</Modal>
	);
}

function CommentsModalTextBox({
	navigation,
	currentUser,
	comments,
	setComments,
	post,
}) {
	const [xmr, setXMR] = React.useState(new XMR());
	const [comment, setComment] = React.useState('');
	const { myProfilePhoto } = React.useContext(GlobalContext);

	const canSend = comment.length !== 0;

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
				<TouchableOpacity onPress={() => {}}>
					<Image
						source={{
							uri: myProfilePhoto,
						}}
						height={36}
						width={36}
						style={{
							borderRadius: 100,
						}}
					/>
				</TouchableOpacity>

				<TextInput
					placeholder={`Add a comment as @${currentUser.username}...`}
					onChangeText={setComment}
					value={comment}
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

							xmr.Private.Media.create_comment(post.id, comment)
								.then(() => {
									xmr.Guest.Media.get_post_comments_via_id(post.id).then((x) =>
										setComments(x)
									);
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
									setComment('');
								});

						}
					}}
				/>

				<TouchableOpacity
					onPress={() => {
						if (!canSend) {
							return;
						}

						xmr.Private.Media.create_comment(post.id, comment)
							.then(() => {
								xmr.Guest.Media.get_post_comments_via_id(post.id).then(
									(comments) => setComments(comments)
								);
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
								setComment('');
							});
					}}>
					{canSend ? (
						<Text style={{ color: 'pink' }}>Post</Text>
					) : (
						<Text style={{ color: '#ccc' }}>Post</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

function CommentsModalContent({
	navigation,
	comments,
	setComments,
	post,
	currentUser,
	refreshing,
	onRefresh,
}) {
	return (
		<View style={styles.root}>
			<FlatList
				data={comments}
				renderItem={({ item }) => (
					<InstagramComment
						navigation={navigation}
						comment={item}
					/>
				)}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
			/>
		</View>
	);
}

function InstagramComment({ navigation, comment }) {
	return (
		<View
			style={{
				display: 'flex',
				flexDirection: 'row',
				padding: 12,
				gap: 2,
				alignItems: 'center',
			}}>
			<Image
				source={{
					uri:
						HTTPS_PREFIX +
						`/${comment.owner.username}/avatar?time=${new Date()}`,
				}}
				height={36}
				width={36}
				style={{
					borderRadius: 100,
				}}
			/>

			<Text
				style={{
					paddingHorizontal: 6,
					fontWeight: '500',
					fontSize: 15,
				}}>
				{comment.owner.username}

				<Text
					style={{
						fontWeight: '400',
						fontSize: 15,
						overflow: 'hidden',
					}}>
					{' '}
					{comment.content}
				</Text>
			</Text>
		</View>
	);
}

function CommentsModalHeader({ setIsCommentModalOpen }) {
	return (
		<View
			style={{
				display: 'flex',
				padding: 16,
				flexDirection: 'row',
				gap: 10,
				alignItems: 'center',
			}}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => {
					setIsCommentModalOpen(false);
				}}>
				<Ionicons
					name='arrow-back-outline'
					size={24}
				/>
			</TouchableOpacity>

			<Text style={{ fontWeight: '600', fontSize: 20 }}>Comments</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
});
