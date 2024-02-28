class IGPreviewThread {
	constructor (json) {
		this.id = json['id'];    // type: Any || 推断类型: Any
		
		this.is_preview_mine = json['is_preview_mine'];    // type: Any || 推断类型: Boolean

		if (this.is_preview_mine) {
			this.preview_message = `You: ${json['preview_message']}`;    // type: Any || 推断类型: Any
		}
		else {
			this.preview_message = `${json['preview_message']}`;    // type: Any || 推断类型: Any
		}

		this.preview_sender = new IGPreviewSender(json['preview_sender']);    // type: Any || 推断类型: Any
		this.reciptent = new IGPreviewSender(json['reciptent']);    // type: Any || 推断类型: Any
	}

	static from_json (json) {
		let threads = [];

		for (let i = 0; i < json['threads'].length; i++) {
			let thread = new IGPreviewThread(json['threads'][i]);
			threads.push(thread);
		}

		return threads;

	}
}


class IGPreviewSender {
	constructor (json) {
		if (json === null || json === undefined) {
			this.username = 'Instagram User';
			this.id = -1;
			this.is_verified = false;
		}
		else {
			this.username = json['username'];    // type: Any || 推断类型: Any
			this.id = json['id'];    // type: Any || 推断类型: Any
			this.is_verified = json['is_verified'];    // type: Any || 推断类型: Boolean
		}		
	}
}


class IGDirectMessage {
	constructor (json) {
		this.id = json['id'];    // type: Any || 推断类型: Any
		this.text = json['text'];    // type: Any || 推断类型: Any
		this.owner_id = json['owner_id'];    // type: Any || 推断类型: Any
		this.created_at = json['created_at'];    // type: Any || 推断类型: Any
		this.is_mine = json['is_mine'];    // type: Any || 推断类型: Boolean
		this.likers = json['likers'];    // type: Any || 推断类型: ArrayOfPrototypeObject
		this.is_seen = json['is_seen'];    // type: Any || 推断类型: Boolean
		this.is_heart = json['is_heart'];    // type: Any || 推断类型: Boolean
	}

	static from_json (json) {
		let messages = [];

		for (let i = 0; i < json.length; i++) {
			let message = new IGDirectMessage(json[i]);
			messages.push(message);
		}

		return messages;

	}
}

class IGProfile {
	constructor (json) {
		this.id = json['id'];    // type: Any || 推断类型: Any
		this.username = json['username'];    // type: Any || 推断类型: Any
		this.name = json['name'];    // type: Any || 推断类型: Any
		this.bio = json['bio'];    // type: Any || 推断类型: Any
		this.is_verified = json['is_verified'];    // type: Any || 推断类型: Boolean
		this.follower_count = json['follower_count'];    // type: Any || 推断类型: Number
		this.following_count = json['following_count'];    // type: Any || 推断类型: Number
		this.is_following = json['is_following'];
	}
}

class IGCurrentUser {
	constructor (json) {
		this.id = json['id'];    // type: Any || 推断类型: Any
		this.username = json['username'];    // type: Any || 推断类型: Any
		this.email = json['email'];    // type: Any || 推断类型: Any
		this.name = json['name'];    // type: Any || 推断类型: Any
		this.bio = json['bio'];    // type: Any || 推断类型: Any
		this.website = json['website'];    // type: Any || 推断类型: Any
		this.is_verified = json['is_verified'];    // type: Any || 推断类型: Boolean
		this.gender = json['gender'];    // type: Any || 推断类型: Any
	}
}
