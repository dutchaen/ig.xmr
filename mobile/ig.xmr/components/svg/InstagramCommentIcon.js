import Svg, { Path } from 'react-native-svg';

export default function InstagramCommentIcon({}) {
	return (
		<Svg
			width={24}
			height={24}
			fill='#000'
			aria-label='Comment'
			viewBox='0 0 24 24'>
			<Path
				fill='none'
				stroke='#000'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
			/>
		</Svg>
	);
}
