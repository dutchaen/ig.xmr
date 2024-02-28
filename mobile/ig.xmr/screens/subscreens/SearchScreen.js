import React from 'react';
import XMR from '../../xmr';
import {
	FlatList,
	StyleSheet,
	TextInput,
	View,
	Image,
	Text,
	ActivityIndicator,
	Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InstagramVerifiedSvg from '../../components/InstagramVerifiedSvg';
import { HTTPS_PREFIX } from '../../constants';

export default function SearchScreen({ navigation }) {
	const [xmr, setXMR] = React.useState(new XMR());
	const [query, setQuery] = React.useState('');
	const [results, setResults] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		(async () => {
			setIsLoading(true);
			if (query === '') {
				setIsLoading(false);
				setResults([]);
				return;
			}

			let data = await xmr.Guest.User.search(query);
			setResults(data);
			setIsLoading(false);
		})();
	}, [query]);

	return (
		<View style={styles.root}>
			<SearchBar
				query={query}
				setQuery={setQuery}
			/>

			<SearchResults
				xmr={xmr}
				results={results}
				isLoading={isLoading}
				navigation={navigation}
			/>
		</View>
	);
}

function SearchResults({ xmr, results, isLoading, navigation }) {
	return (
		<View style={styles.root}>
			{isLoading ? (
				<ActivityIndicator size='large' />
			) : (
				<View style={styles.root}>
					<FlatList
						data={results}
						renderItem={({ item }) => (
							<InstagramProfileCard
								xmr={xmr}
								profile={item}
								navigation={navigation}
							/>
						)}></FlatList>
				</View>
			)}
		</View>
	);
}

function InstagramProfileCard({ xmr, profile, navigation }) {
	return (
		<View style={[styles.root, { width: '100%' }]}>
			<Pressable
				onPress={() => {
					navigation.navigate('profile', {
						isMine: false,
						id: profile.id,
						hasBack: true,
					});
				}}>
				<View style={[styles.root, { padding: 12, width: '100%' }]}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							alignItems: 'center',
							gap: 10,
						}}>
						<Image
							source={{
								uri: `${HTTPS_PREFIX}/${
									profile.username
								}/avatar?time=${new Date()}`,
							}}
							style={{ height: 50, width: 50, borderRadius: 100 }}
						/>

						<View
							style={{ flex: 1, flexDirection: 'column', paddingVertical: 10 }}>
							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									alignItems: 'center',
									gap: 5,
								}}>
								<Text style={{ fontWeight: 500 }}>{profile.username}</Text>

								{profile.is_verified ? (
									<InstagramVerifiedSvg
										width={12}
										height={12}
									/>
								) : (
									<View></View>
								)}
							</View>

							<View>
								<Text
									style={{
										opacity: 0.7,
									}}>
									{profile.name}
								</Text>
							</View>
						</View>
					</View>
				</View>
			</Pressable>
		</View>
	);
}

function SearchBar({ query, setQuery }) {
	return (
		<View style={{ padding: 10, width: '100%', height: 70 }}>
			<View style={styles.search_bar}>
				<Ionicons
					name='search'
					size={13}
					color={'#999'}
				/>

				<TextInput
					value={query}
					onChangeText={setQuery}
					placeholder='Search...'
					style={{
						flex: 1,
					}}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	search_bar: {
		borderBottomWidth: 0.5,
		borderColor: '#ccc',
		borderRadius: 10,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 5,
		gap: 10,
	},
});
