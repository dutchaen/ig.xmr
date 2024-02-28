function Page_RenderSettingsPage(acc) {
    var xmlns = 'http://www.w3.org/2000/svg';

    Page_NavbarSetStandby();
    Page_RemoveAllChildNodes(
        document.getElementById('instagram-page-content-container')
    );

    let instagram_settings_box_container0 = document.createElement('div');
    instagram_settings_box_container0.className =
        'instagram-settings-box-container';

    let instagram_settings_sidebar0 = document.createElement('div');
    instagram_settings_sidebar0.className = 'instagram-settings-sidebar';

    let instagram_setting_sidebar_item0 = document.createElement('div');
    instagram_setting_sidebar_item0.className =
        'instagram-setting-sidebar-item';
    instagram_setting_sidebar_item0.onclick = (e) => {
        Page_Settings_RenderEditProfileScreen(acc);
    };

    let var_000 = document.createElement('a');

    var_000.innerText = 'Edit Profile';

    instagram_setting_sidebar_item0.appendChild(var_000);

    let instagram_setting_sidebar_item_selected0 =
        document.createElement('div');
    instagram_setting_sidebar_item_selected0.className =
        'instagram-setting-sidebar-item';
    instagram_setting_sidebar_item_selected0.onclick = (e) => {
        Page_Settings_RenderChangePasswordScreen(acc);
    };

    let var_001 = document.createElement('a');

    var_001.innerText = 'Change Password';

    instagram_setting_sidebar_item_selected0.appendChild(var_001);

    let instagram_setting_sidebar_item1 = document.createElement('div');
    instagram_setting_sidebar_item1.className =
        'instagram-setting-sidebar-item';

    let var_002 = document.createElement('a');

    var_002.innerText = 'Sign out';

    instagram_setting_sidebar_item1.appendChild(var_002);
    instagram_setting_sidebar_item1.onclick = async (e) => {
        Page_ShowMessageBox('Are you sure you want to sign out?', '', [
            new MsgBoxUIEvent(
                'Yes',
                () => {
                    xmr.Private.Accounts.signout().then(() => {
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    });
                },
                true
            ),
            new MsgBoxUIEvent('No', () => {}, false),
        ]);
    };

    instagram_settings_sidebar0.appendChild(instagram_setting_sidebar_item0);
    instagram_settings_sidebar0.appendChild(
        instagram_setting_sidebar_item_selected0
    );
    instagram_settings_sidebar0.appendChild(instagram_setting_sidebar_item1);

    let instagram_settings_content_container0 = document.createElement('div');
    instagram_settings_content_container0.className =
        'instagram-settings-content-container';
    instagram_settings_content_container0.id =
        'instagram-settings-content-container';

    instagram_settings_box_container0.appendChild(
        instagram_settings_sidebar0
    );
    instagram_settings_box_container0.appendChild(
        instagram_settings_content_container0
    );

    let content = document.getElementById('instagram-page-content-container');
    Page_RemoveAllChildNodes(content);
    content.appendChild(instagram_settings_box_container0);
}

function Page_Settings_UnselectAllOptions() {
    let elements = document.getElementsByClassName(
        'instagram-setting-sidebar-item-selected'
    );
    for (let i = 0; i < elements.length; i++) {
        let sidebar_item = elements[i];
        sidebar_item.className = 'instagram-setting-sidebar-item';
    }
}

