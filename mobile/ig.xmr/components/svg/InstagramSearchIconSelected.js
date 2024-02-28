import Svg, { Path } from 'react-native-svg';

export default function InstagramSearchIconSelected({}) {
	return (
		<Svg
			width={24}
			height={24}
			fill='currentColor'
			aria-label='Search'>
			<Path
				fill='none'
				stroke='#000'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5ZM16.511 16.511 22 22'
			/>
		</Svg>
	);
}
