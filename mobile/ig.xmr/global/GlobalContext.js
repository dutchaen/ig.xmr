import React from 'react';
import { DEFAULT_PROFILE_PHOTO } from '../constants';

const GlobalContext = React.createContext(null);

const GlobalProvider = ({ children }) => {
	const [myProfilePhoto, setMyProfilePhoto] = React.useState(
		DEFAULT_PROFILE_PHOTO
	);

	return (
		<GlobalContext.Provider
			value={{
				myProfilePhoto,
				setMyProfilePhoto,
			}}>
			{children}
		</GlobalContext.Provider>
	);
};

export { GlobalContext, GlobalProvider };