function Page_Settings_RenderEditProfileScreen(account) {
    var xmlns = 'http://www.w3.org/2000/svg';

    Page_Settings_UnselectAllOptions();
    document.getElementsByClassName(
        'instagram-setting-sidebar-item'
    )[0].className = 'instagram-setting-sidebar-item-selected';

    let instagram_settings_edit_profile_screen0 =
        document.createElement('div');
    instagram_settings_edit_profile_screen0.className =
        'instagram-settings-edit-profile-screen';

    let instagram_settings_edit_profile_change_photo_section0 =
        document.createElement('div');
    instagram_settings_edit_profile_change_photo_section0.className =
        'instagram-settings-edit-profile-change-photo-section';

    let instagram_my_icon = document.createElement('img');
    instagram_my_icon.id = 'instagram-my-icon';
    instagram_my_icon.className = 'instagram-toolbox-icon';
    instagram_my_icon.src = `/${account.username}/avatar`;
    instagram_my_icon.setAttribute('draggable', 'false');
    instagram_my_icon.setAttribute('height', '56');
    instagram_my_icon.setAttribute('width', '56');
    let instagram_setting_edit_profile_username_change_pfp_container0 =
        document.createElement('div');
    instagram_setting_edit_profile_username_change_pfp_container0.className =
        'instagram-setting-edit-profile-username-change-pfp-container';

    let instagram_setting_username_display_text = document.createElement('a');
    instagram_setting_username_display_text.id =
        'instagram-setting-username-display-text';

    instagram_setting_username_display_text.innerText = account.username;

    let attachment = document.createElement('input');
    attachment.type = 'file';
    attachment.className = 'file';
    attachment.id = 'attachment';
    attachment.style = 'display: none;';
    attachment.onchange = (e) => {
        fileSelected(attachment);
    };

    let var_000 = document.createElement('strong');

    var_000.innerText = 'Change Profile Photo';
    var_000.onclick = (e) => {
        openAttachment();
    };

    instagram_setting_edit_profile_username_change_pfp_container0.appendChild(
        instagram_setting_username_display_text
    );
    instagram_setting_edit_profile_username_change_pfp_container0.appendChild(
        attachment
    );
    instagram_setting_edit_profile_username_change_pfp_container0.appendChild(
        var_000
    );

    instagram_settings_edit_profile_change_photo_section0.appendChild(
        instagram_my_icon
    );
    instagram_settings_edit_profile_change_photo_section0.appendChild(
        instagram_setting_edit_profile_username_change_pfp_container0
    );

    let instagram_settings_edit_profile_option0 =
        document.createElement('div');
    instagram_settings_edit_profile_option0.className =
        'instagram-settings-edit-profile-option';

    let var_001 = document.createElement('label');
    var_001.setAttribute('for', 'instagram-name-input');

    var_001.innerText = 'Name';

    let instagram_name_input = document.createElement('input');
    instagram_name_input.type = 'text';
    instagram_name_input.id = 'instagram-name-input';
    instagram_name_input.setAttribute('placeholder', 'Full Name');
    instagram_name_input.value = account.name;

    instagram_settings_edit_profile_option0.appendChild(var_001);
    instagram_settings_edit_profile_option0.appendChild(instagram_name_input);

    let instagram_settings_edit_profile_option1 =
        document.createElement('div');
    instagram_settings_edit_profile_option1.className =
        'instagram-settings-edit-profile-option';

    let var_002 = document.createElement('label');
    var_002.setAttribute('for', 'instagram-username-input');

    var_002.innerText = 'Username';

    let instagram_username_input = document.createElement('input');
    instagram_username_input.type = 'text';
    instagram_username_input.id = 'instagram-username-input';
    instagram_username_input.setAttribute('placeholder', 'Username');
    instagram_username_input.value = account.username;

    instagram_settings_edit_profile_option1.appendChild(var_002);
    instagram_settings_edit_profile_option1.appendChild(
        instagram_username_input
    );

    let instagram_settings_edit_profile_option2 =
        document.createElement('div');
    instagram_settings_edit_profile_option2.className =
        'instagram-settings-edit-profile-option';

    let var_003 = document.createElement('label');
    var_003.setAttribute('for', 'instagram-website-input');

    var_003.innerText = 'Website';

    let instagram_website_input = document.createElement('input');
    instagram_website_input.type = 'text';
    instagram_website_input.id = 'instagram-website-input';
    instagram_website_input.setAttribute('placeholder', 'Website');
    instagram_website_input.value =
        account.website !== null ? account.website : '';

    instagram_settings_edit_profile_option2.appendChild(var_003);
    instagram_settings_edit_profile_option2.appendChild(
        instagram_website_input
    );

    let instagram_settings_edit_profile_option3 =
        document.createElement('div');
    instagram_settings_edit_profile_option3.className =
        'instagram-settings-edit-profile-option';

    let var_004 = document.createElement('label');
    var_004.setAttribute('for', 'instagram-bio-input');

    var_004.innerText = 'Bio';

    let instagram_bio_input = document.createElement('input');
    instagram_bio_input.type = 'text';
    instagram_bio_input.id = 'instagram-bio-input';
    instagram_bio_input.setAttribute('placeholder', 'Add a biography...');
    instagram_bio_input.value = account.bio;

    instagram_settings_edit_profile_option3.appendChild(var_004);
    instagram_settings_edit_profile_option3.appendChild(instagram_bio_input);

    let instagram_settings_edit_profile_option4 =
        document.createElement('div');
    instagram_settings_edit_profile_option4.className =
        'instagram-settings-edit-profile-option';

    let var_005 = document.createElement('label');
    var_005.setAttribute('for', 'instagram-email-input');

    var_005.innerText = 'Email';

    let instagram_email_input = document.createElement('input');
    instagram_email_input.type = 'text';
    instagram_email_input.id = 'instagram-email-input';
    instagram_email_input.setAttribute('placeholder', 'E-mail Address');
    instagram_email_input.value = account.email;

    instagram_settings_edit_profile_option4.appendChild(var_005);
    instagram_settings_edit_profile_option4.appendChild(
        instagram_email_input
    );

    let instagram_settings_edit_profile_option5 =
        document.createElement('div');
    instagram_settings_edit_profile_option5.className =
        'instagram-settings-edit-profile-option';

    let var_006 = document.createElement('label');
    var_006.setAttribute('for', 'instagram-gender-input');

    var_006.innerText = 'Gender';

    let var_007 = document.createElement('input');
    var_007.id = 'instagram-gender-input';
    var_007.type = 'text';
    var_007.setAttribute('placeholder', 'Gender');
    var_007.value = account.gender == 0 ? 'Male' : 'Female';

    instagram_settings_edit_profile_option5.appendChild(var_006);
    instagram_settings_edit_profile_option5.appendChild(var_007);

    let instagram_settings_edit_profile_option6 =
        document.createElement('div');
    instagram_settings_edit_profile_option6.className =
        'instagram-settings-edit-profile-option';

    let instagram_edit_profile_submit_button =
        document.createElement('button');
    instagram_edit_profile_submit_button.id =
        'instagram-edit-profile-submit-button';

    instagram_edit_profile_submit_button.innerText = 'Submit';
    instagram_edit_profile_submit_button.onclick = async (e) => {
        let full_name = document.getElementById('instagram-name-input').value;
        let username = document.getElementById(
            'instagram-username-input'
        ).value;
        let website = document.getElementById('instagram-website-input').value;
        let bio = document.getElementById('instagram-bio-input').value;
        let email = document.getElementById('instagram-email-input').value;

        if (website == '') {
            website = null;
        }

        let gender = 0;
        let gender_text = document.getElementById(
            'instagram-gender-input'
        ).value;
        gender_text = gender_text.toLowerCase();
        if (gender_text.charAt(0) != 'm') {
            gender = 1;
        }

        let result = await xmr.Private.Accounts.edit_profile(
            full_name,
            username,
            email,
            bio,
            website,
            gender
        );

        window.location.href = '/accounts/settings';
    };

    instagram_settings_edit_profile_option6.appendChild(
        instagram_edit_profile_submit_button
    );

    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_change_photo_section0
    );
    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_option0
    );
    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_option1
    );
    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_option2
    );
    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_option3
    );
    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_option4
    );
    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_option5
    );
    instagram_settings_edit_profile_screen0.appendChild(
        instagram_settings_edit_profile_option6
    );

    let content = document.getElementById(
        'instagram-settings-content-container'
    );
    Page_RemoveAllChildNodes(content);
    content.appendChild(instagram_settings_edit_profile_screen0);
}

