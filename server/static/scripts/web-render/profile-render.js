function Page_RenderProfile(account, posts) {
    console.log(posts);
    var xmlns = 'http://www.w3.org/2000/svg';

    Page_RemoveAllChildNodes(
        document.getElementById('instagram-page-content-container')
    );

    let instagram_profile0 = document.createElement('div');
    instagram_profile0.className = 'instagram-profile';

    let instagram_profile_picture0 = document.createElement('div');
    instagram_profile_picture0.className = 'instagram-profile-picture';

    let var_000 = document.createElement('img');
    var_000.src = `/${account.username}/avatar`;
    var_000.setAttribute('height', '150');
    var_000.setAttribute('width', '150');

    instagram_profile_picture0.appendChild(var_000);

    let instagram_profile_data0 = document.createElement('div');
    instagram_profile_data0.className = 'instagram-profile-data';

    let instagram_profile_username_container0 = document.createElement('div');
    instagram_profile_username_container0.className =
        'instagram-profile-username-container';

    let instagram_profile_handle_container0 = document.createElement('div');
    instagram_profile_handle_container0.className =
        'instagram-profile-handle-container';

    let var_001 = document.createElement('a');

    var_001.innerText = account.username;

    let var_002 = document.createElementNS(xmlns, 'svg');
    var_002.setAttribute('aria-label', 'Verified');
    var_002.setAttribute('fill', 'rgb(0, 149, 246)');
    var_002.setAttribute('height', '18');
    var_002.setAttribute('role', 'img');
    var_002.setAttribute('viewBox', '0 0 40 40');
    var_002.setAttribute('width', '18');

    let var_003 = document.createElement('title');

    var_003.innerText = 'Verified';

    let var_004 = document.createElementNS(xmlns, 'path');
    var_004.setAttribute(
        'd',
        'M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z'
    );
    var_004.setAttribute('fill-rule', 'evenodd');

    var_002.appendChild(var_003);
    var_002.appendChild(var_004);

    instagram_profile_handle_container0.appendChild(var_001);
    if (account.is_verified) {
        instagram_profile_handle_container0.appendChild(var_002);
    }

    let var_005 = document.createElement('button');

    const followUserFn = async (e) => {
        if (current_user !== undefined) {
            let follower_count = account.follower_count;
            if (account.is_following === false) {
                follower_count++;
            }

            let result = await xmr.Private.User.create_friendship(account.id);
            var_005.innerText = 'Unfollow';
            var_005.onclick = unfollowUserFn;
            var_007.innerText = `${kmbFormatter(follower_count)} followers`;
        }
    };

    const unfollowUserFn = async (e) => {
        let follower_count = account.follower_count;
        if (account.is_following === true) {
            follower_count--;
        }

        let result = await xmr.Private.User.destroy_friendship(account.id);
        var_005.innerText = 'Follow';
        var_005.onclick = followUserFn;
        var_007.innerText = `${kmbFormatter(follower_count)} followers`;
    };

    if (current_user !== undefined && account.id === current_user.id) {
        Page_NavbarSetStandby();
        var_005.innerText = 'Edit profile';
        var_005.onclick = (e) => {
            window.location.href = '/accounts/settings';
        };
    } else if (
        account.is_following !== undefined &&
        account.is_following !== null &&
        account.is_following
    ) {
        var_005.innerText = 'Unfollow';
        var_005.onclick = unfollowUserFn;
    } else {
        var_005.innerText = 'Follow';
        var_005.onclick = followUserFn;
    }

    let open_messages_button = document.createElement('button');
    open_messages_button.innerText = 'Message';
    open_messages_button.onclick = async (e) => {
        let result = await xmr.Private.Direct.create_thread(account.id);

        if (result !== undefined) {
            if (result['created_thread_id'] !== undefined) {
                await xmr.Private.Direct.send_text(
                    result['created_thread_id'],
                    'Hello! :3'
                );
            }

            window.location.href = '/direct';
        }
    };

    let username_buttons = document.createElement('div');
    username_buttons.className = 'instagram-profile-username-buttons';

    username_buttons.appendChild(var_005);

    if (current_user !== undefined && account.id !== current_user.id) {
        username_buttons.appendChild(open_messages_button);
    }

    instagram_profile_username_container0.appendChild(
        instagram_profile_handle_container0
    );
    instagram_profile_username_container0.appendChild(username_buttons);


    let instagram_profile_following_container0 =
        document.createElement('div');
    instagram_profile_following_container0.className =
        'instagram-profile-following-container';

    let var_006 = document.createElement('p');

    var_006.innerText = `${
        account.post_count == undefined ? 0 : account.post_count
    } posts`;

    let var_007 = document.createElement('p');

    var_007.innerText = `${kmbFormatter(account.follower_count)} followers`;

    let var_008 = document.createElement('p');

    var_008.innerText = `${account.following_count} following`;

    instagram_profile_following_container0.appendChild(var_006);
    instagram_profile_following_container0.appendChild(var_007);
    instagram_profile_following_container0.appendChild(var_008);

    let instagram_profile_name_container0 = document.createElement('div');
    instagram_profile_name_container0.className =
        'instagram-profile-name-container';

    let var_009 = document.createElement('p');

    var_009.innerText = account.name;

    instagram_profile_name_container0.appendChild(var_009);

    let instagram_profile_bio_container0 = document.createElement('div');
    instagram_profile_bio_container0.className =
        'instagram-profile-bio-container';

    let var_0010 = document.createElement('p');

    var_0010.innerText = account.bio;

    instagram_profile_bio_container0.appendChild(var_0010);

    instagram_profile_data0.appendChild(
        instagram_profile_username_container0
    );
    instagram_profile_data0.appendChild(
        instagram_profile_following_container0
    );
    instagram_profile_data0.appendChild(instagram_profile_name_container0);
    instagram_profile_data0.appendChild(instagram_profile_bio_container0);

    instagram_profile0.appendChild(instagram_profile_picture0);
    instagram_profile0.appendChild(instagram_profile_data0);

    let instagram_profile_navbar_container3 = document.createElement('div');
    instagram_profile_navbar_container3.className =
        'instagram-profile-navbar-container';

    let instagram_profile_navbar3 = document.createElement('div');
    instagram_profile_navbar3.className = 'instagram-profile-navbar';

    let instagram_profile_navbar_item_selected3 =
        document.createElement('div');
    instagram_profile_navbar_item_selected3.className =
        'instagram-profile-navbar-item-selected';

    let var_0024 = document.createElementNS(xmlns, 'svg');
    var_0024.setAttribute('aria-label', '');
    var_0024.setAttribute('fill', 'currentColor');
    var_0024.setAttribute('height', '12');
    var_0024.setAttribute('role', 'img');
    var_0024.setAttribute('viewBox', '0 0 24 24');
    var_0024.setAttribute('width', '12');

    let var_0025 = document.createElement('title');

    var_0025.innerText = '';

    let var_0026 = document.createElementNS(xmlns, 'rect');
    var_0026.setAttribute('fill', 'none');
    var_0026.setAttribute('height', '18');
    var_0026.setAttribute('stroke', 'currentColor');
    var_0026.setAttribute('stroke-linecap', 'round');
    var_0026.setAttribute('stroke-linejoin', 'round');
    var_0026.setAttribute('stroke-width', '2');
    var_0026.setAttribute('width', '18');
    var_0026.setAttribute('x', '3');
    var_0026.setAttribute('y', '3');
    let var_0027 = document.createElementNS(xmlns, 'line');
    var_0027.setAttribute('fill', 'none');
    var_0027.setAttribute('stroke', 'currentColor');
    var_0027.setAttribute('stroke-linecap', 'round');
    var_0027.setAttribute('stroke-linejoin', 'round');
    var_0027.setAttribute('stroke-width', '2');
    var_0027.setAttribute('x1', '9.015');
    var_0027.setAttribute('x2', '9.015');
    var_0027.setAttribute('y1', '3');
    var_0027.setAttribute('y2', '21');
    let var_0028 = document.createElementNS(xmlns, 'line');
    var_0028.setAttribute('fill', 'none');
    var_0028.setAttribute('stroke', 'currentColor');
    var_0028.setAttribute('stroke-linecap', 'round');
    var_0028.setAttribute('stroke-linejoin', 'round');
    var_0028.setAttribute('stroke-width', '2');
    var_0028.setAttribute('x1', '14.985');
    var_0028.setAttribute('x2', '14.985');
    var_0028.setAttribute('y1', '3');
    var_0028.setAttribute('y2', '21');
    let var_0029 = document.createElementNS(xmlns, 'line');
    var_0029.setAttribute('fill', 'none');
    var_0029.setAttribute('stroke', 'currentColor');
    var_0029.setAttribute('stroke-linecap', 'round');
    var_0029.setAttribute('stroke-linejoin', 'round');
    var_0029.setAttribute('stroke-width', '2');
    var_0029.setAttribute('x1', '21');
    var_0029.setAttribute('x2', '3');
    var_0029.setAttribute('y1', '9.015');
    var_0029.setAttribute('y2', '9.015');
    let var_0030 = document.createElementNS(xmlns, 'line');
    var_0030.setAttribute('fill', 'none');
    var_0030.setAttribute('stroke', 'currentColor');
    var_0030.setAttribute('stroke-linecap', 'round');
    var_0030.setAttribute('stroke-linejoin', 'round');
    var_0030.setAttribute('stroke-width', '2');
    var_0030.setAttribute('x1', '21');
    var_0030.setAttribute('x2', '3');
    var_0030.setAttribute('y1', '14.985');
    var_0030.setAttribute('y2', '14.985');

    var_0024.appendChild(var_0025);
    var_0024.appendChild(var_0026);
    var_0024.appendChild(var_0027);
    var_0024.appendChild(var_0028);
    var_0024.appendChild(var_0029);
    var_0024.appendChild(var_0030);

    let var_0031 = document.createElement('a');
    var_0031.innerText = 'POSTS';

    instagram_profile_navbar_item_selected3.appendChild(var_0024);
    instagram_profile_navbar_item_selected3.appendChild(var_0031);

    instagram_profile_navbar3.appendChild(
        instagram_profile_navbar_item_selected3
    );

    let instagram_profile_nav_content3 = document.createElement('div');
    instagram_profile_nav_content3.className =
        'instagram-profile-nav-content';

    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        let comments = [];

        (async () => {
            comments = await xmr.Guest.Media.get_post_comments_via_id(post.id);
        })();

        let instagram_preview_post0 = document.createElement('div');
        instagram_preview_post0.className = 'instagram-preview-post';
        instagram_preview_post0.onclick = (e) => {
            Page_RenderPostView(post);
            Page_Post_RenderComments(comments);
        };

        let instagram_preview_post_overlay0 = document.createElement('div');
        instagram_preview_post_overlay0.className =
            'instagram-preview-post-overlay';

        let instagram_preview_post_overlay_info0 =
            document.createElement('div');
        instagram_preview_post_overlay_info0.className =
            'instagram-preview-post-overlay-info';

        let instagram_preview_post_overlay_like_info0 =
            document.createElement('div');
        instagram_preview_post_overlay_like_info0.className =
            'instagram-preview-post-overlay-like-info';

        let var_000 = document.createElementNS(xmlns, 'svg');
        var_000.setAttribute('fill', 'currentColor');
        var_000.setAttribute('height', '18');
        var_000.setAttribute('role', 'img');
        var_000.setAttribute('viewBox', '0 0 24 24');
        var_000.setAttribute('width', '18');

        let var_001 = document.createElementNS(xmlns, 'path');
        var_001.setAttribute(
            'd',
            'M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z'
        );

        var_000.appendChild(var_001);

        let var_002 = document.createElement('a');

        var_002.innerText = `${kmbFormatter(post.like_count)} likes`;

        instagram_preview_post_overlay_like_info0.appendChild(var_000);
        instagram_preview_post_overlay_like_info0.appendChild(var_002);

        let instagram_preview_post_overlay_comment_info0 =
            document.createElement('div');
        instagram_preview_post_overlay_comment_info0.className =
            'instagram-preview-post-overlay-comment-info';

        let instagram_toolbox_icon0 = document.createElementNS(xmlns, 'svg');
        instagram_toolbox_icon0.setAttribute('aria-label', 'Comment');
        instagram_toolbox_icon0.setAttribute('class', 'instagram-toolbox-icon');
        instagram_toolbox_icon0.setAttribute('fill', 'currentColor');
        instagram_toolbox_icon0.setAttribute('height', '18');
        instagram_toolbox_icon0.setAttribute('role', 'img');
        instagram_toolbox_icon0.setAttribute('viewBox', '0 0 24 24');
        instagram_toolbox_icon0.setAttribute('width', '18');

        let var_003 = document.createElementNS(xmlns, 'path');
        var_003.setAttribute(
            'd',
            'M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
        );
        var_003.setAttribute('fill', 'none');
        var_003.setAttribute('stroke', 'currentColor');
        var_003.setAttribute('stroke-linejoin', 'round');
        var_003.setAttribute('stroke-width', '2');

        instagram_toolbox_icon0.appendChild(var_003);

        let var_004 = document.createElement('a');

        var_004.innerText = kmbFormatter(post.comment_count);

        instagram_preview_post_overlay_comment_info0.appendChild(
            instagram_toolbox_icon0
        );
        instagram_preview_post_overlay_comment_info0.appendChild(var_004);

        instagram_preview_post_overlay_info0.appendChild(
            instagram_preview_post_overlay_like_info0
        );
        instagram_preview_post_overlay_info0.appendChild(
            instagram_preview_post_overlay_comment_info0
        );

        instagram_preview_post_overlay0.appendChild(
            instagram_preview_post_overlay_info0
        );

        let var_005 = document.createElement('img');
        var_005.src = `/rest/guest/media/${post.short_code}`;

        instagram_preview_post0.appendChild(instagram_preview_post_overlay0);
        instagram_preview_post0.appendChild(var_005);

        instagram_profile_nav_content3.appendChild(instagram_preview_post0);
    }

    let invis_count = posts.length - parseInt(posts.length / 3) * 3;
    for (let i = 0; i < invis_count; i++) {
        let instagram_preview_invisible_post0 = document.createElement('div');
        instagram_preview_invisible_post0.className =
            'instagram-preview-invisible-post';

        instagram_profile_nav_content3.appendChild(
            instagram_preview_invisible_post0
        );
    }

    instagram_profile_navbar_container3.appendChild(
        instagram_profile_navbar3
    );
    instagram_profile_navbar_container3.appendChild(
        instagram_profile_nav_content3
    );

    let container = document.getElementById(
        'instagram-page-content-container'
    );
    container.appendChild(instagram_profile0);
    container.appendChild(instagram_profile_navbar_container3);
}