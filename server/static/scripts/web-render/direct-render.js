function Page_RenderDirectV1Page(contacts) {
    var xmlns = 'http://www.w3.org/2000/svg';

    Page_NavbarSetStandby();
    Page_SetDirectSelectedIcon();

    Page_RemoveAllChildNodes(
        document.getElementById('instagram-page-content-container')
    );

    let instagram_direct_box_container0 = document.createElement('div');
    instagram_direct_box_container0.className =
        'instagram-direct-box-container';
    instagram_direct_box_container0.id = 'instagram-direct-box-container';

    let instagram_direct_contact_container0 = document.createElement('div');
    instagram_direct_contact_container0.className =
        'instagram-direct-contact-container';

    let instagram_direct_contact_top_bar_container0 =
        document.createElement('div');
    instagram_direct_contact_top_bar_container0.className =
        'instagram-direct-contact-top-bar-container';

    let instagram_direct_contact_top_bar0 = document.createElement('div');
    instagram_direct_contact_top_bar0.className =
        'instagram-direct-contact-top-bar';

    let var_000 = document.createElement('a');

    var_000.innerText = 'Direct';

    instagram_direct_contact_top_bar0.appendChild(var_000);

    instagram_direct_contact_top_bar_container0.appendChild(
        instagram_direct_contact_top_bar0
    );

    let instagram_contact_list_container0 = document.createElement('div');
    instagram_contact_list_container0.className =
        'instagram-contact-list-container';

    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];

        let instagram_contact0 = document.createElement('div');
        instagram_contact0.className = 'instagram-contact';
        instagram_contact0.id = `instagram-contact-${contact.id}`;
        instagram_contact0.onclick = async (e) => {
            let messages = await xmr.Private.Direct.get_messages(contact.id);
            Page_RenderDirectV1MessageContainer(
                contact,
                IGDirectMessage.from_json(messages)
            );
        };

        let instagram_my_icon = document.createElement('img');
        instagram_my_icon.id = 'instagram-my-icon';
        instagram_my_icon.className = 'instagram-toolbox-icon';

        instagram_my_icon.src = `/${contact.reciptent.username}/avatar`;

        instagram_my_icon.setAttribute('draggable', 'false');
        instagram_my_icon.setAttribute('height', '50');
        instagram_my_icon.setAttribute('width', '50');
        let instagram_contact_info0 = document.createElement('div');
        instagram_contact_info0.className = 'instagram-contact-info';

        let instagram_contact_username_container0 =
            document.createElement('div');
        instagram_contact_username_container0.className =
            'instagram-contact-username-container';

        let instagram_contact_username = document.createElement('strong');

        if (contact.is_opened) {
            instagram_contact_username.className =
                'instagram-contact-username-opened';
        } else {
            instagram_contact_username.className =
                'instagram-contact-username-unopened';
        }

        instagram_contact_username.innerText = contact.reciptent.username;
        instagram_contact_username.onclick = (e) => {};

        let var_001 = document.createElementNS(xmlns, 'svg');
        var_001.setAttribute('aria-label', 'Verified');
        var_001.setAttribute('fill', 'rgb(0, 149, 246)');
        var_001.setAttribute('height', '13');
        var_001.setAttribute('role', 'img');
        var_001.setAttribute('viewBox', '0 0 40 40');
        var_001.setAttribute('width', '13');
        var_001.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        let var_002 = document.createElement('title');

        var_002.innerText = 'Verified';

        let var_003 = document.createElementNS(xmlns, 'path');
        var_003.setAttribute('class', 'instagram-direct-verified-badge');
        var_003.setAttribute(
            'd',
            'M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z'
        );
        var_003.setAttribute('fill-rule', 'evenodd');

        var_001.appendChild(var_002);
        var_001.appendChild(var_003);

        instagram_contact_username_container0.appendChild(
            instagram_contact_username
        );

        if (contact.is_verified) {
            instagram_contact_username_container0.appendChild(var_001);
        }

        let instagram_contact_msg_snippet = document.createElement('a');

        if (contact.is_opened) {
            instagram_contact_msg_snippet.className =
                'instagram-contact-msg-snippet';
        } else {
            instagram_contact_msg_snippet.className =
                'instagram-contact-msg-snippet-unopened';
        }
        instagram_contact_msg_snippet.innerText = contact.preview_message;

        instagram_contact_info0.appendChild(
            instagram_contact_username_container0
        );
        instagram_contact_info0.appendChild(instagram_contact_msg_snippet);

        instagram_contact0.appendChild(instagram_my_icon);
        instagram_contact0.appendChild(instagram_contact_info0);

        instagram_contact_list_container0.appendChild(instagram_contact0);
    }

    instagram_direct_contact_container0.appendChild(
        instagram_direct_contact_top_bar_container0
    );
    instagram_direct_contact_container0.appendChild(
        instagram_contact_list_container0
    );

    instagram_direct_box_container0.appendChild(
        instagram_direct_contact_container0
    );

    let container = document.getElementById(
        'instagram-page-content-container'
    );
    container.appendChild(instagram_direct_box_container0);
}