function Page_Settings_RenderChangePasswordScreen(account) {
    var xmlns = 'http://www.w3.org/2000/svg';

    Page_Settings_UnselectAllOptions();
    document.getElementsByClassName(
        'instagram-setting-sidebar-item'
    )[1].className = 'instagram-setting-sidebar-item-selected';

    let instagram_settings_change_password_screen0 =
        document.createElement('div');
    instagram_settings_change_password_screen0.className =
        'instagram-settings-change-password-screen';

    let instagram_settings_change_password_profile_card0 =
        document.createElement('div');
    instagram_settings_change_password_profile_card0.className =
        'instagram-settings-change-password-profile-card';

    let instagram_my_icon = document.createElement('img');
    instagram_my_icon.id = 'instagram-my-icon';
    instagram_my_icon.className = 'instagram-toolbox-icon';
    instagram_my_icon.src = `/${account.username}/avatar`;
    instagram_my_icon.setAttribute('draggable', 'false');
    instagram_my_icon.setAttribute('height', '64');
    instagram_my_icon.setAttribute('width', '64');
    let var_000 = document.createElement('a');

    var_000.innerText = account.username;

    instagram_settings_change_password_profile_card0.appendChild(
        instagram_my_icon
    );
    instagram_settings_change_password_profile_card0.appendChild(var_000);

    let instagram_settings_change_password_option0 =
        document.createElement('div');
    instagram_settings_change_password_option0.className =
        'instagram-settings-change-password-option';

    let var_001 = document.createElement('label');
    var_001.setAttribute('for', 'instagram-current-pwd-input');

    var_001.innerText = 'Old Password';

    let instagram_current_pwd_input = document.createElement('input');
    instagram_current_pwd_input.type = 'password';
    instagram_current_pwd_input.id = 'instagram-current-pwd-input';
    instagram_current_pwd_input.setAttribute('placeholder', '');

    instagram_settings_change_password_option0.appendChild(var_001);
    instagram_settings_change_password_option0.appendChild(
        instagram_current_pwd_input
    );

    let instagram_settings_change_password_option1 =
        document.createElement('div');
    instagram_settings_change_password_option1.className =
        'instagram-settings-change-password-option';

    let var_002 = document.createElement('label');
    var_002.setAttribute('for', 'instagram-new-pwd-input');

    var_002.innerText = 'New Password';

    let instagram_new_pwd_input = document.createElement('input');
    instagram_new_pwd_input.type = 'password';
    instagram_new_pwd_input.id = 'instagram-new-pwd-input';
    instagram_new_pwd_input.setAttribute('placeholder', '');

    instagram_settings_change_password_option1.appendChild(var_002);
    instagram_settings_change_password_option1.appendChild(
        instagram_new_pwd_input
    );

    let instagram_settings_change_password_option2 =
        document.createElement('div');
    instagram_settings_change_password_option2.className =
        'instagram-settings-change-password-option';

    let var_003 = document.createElement('label');
    var_003.setAttribute('for', 'instagram-new-pwd-repeat-input');

    var_003.innerText = 'Confirm New Password';

    let instagram_new_pwd_repeat_input = document.createElement('input');
    instagram_new_pwd_repeat_input.type = 'password';
    instagram_new_pwd_repeat_input.id = 'instagram-new-pwd-repeat-input';
    instagram_new_pwd_repeat_input.setAttribute('placeholder', '');

    instagram_settings_change_password_option2.appendChild(var_003);
    instagram_settings_change_password_option2.appendChild(
        instagram_new_pwd_repeat_input
    );

    let instagram_settings_change_password_option3 =
        document.createElement('div');
    instagram_settings_change_password_option3.className =
        'instagram-settings-change-password-option';

    let instagram_settings_change_password_button =
        document.createElement('button');
    instagram_settings_change_password_button.id =
        'instagram-settings-change-password-button';
    instagram_settings_change_password_button.disabled = true;
    instagram_settings_change_password_button.onclick = async (e) => {
        let old_password = document.getElementById(
            'instagram-current-pwd-input'
        ).value;

        let new_password0 = document.getElementById(
            'instagram-new-pwd-input'
        ).value;
        let new_password1 = document.getElementById(
            'instagram-new-pwd-repeat-input'
        ).value;

        let result = await xmr.Private.Accounts.change_password(
            old_password,
            new_password0
        );

        setTimeout(() => {
            window.location.href = '/accounts/settings';
        }, 3000);
    };

    instagram_settings_change_password_button.innerText = 'Change Password';

    instagram_settings_change_password_option3.appendChild(
        instagram_settings_change_password_button
    );
    instagram_new_pwd_repeat_input.onkeyup = (e) => {
        let current_pwd = instagram_current_pwd_input.value;
        let new_pwd = instagram_new_pwd_input.value;
        let repeat_pwd = instagram_new_pwd_repeat_input.value;

        let allowed_to_change =
            new_pwd == repeat_pwd &&
            new_pwd.length >= 6 &&
            repeat_pwd >= 6 &&
            current_pwd.length >= 6 &&
            current_pwd != new_pwd;

        instagram_settings_change_password_button.disabled = !allowed_to_change;
    };

    instagram_settings_change_password_screen0.appendChild(
        instagram_settings_change_password_profile_card0
    );
    instagram_settings_change_password_screen0.appendChild(
        instagram_settings_change_password_option0
    );
    instagram_settings_change_password_screen0.appendChild(
        instagram_settings_change_password_option1
    );
    instagram_settings_change_password_screen0.appendChild(
        instagram_settings_change_password_option2
    );
    instagram_settings_change_password_screen0.appendChild(
        instagram_settings_change_password_option3
    );

    let content = document.getElementById(
        'instagram-settings-content-container'
    );
    Page_RemoveAllChildNodes(content);
    content.appendChild(instagram_settings_change_password_screen0);
}