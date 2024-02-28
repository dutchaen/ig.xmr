
function Page_ShowMessageBox(title, message, events) {
	var xmlns = 'http://www.w3.org/2000/svg';

	let instagram_dialog_container0 = document.createElement('div');
	instagram_dialog_container0.className = 'instagram-dialog-container';

	let instagram_main_dialog = document.createElement('dialog');
	instagram_main_dialog.className = 'instagram-main-dialog';

	let instagram_main_dialog_header0 = document.createElement('strong');
	instagram_main_dialog_header0.className = 'instagram-main-dialog-header';

	instagram_main_dialog_header0.innerText = title;

	let instagram_main_dialog_message0 = document.createElement('a');
	instagram_main_dialog_message0.className =
		'instagram-main-dialog-message';

	instagram_main_dialog_message0.innerText = message;

	instagram_main_dialog.appendChild(instagram_main_dialog_header0);
	instagram_main_dialog.appendChild(instagram_main_dialog_message0);

	let instagram_dialog_button_container = document.createElement('div');
	instagram_dialog_button_container.className =
		'instagram-dialog-button-container';

	instagram_main_dialog.appendChild(instagram_dialog_button_container);

	for (let i = 0; i < events.length; i++) {
		let event = events[i];
		let instagram_main_dialog_button0 = document.createElement('button');
		if (event.is_highlighted) {
			instagram_main_dialog_button0.className =
				'instagram-main-dialog-button-highlighted';
		} else {
			instagram_main_dialog_button0.className =
				'instagram-main-dialog-button';
		}

		instagram_main_dialog_button0.onclick = (e) => {
			event.onClick();

			instagram_main_dialog.close();
			// if this is the last dialog element, make the scroll wheel available
			if (
				document.getElementsByClassName('instagram-dialog-container')
					.length == 1
			) {
				document.querySelector('body').style.overflow = 'visible';
			}

			// remove the current dialog from html
			if (
				instagram_main_dialog.parentElement !== undefined &&
				instagram_main_dialog.parentElement !== null
			)
				instagram_main_dialog.parentElement.remove();
		};

		instagram_main_dialog_button0.innerText = event.text;
		instagram_dialog_button_container.appendChild(
			instagram_main_dialog_button0
		);
	}

	instagram_dialog_container0.appendChild(instagram_main_dialog);

	document
		.getElementsByTagName('body')[0]
		.appendChild(instagram_dialog_container0);

	document.querySelector('body').style.overflow = 'hidden';
	instagram_main_dialog.showModal();
}

function IG_IsVaildUsername(piece) {
	if (!piece.startsWith('@')) {
		return false;
	}

	if (piece.length < 1 || piece.length > 32) {
		return false;
	}

	const charset = 'abcdefghijklmnopqrstuvwxyz1234567890_.';

	let username_piece = piece.substring(1);
	for (let i = 0; i < username_piece.length; i++) {
		if (!charset.includes(username_piece.charAt(username_piece))) {
			return false;
		}
	}

	return true;
}

function IG_RenderComment(text) {
	let pieces = text.split(' ');

	let builder = '';
	let text_element = document.createElement('a');
	for (let i = 0; i < pieces.length; i++) {
		let piece = pieces[i];

		if (IG_IsVaildUsername(piece)) {
			let textNode = document.createTextNode(builder);
			text_element.appendChild(textNode);

			let mentionNode = document.createElement('strong');
			mentionNode.className = 'instagram-post-comment-mention';
			mentionNode.innerText = `${piece} `;
			mentionNode.onclick = (e) => {
				window.location.href = `/${piece}`;
			};
			text_element.appendChild(mentionNode);

			builder = '';

			continue;
		}

		builder += `${piece} `;
	}

	let textNode = document.createTextNode(builder);
	text_element.appendChild(textNode);

	return text_element;
}

function IG_RenderDirectHeart() {
	var xmlns = 'http://www.w3.org/2000/svg';
	let var_0032 = document.createElementNS(xmlns, 'svg');
	var_0032.setAttribute('version', '1.1');
	var_0032.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	var_0032.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	var_0032.setAttribute('width', '48');
	var_0032.setAttribute('height', '48');
	var_0032.setAttribute('viewBox', '0,0,256,256');

	let var_0033 = document.createElementNS(xmlns, 'g');
	var_0033.setAttribute('fill', '#ff5151');
	var_0033.setAttribute('fill-rule', 'nonzero');
	var_0033.setAttribute('stroke', 'none');
	var_0033.setAttribute('stroke-width', '1');
	var_0033.setAttribute('stroke-linecap', 'butt');
	var_0033.setAttribute('stroke-linejoin', 'miter');
	var_0033.setAttribute('stroke-miterlimit', '10');
	var_0033.setAttribute('stroke-dasharray', '');
	var_0033.setAttribute('stroke-dashoffset', '0');
	var_0033.setAttribute('font-family', 'none');
	var_0033.setAttribute('font-weight', 'none');
	var_0033.setAttribute('font-size', 'none');
	var_0033.setAttribute('text-anchor', 'none');
	var_0033.setAttribute('style', 'mix-blend-mode: normal');

	let var_0034 = document.createElementNS(xmlns, 'g');
	var_0034.setAttribute('transform', 'scale(5.33333,5.33333)');

	let var_0035 = document.createElementNS(xmlns, 'path');
	var_0035.setAttribute(
		'd',
		'M34,6c-4.176,0 -7.852,2.137 -10,5.372c-2.149,-3.235 -5.824,-5.372 -10,-5.372c-6.627,0 -12,5.373 -12,12c0,11.943 22,24 22,24c0,0 22,-11.955 22,-24c0,-6.627 -5.373,-12 -12,-12'
	);

	var_0034.appendChild(var_0035);

	var_0033.appendChild(var_0034);

	var_0032.appendChild(var_0033);

	return var_0032;
}
