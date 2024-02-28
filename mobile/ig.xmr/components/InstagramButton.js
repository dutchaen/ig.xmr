import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

export default function InstagramButton({
	text,
	onPress,
	style,
	textStyle,
	disabled,
}) {
	style = StyleSheet.flatten([
		{
			width: '100%',
			backgroundColor: 'rgb(230, 230, 230)',
			padding: 8,
			borderRadius: 5,
			marginTop: 5,
		},
		style,
	]);

	textStyle = StyleSheet.flatten([
		{ textAlign: 'center', color: 'black', fontWeight: 500 },
		textStyle,
	]);

	return (
		<TouchableOpacity
			disabled={disabled}
			activeOpacity={0.5}
			onPress={() => {
				if (onPress) {
					onPress();
				}
			}}>
			<View style={[style]}>
				<Text style={textStyle}>{text}</Text>
			</View>
		</TouchableOpacity>
	);
}