function Page_Direct_RerenderAllMessages(messages) {
    let messageListElement = document.getElementsByClassName(
        'instagram-direct-message-list-container'
    )[0];
    Page_RemoveAllChildNodes(messageListElement);

    for (let i = 0; i < messages.length; i++) {
        let msg = messages[i];

        let instagram_direct_message0 = document.createElement('div');
        if (msg.is_mine) {
            instagram_direct_message0.className = msg.is_heart
                ? 'instagram-direct-my-heart'
                : 'instagram-direct-my-message';
        } else {
            instagram_direct_message0.className = msg.is_heart
                ? 'instagram-direct-their-heart'
                : 'instagram-direct-their-message';
        }

        let var_003 = undefined;
        if (msg.is_heart) {
            var_003 = IG_RenderDirectHeart();
        } else {
            var_003 = document.createElement('a');
            var_003.innerText = msg.text;
        }

        instagram_direct_message0.appendChild(var_003);
        messageListElement.appendChild(instagram_direct_message0);
    }
}

function Page_RenderDirectV1MessageContainer(contact, messages) {
    var xmlns = 'http://www.w3.org/2000/svg';

    messages = messages.reverse();
    let x = document.getElementsByClassName(
        'instagram-direct-message-container'
    )[0];
    if (x !== undefined) {
        Page_RemoveAllChildNodes(x);
        x.remove();
    }

    let instagram_direct_message_container0 = document.createElement('div');
    instagram_direct_message_container0.className =
        'instagram-direct-message-container';

    let instagram_direct_message_top_bar_container0 =
        document.createElement('div');
    instagram_direct_message_top_bar_container0.className =
        'instagram-direct-message-top-bar-container';

    let instagram_direct_message_top_bar0 = document.createElement('div');
    instagram_direct_message_top_bar0.className =
        'instagram-direct-message-top-bar';

    let instagram_pfp0 = document.createElement('img');
    instagram_pfp0.className = 'instagram-pfp';
    instagram_pfp0.src = `/${contact.reciptent.username}/avatar`;
    instagram_pfp0.setAttribute('draggable', 'false');
    instagram_pfp0.setAttribute('height', '36');
    instagram_pfp0.setAttribute('width', '36');
    let instagram_contact_username_container0 = document.createElement('div');
    instagram_contact_username_container0.className =
        'instagram-contact-username-container';
    instagram_contact_username_container0.onclick = (e) => {
        window.location.href = '/' + contact.reciptent.username;
    };

    let instagram_contact_username = document.createElement('strong');
    instagram_contact_username.className = 'instagram-contact-username';

    instagram_contact_username.innerText = contact.reciptent.username;

    let var_000 = document.createElementNS(xmlns, 'svg');
    var_000.setAttribute('aria-label', 'Verified');
    var_000.setAttribute('fill', 'rgb(0, 149, 246)');
    var_000.setAttribute('height', '14');
    var_000.setAttribute('role', 'img');
    var_000.setAttribute('viewBox', '0 0 40 40');
    var_000.setAttribute('width', '14');

    let var_001 = document.createElement('title');

    var_001.innerText = 'Verified';

    let var_002 = document.createElementNS(xmlns, 'path');
    var_002.setAttribute(
        'd',
        'M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z'
    );
    var_002.setAttribute('fill-rule', 'evenodd');

    var_000.appendChild(var_001);
    var_000.appendChild(var_002);

    instagram_contact_username_container0.appendChild(
        instagram_contact_username
    );

    if (contact.preview_sender.is_verified) {
        instagram_contact_username_container0.appendChild(var_000);
    }

    instagram_direct_message_top_bar0.appendChild(instagram_pfp0);
    instagram_direct_message_top_bar0.appendChild(
        instagram_contact_username_container0
    );

    instagram_direct_message_top_bar_container0.appendChild(
        instagram_direct_message_top_bar0
    );

    let instagram_direct_message_list_container0 =
        document.createElement('div');
    instagram_direct_message_list_container0.className =
        'instagram-direct-message-list-container';
    instagram_direct_message_list_container0.setAttribute(
        'xmr-contact-id',
        `${contact.id}`
    );

    // if we have scrolled to the top of the current messages, load more messages
    instagram_direct_message_list_container0.onscroll = async (e) => {
        let scrollTop = instagram_direct_message_list_container0.scrollTop;

        let last_item =
            instagram_direct_message_list_container0.children.item(0);

        if (scrollTop <= 0) {
            let last_message = messages[0];

            let json = await xmr.Private.Direct.get_messages_before(
                contact.id,
                last_message.id
            );

            let previous_messages = IGDirectMessage.from_json(json).reverse();

            messages = previous_messages.concat(messages);

            let top = instagram_direct_message_list_container0.scrollHeight;

            Page_Direct_RerenderAllMessages(messages);
            let new_top = instagram_direct_message_list_container0.scrollHeight;

            instagram_direct_message_list_container0.scroll(0, new_top - top);
        }
    };

    for (let i = 0; i < messages.length; i++) {
        let msg = messages[i];

        let instagram_direct_message0 = document.createElement('div');
        if (msg.is_mine) {
            instagram_direct_message0.className = msg.is_heart
                ? 'instagram-direct-my-heart'
                : 'instagram-direct-my-message';
        } else {
            instagram_direct_message0.className = msg.is_heart
                ? 'instagram-direct-their-heart'
                : 'instagram-direct-their-message';
        }

        let var_003 = undefined;
        if (msg.is_heart) {
            var_003 = IG_RenderDirectHeart();
        } else {
            var_003 = document.createElement('a');
            var_003.innerText = msg.text;
        }

        instagram_direct_message0.appendChild(var_003);
        instagram_direct_message_list_container0.appendChild(
            instagram_direct_message0
        );
    }

    let instagram_direct_message_textbox_container0 =
        document.createElement('div');
    instagram_direct_message_textbox_container0.className =
        'instagram-direct-message-textbox-container';

    let instagram_direct_message_textbox0 = document.createElement('div');
    instagram_direct_message_textbox0.className =
        'instagram-direct-message-textbox';

    let var_005 = document.createElementNS(xmlns, 'svg');
    var_005.setAttribute('aria-label', 'Choose an emoji');
    var_005.setAttribute('class', 'x1lliihq x1n2onr6 x5n08af');
    var_005.setAttribute('fill', 'currentColor');
    var_005.setAttribute('height', '24');
    var_005.setAttribute('role', 'img');
    var_005.setAttribute('viewBox', '0 0 24 24');
    var_005.setAttribute('width', '24');

    let var_006 = document.createElement('title');

    var_006.innerText = 'Choose an emoji';

    let var_007 = document.createElementNS(xmlns, 'path');
    var_007.setAttribute(
        'd',
        'M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z'
    );

    var_005.appendChild(var_006);
    var_005.appendChild(var_007);

    let instagram_direct_textarea = document.createElement('textarea');
    instagram_direct_textarea.id = 'instagram-direct-textarea';
    instagram_direct_textarea.setAttribute('placeholder', 'Message...');
    instagram_direct_textarea.onkeypress = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (instagram_direct_textarea.value == '') {
                return;
            }

            let result = await xmr.Private.Direct.send_text(
                contact.id,
                instagram_direct_textarea.value
            );

            let instagram_direct_message0 = document.createElement('div');
            instagram_direct_message0.className = 'instagram-direct-my-message';

            let var_003 = document.createElement('a');
            var_003.innerText = instagram_direct_textarea.value;

            instagram_direct_message0.appendChild(var_003);
            instagram_direct_message_list_container0.appendChild(
                instagram_direct_message0
            );
            instagram_direct_message_list_container0.scroll(
                0,
                instagram_direct_message_list_container0.scrollHeight
            );

            let contact_element_id = `instagram-contact-${contact.id}`;
            let snippet_element = document
                .getElementById(contact_element_id)
                .getElementsByClassName(
                    'instagram-contact-msg-snippet-unopened'
                )[0];

            snippet_element.innerText = `You: ${instagram_direct_textarea.value}`;

            instagram_direct_textarea.value = '';
            var_008.disabled = true;
        }
    };

    instagram_direct_textarea.innerText = '';

    let var_008 = document.createElement('button');

    var_008.onclick = async (e) => {
        if (instagram_direct_textarea.value == '') {
            return;
        }

        let result = await xmr.Private.Direct.send_text(
            contact.id,
            instagram_direct_textarea.value
        );
        let instagram_direct_message0 = document.createElement('div');
        instagram_direct_message0.className = 'instagram-direct-my-message';

        let var_003 = document.createElement('a');
        var_003.innerText = instagram_direct_textarea.value;

        instagram_direct_message0.appendChild(var_003);
        instagram_direct_message_list_container0.appendChild(
            instagram_direct_message0
        );
        instagram_direct_message_list_container0.scroll(
            0,
            instagram_direct_message_list_container0.scrollHeight
        );
        instagram_direct_textarea.value = '';
        var_008.disabled = true;
    };
    var_008.disabled = true;
    var_008.innerText = 'Send';

    instagram_direct_textarea.onkeyup = (e) => {
        if (instagram_direct_textarea.value == '') {
            var_008.disabled = true;
        } else {
            var_008.disabled = false;
        }
    };

    instagram_direct_message_textbox0.appendChild(var_005);
    instagram_direct_message_textbox0.appendChild(instagram_direct_textarea);
    instagram_direct_message_textbox0.appendChild(var_008);

    instagram_direct_message_textbox_container0.appendChild(
        instagram_direct_message_textbox0
    );

    instagram_direct_message_container0.appendChild(
        instagram_direct_message_top_bar_container0
    );
    instagram_direct_message_container0.appendChild(
        instagram_direct_message_list_container0
    );
    instagram_direct_message_container0.appendChild(
        instagram_direct_message_textbox_container0
    );

    let content = document.getElementById('instagram-direct-box-container');

    content.appendChild(instagram_direct_message_container0);
    instagram_direct_message_list_container0.scroll(
        0,
        instagram_direct_message_list_container0.scrollHeight
    );
}

