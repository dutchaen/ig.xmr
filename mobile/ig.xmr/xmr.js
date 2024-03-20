import { HTTPS_PREFIX } from './constants';

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getProfilePhotoUri(username) {
	return HTTPS_PREFIX + `/${username}/avatar?time=${new Date()}`;
}

class XMR {
	constructor() {
		this.Guest = {
			login: async (identifier, password) => {
				const response = await fetch(HTTPS_PREFIX + '/rest/guest/login', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ identifier: identifier, password: password }),
				});

				const json = await response.json();
				if (response.status !== 200) {
					console.log(json);
					throw new Error(JSON.stringify(json));
				}

				await sleep(2000);

				console.log(response.headers);
				console.log(response.headers.get('set-cookie'));
				let sid_set_cookie = response.headers.get('set-cookie');
				return [sid_set_cookie, json];
			},

			register: async (full_name, username, password, email, gender) => {
				if (gender >= 1) {
					gender = 1;
				} else {
					gender = 0;
				}

				const response = await fetch(
					HTTPS_PREFIX + '/rest/guest/web_ajax_signup',
					{
						method: 'POST',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							full_name: full_name,
							username: username,
							password: password,
							email: email,
							gender: gender,
						}),
					}
				);

				const json = await response.json();
				if (response.status !== 200) {
					console.log(json);
					throw new Error(JSON.stringify(json));
				}

				await sleep(2000);
				return json;
			},

			User: {
				get_user_id_info: async (user_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/guest/user/${user_id}/id/info`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				get_medias_via_user_id: async (user_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/guest/user/${user_id}/medias`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				get_username_info: async (username) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/guest/user/${username}/username/info`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				search: async (username) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/guest/user/search?query=${username}`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
			},

			Media: {
				get_post_info_via_shortcode: async (shortcode) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/guest/media/${shortcode}/shortcode/info`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				get_post_info_via_id: async (id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/guest/media/${id}/id/info`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				get_post_comments_via_id: async (id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/guest/media/${id}/comments`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const text = await response.text();
					

					const json = JSON.parse(text);
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
			},

			GetUser: () => {
				return this.User;
			},

			GetMedia: () => {
				return this.Media;
			},
		};

		this.Private = {
			User: {
				create_friendship: async (user_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/user/${user_id}/create_friendship`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},

				destroy_friendship: async (user_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/user/${user_id}/destroy_friendship`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
			},

			Media: {
				create: async (image, caption) => {
					let payload = { media_base64: image, caption: caption };

					console.log(payload['caption']);

					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/media/create`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ media_base64: image, caption: caption }),
						}
					);

					let data = await response.text();
					console.log(data);

					const json = JSON.parse(data);
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				destroy: async (post_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/media/${post_id}/destroy`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				like: async (post_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/media/${post_id}/like`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const text = await response.text();
					

					const json = JSON.parse(text);
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				unlike: async (post_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/media/${post_id}/unlike`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const text = await response.text();
					

					const json = JSON.parse(text);
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				create_comment: async (post_id, comment_text) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/media/${post_id}/create_comment`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ comment: comment_text }),
						}
					);

					const text = await response.text();
					

					const json = JSON.parse(text);
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				destroy_comment: async (post_id, comment_id) => {
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/media/${post_id}/comment/${comment_id}/destroy`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},

				like_comment: async (post_id, comment_id) => {
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/media/${post_id}/comment/${comment_id}/like`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},

				unlike_comment: async (post_id, comment_id) => {
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/media/${post_id}/comment/${comment_id}/unlike`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				timeline: async () => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/media/timeline`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
			},

			Direct: {
				inbox: async () => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/direct/inbox`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				create_thread: async (user_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/direct/thread/create`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ with: user_id }),
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				get_messages: async (thread_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/direct/thread/${thread_id}/messages`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				get_messages_before: async (thread_id, before) => {
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/direct/thread/${thread_id}/previous_messages?before=${before}`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}
					return json;
				},
				send_text: async (thread_id, text) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/direct/thread/${thread_id}/send_text`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ text: text }),
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				like_message: async (thread_id, message_id) => {
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/direct/thread/${thread_id}/message/${message_id}/like`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				unlike_message: async (thread_id, message_id) => {
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/direct/thread/${thread_id}/message/${message_id}/unlike`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				delete_message: async (thread_id, message_id) => {
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/direct/thread/${thread_id}/message/${message_id}/delete`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				seen_message: async (thread_id, message_id) => {
					console.log(`ThreadId := ${typeof thread_id} && MessageId := ${typeof message_id}`);
					const response = await fetch(
						HTTPS_PREFIX +
							`/rest/private/direct/thread/${thread_id}/message/${message_id}/seen`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					let data = await response.text();
					console.log(data);

					const json = JSON.parse(data);
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				send_heart: async (thread_id) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/direct/thread/${thread_id}/heart`,
						{
							method: 'POST',
							credentials: 'include',
						}
					);

					return response.ok && !response.redirected;
				},
			},

			Accounts: {
				get_current_user: async () => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/accounts/current_user`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				edit_profile: async (
					full_name,
					username,
					email,
					bio,
					website,
					gender
				) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/accounts/edit_profile`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								full_name: full_name,
								username: username,
								email: email,
								bio: bio,
								website: website,
								gender: gender,
							}),
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				set_username: async (username) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/accounts/set_username`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								username: username,
							}),
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				change_password: async (old_password, new_password) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/accounts/change_password`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								old_password: old_password,
								new_password: new_password,
							}),
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				change_profile_photo: async (profile_photo) => {
					const response = await fetch(
						HTTPS_PREFIX + `/rest/private/accounts/change_profile_photo`,
						{
							method: 'POST',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								photo: profile_photo,
							}),
						}
					);

					const json = await response.json();
					if (response.status !== 200) {
						console.log(json);
						throw new Error(JSON.stringify(json));
					}

					return json;
				},
				signout: async () => {
					await fetch(HTTPS_PREFIX + `/rest/private/accounts/signout`, {
						method: 'GET',
						credentials: 'include',
					});
				},
			},
		};
	}

	async verify_credentials(cookie) {
		console.log(cookie);
		try {
			const resp = await fetch(
				HTTPS_PREFIX + `/rest/private/accounts/current_user`,
				{
					method: 'GET',
					credentials: 'include',
					headers: {
						Cookie: cookie,
					},
					redirect: 'error',
				}
			);

			const text = await resp.json();
			console.log(text);

			return !resp.redirected && resp.ok;
		}
		catch {
			return false;
		}
		
		
		
	}
}

export default XMR;
