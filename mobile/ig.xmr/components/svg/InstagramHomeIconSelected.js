import Svg, { Path } from 'react-native-svg';

export default function InstagramHomeIconSelected({}) {
	return (
		<Svg
			width={24}
			height={24}
			fill='currentColor'
			aria-label='Home'>
			<Path
				fill='#000'
				stroke='currentColor'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z'
			/>
		</Svg>
	);
}
