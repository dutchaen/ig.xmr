import React from 'react';
import {
	StyleSheet,
	View,
	Modal,
	TouchableOpacity,
	Text,
	ActivityIndicator,
	Image,
	TextInput,
} from 'react-native';
import { GlobalContext } from '../../global/GlobalContext';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import XMR from '../../xmr';
import { sleep } from '../../xmr';

export default function CreatePostScreen({ navigation }) {
	const [xmr, setXMR] = React.useState(new XMR());
	const [isPosting, setIsPosting] = React.useState(false);
	const [image, setImage] = React.useState(null);
	const [caption, setCaption] = React.useState('');

	useFocusEffect(
		React.useCallback(() => {
			const pickImage = async () => {
				let result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 1,
					base64: true,
				});

				if (!result.canceled) {
					let b64 = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;

					setImage({
						b64: b64,
						asset: result.assets[0],
					});
				} else {
					navigation.goBack(null);
				}
			};

			pickImage();
		}, [])
	);

	return (
		<View style={styles.root}>
			{image === null ? (
				<View></View>
			) : (
				<View style={[styles.root, { flexDirection: 'column' }]}>
					<PostScreenHeader
						xmr={xmr}
						navigation={navigation}
						isPosting={isPosting}
						setIsPosting={setIsPosting}
						image={image}
						setImage={setImage}
						caption={caption}
					/>

					<PostScreenContent
						image={image}
						caption={caption}
						setCaption={setCaption}
					/>
				</View>
			)}
		</View>
	);
}

function PostScreenHeader({
	xmr,
	navigation,
	isPosting,
	setIsPosting,
	image,
	setImage,
	caption,
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
				disabled={isPosting}
				onPress={() => {
					// setIsEditProfileModalVisible(false);
					// setIsSetUsernameModalVisible(false);

					setImage(null);
					navigation.goBack(null);
				}}>
				<Text style={{ fontWeight: '500', fontSize: 15 }}>Cancel</Text>
			</TouchableOpacity>

			<Text style={{ fontWeight: '600', fontSize: 17 }}>Share Post</Text>

			<TouchableOpacity
				disabled={isPosting}
				onPress={async () => {
					setIsPosting(true);

					try {
						await sleep(2000);
						await xmr.Private.Media.create(image.b64, caption);

						setIsPosting(false);
						setImage(null);
						navigation.goBack(null);
					} catch (e) {
						try {
							let error_json = JSON.parse(e.message);
							Alert.alert(error_json['error']);
							setIsPosting(false);
							setImage(null);
							navigation.goBack(null);
						} catch {
							/* */
							console.error(e.message);
						}
					}
				}}>
				{isPosting ? (
					<ActivityIndicator
						size='small'
						color={'#aaa'}
					/>
				) : (
					<Text style={{ fontWeight: '500', fontSize: 15 }}>Post</Text>
				)}
			</TouchableOpacity>
		</View>
	);
}

function PostScreenContent({ image, caption, setCaption }) {
	return (
		<View
			style={{
				display: 'flex',
				flexDirection: 'row',
				padding: 30,
				gap: 30,
				borderBottomWidth: 0.2,
				borderColor: '#ccc',
			}}>
			<Image
				source={{ uri: image.asset.uri }}
				height={75}
				width={75}
			/>

			<TextInput
				value={caption}
				onChangeText={setCaption}
				placeholder='Add a caption... #DoItForTheGram'
				multiline={true}
				style={{
					flex: 1,
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
});
