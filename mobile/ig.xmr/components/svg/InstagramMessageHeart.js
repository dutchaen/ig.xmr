import Svg, { Path } from 'react-native-svg';

export default function InstagramMessageHeart({}) {
	return (
		<Svg
			xmlns='http://www.w3.org/2000/svg'
			width={40}
			height={40}
			viewBox='0 0 256 256'>
			<Path
				fill='pink'
				strokeMiterlimit={10}
				d='M34 6a11.986 11.986 0 0 0-10 5.372C21.851 8.137 18.176 6 14 6 7.373 6 2 11.373 2 18c0 11.943 22 24 22 24s22-11.955 22-24c0-6.627-5.373-12-12-12'
				fontFamily='none'
				fontSize='none'
				fontWeight='none'
				style={{
					mixBlendMode: 'normal',
				}}
				textAnchor='none'
				transform='scale(5.33333)'
			/>
		</Svg>
	);
}
