function Page_Post_RenderComments(comments) {
    var xmlns = 'http://www.w3.org/2000/svg';

    let comment_container = document.getElementsByClassName(
        'instagram-post-comments'
    )[0];

    let caption_element = comment_container.children.item(0);
    Page_RemoveAllChildNodes(comment_container);
    comment_container.appendChild(caption_element);

    for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];

        let instagram_post_comment_card_container1 =
            document.createElement('div');
        instagram_post_comment_card_container1.className =
            'instagram-post-comment-card-container';

        let instagram_post_comment_card1 = document.createElement('div');
        instagram_post_comment_card1.className = 'instagram-post-comment-card';

        let var_0014 = document.createElement('img');
        var_0014.src = `/${comment.owner.username}/avatar`;
        let instagram_post_comment_data1 = document.createElement('div');
        instagram_post_comment_data1.className = 'instagram-post-comment-data';

        let var_0015 = document.createElement('a');

        let instagram_post_comment_username1 = document.createElement('strong');
        instagram_post_comment_username1.className =
            'instagram-post-comment-username';

        instagram_post_comment_username1.onclick = (e) => {
            window.location.href = `/${comment.owner.username}`;
        };
        instagram_post_comment_username1.innerText = `${comment.owner.username} `;

        var_0015.appendChild(IG_RenderComment(comment.content));

        // var_0015.appendChild(instagram_post_comment_username1);
        instagram_post_comment_username1.appendChild(var_0015);

        instagram_post_comment_data1.appendChild(
            instagram_post_comment_username1
        );

        let instagram_post_like_button0 = document.createElement('div');
        instagram_post_like_button0.className = 'instagram-post-like-button';

        let instagram_icon0 = document.createElementNS(xmlns, 'svg');
        instagram_icon0.setAttribute('aria-label', 'Like');
        instagram_icon0.setAttribute('class', 'instagram-icon');
        instagram_icon0.setAttribute('fill', 'currentColor');
        instagram_icon0.setAttribute('height', '12');
        instagram_icon0.setAttribute('role', 'img');
        instagram_icon0.setAttribute('viewBox', '0 0 24 24');
        instagram_icon0.setAttribute('width', '12');

        let var_0016 = document.createElementNS(xmlns, 'path');
        var_0016.setAttribute(
            'd',
            'M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z'
        );

        instagram_icon0.appendChild(var_0016);

        instagram_post_like_button0.appendChild(instagram_icon0);

        instagram_post_comment_card1.appendChild(var_0014);
        instagram_post_comment_card1.appendChild(instagram_post_comment_data1);
        instagram_post_comment_card1.appendChild(instagram_post_like_button0);

        instagram_post_comment_card_container1.appendChild(
            instagram_post_comment_card1
        );

        comment_container.appendChild(instagram_post_comment_card_container1);
    }
}

function Page_RenderPostView(post) {
    Page_RemoveAllChildNodes(
        document.getElementById('instagram-page-content-container')
    );

    var xmlns = 'http://www.w3.org/2000/svg';
    let instagram_post_screen_container0 = document.createElement('div');
    instagram_post_screen_container0.className =
        'instagram-post-screen-container';

    let instagram_post_media_section0 = document.createElement('div');
    instagram_post_media_section0.className = 'instagram-post-media-section';

    let instagram_post_media_header_bar_container0 =
        document.createElement('div');
    instagram_post_media_header_bar_container0.className =
        'instagram-post-media-header-bar-container';

    let instagram_post_media_header_bar0 = document.createElement('div');
    instagram_post_media_header_bar0.className =
        'instagram-post-media-header-bar';
    instagram_post_media_header_bar0.onclick = async (e) => {
        let user = await xmr.Guest.User.get_user_id_info(post.posted_by);
        window.location.href = `/${user.username}`;
    };

    let var_000 = document.createElement('img');

    let var_001 = document.createElement('a');

    instagram_post_media_header_bar0.appendChild(var_000);
    instagram_post_media_header_bar0.appendChild(var_001);

    instagram_post_media_header_bar_container0.appendChild(
        instagram_post_media_header_bar0
    );

    let instagram_post_media_content0 = document.createElement('div');
    instagram_post_media_content0.className = 'instagram-post-media-content';

    let var_002 = document.createElement('img');
    var_002.src = `/rest/guest/media/${post.short_code}`;

    instagram_post_media_content0.appendChild(var_002);

    let instagram_post_media_control_bar_container00 =
        document.createElement('div');
    instagram_post_media_control_bar_container00.className =
        'instagram-post-media-control-bar-container0';

    let instagram_post_media_control_bar0 = document.createElement('div');
    instagram_post_media_control_bar0.className =
        'instagram-post-media-control-bar';

    let instagram_post_media_main_controls0 = document.createElement('div');
    instagram_post_media_main_controls0.className =
        'instagram-post-media-main-controls';

    let instagram_like_button = document.createElementNS(xmlns, 'svg');
    instagram_like_button.setAttribute('id', 'instagram-like-button');
    instagram_like_button.setAttribute('aria-label', 'Like');
    instagram_like_button.setAttribute('class', 'instagram-toolbox-icon');
    instagram_like_button.setAttribute('fill', 'currentColor');
    instagram_like_button.setAttribute('height', '24');
    instagram_like_button.setAttribute('role', 'img');
    instagram_like_button.setAttribute('viewBox', '0 0 24 24');
    instagram_like_button.setAttribute('width', '24');

    let var_003 = document.createElementNS(xmlns, 'path');

    let like_fn = async (e) => {
        await xmr.Private.Media.like(post.id);
        instagram_like_button.onclick = unlike_fn;
        instagram_like_button.setAttribute('viewBox', '0 0 48 48');
        var_003.setAttribute(
            'd',
            'M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z'
        );

        var_003.setAttribute('fill', 'rgb(143,33,66)');
        var_0011.innerText = `${humanizeNumber(++post.like_count)} likes`;


    };

    let unlike_fn = async (e) => {
        await xmr.Private.Media.unlike(post.id);
        instagram_like_button.onclick = like_fn;
        var_003.setAttribute(
            'd',
            'M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z'
        );
        var_003.removeAttribute('fill');
        instagram_like_button.setAttribute('viewBox', '0 0 24 24');
        var_0011.innerText = `${humanizeNumber(--post.like_count)} likes`;
    };

    if (post.is_liked_by_me) {
        instagram_like_button.setAttribute('viewBox', '0 0 48 48');
        var_003.setAttribute(
            'd',
            'M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z'
        );

        var_003.setAttribute('fill', 'rgb(143,33,66)');
        instagram_like_button.onclick = unlike_fn;
    } else {
        var_003.setAttribute(
            'd',
            'M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z'
        );
        instagram_like_button.onclick = like_fn;
    }

    instagram_like_button.appendChild(var_003);

    let instagram_toolbox_icon0 = document.createElementNS(xmlns, 'svg');
    instagram_toolbox_icon0.setAttribute('aria-label', 'Comment');
    instagram_toolbox_icon0.setAttribute('class', 'instagram-toolbox-icon');
    instagram_toolbox_icon0.setAttribute('fill', 'currentColor');
    instagram_toolbox_icon0.setAttribute('height', '24');
    instagram_toolbox_icon0.setAttribute('role', 'img');
    instagram_toolbox_icon0.setAttribute('viewBox', '0 0 24 24');
    instagram_toolbox_icon0.setAttribute('width', '24');

    let var_004 = document.createElement('title');

    var_004.innerText = 'Comment';

    let var_005 = document.createElementNS(xmlns, 'path');
    var_005.setAttribute(
        'd',
        'M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
    );
    var_005.setAttribute('fill', 'none');
    var_005.setAttribute('stroke', 'currentColor');
    var_005.setAttribute('stroke-linejoin', 'round');
    var_005.setAttribute('stroke-width', '2');

    instagram_toolbox_icon0.appendChild(var_004);
    instagram_toolbox_icon0.appendChild(var_005);

    let instagram_toolbox_icon1 = document.createElementNS(xmlns, 'svg');
    instagram_toolbox_icon1.setAttribute('aria-label', 'Share Post');
    instagram_toolbox_icon1.setAttribute('class', 'instagram-toolbox-icon');
    instagram_toolbox_icon1.setAttribute('fill', 'currentColor');
    instagram_toolbox_icon1.setAttribute('height', '24');
    instagram_toolbox_icon1.setAttribute('role', 'img');
    instagram_toolbox_icon1.setAttribute('viewBox', '0 0 24 24');
    instagram_toolbox_icon1.setAttribute('width', '24');

    let var_006 = document.createElement('title');

    var_006.innerText = 'Share Post';

    let var_007 = document.createElementNS(xmlns, 'line');
    var_007.setAttribute('fill', 'none');
    var_007.setAttribute('stroke', 'currentColor');
    var_007.setAttribute('stroke-linejoin', 'round');
    var_007.setAttribute('stroke-width', '2');
    var_007.setAttribute('x1', '22');
    var_007.setAttribute('x2', '9.218');
    var_007.setAttribute('y1', '3');
    var_007.setAttribute('y2', '10.083');
    let var_008 = document.createElementNS(xmlns, 'polygon');
    var_008.setAttribute('fill', 'none');
    var_008.setAttribute(
        'points',
        '11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334'
    );
    var_008.setAttribute('stroke', 'currentColor');
    var_008.setAttribute('stroke-linejoin', 'round');
    var_008.setAttribute('stroke-width', '2');

    instagram_toolbox_icon1.appendChild(var_006);
    instagram_toolbox_icon1.appendChild(var_007);
    instagram_toolbox_icon1.appendChild(var_008);

    instagram_post_media_main_controls0.appendChild(instagram_like_button);
    instagram_post_media_main_controls0.appendChild(instagram_toolbox_icon0);
    instagram_post_media_main_controls0.appendChild(instagram_toolbox_icon1);

    let instagram_post_media_save_button0 = document.createElement('div');
    instagram_post_media_save_button0.className =
        'instagram-post-media-save-button';

    let instagram_toolbox_icon2 = document.createElementNS(xmlns, 'svg');
    instagram_toolbox_icon2.setAttribute('aria-label', 'Save');
    instagram_toolbox_icon2.setAttribute('class', 'instagram-toolbox-icon');
    instagram_toolbox_icon2.setAttribute('fill', 'currentColor');
    instagram_toolbox_icon2.setAttribute('height', '24');
    instagram_toolbox_icon2.setAttribute('role', 'img');
    instagram_toolbox_icon2.setAttribute('viewBox', '0 0 24 24');
    instagram_toolbox_icon2.setAttribute('width', '24');

    let var_009 = document.createElement('title');

    var_009.innerText = 'Save';

    let var_0010 = document.createElementNS(xmlns, 'polygon');
    var_0010.setAttribute('fill', 'none');
    var_0010.setAttribute('points', '20 21 12 13.44 4 21 4 3 20 3 20 21');
    var_0010.setAttribute('stroke', 'currentColor');
    var_0010.setAttribute('stroke-linecap', 'round');
    var_0010.setAttribute('stroke-linejoin', 'round');
    var_0010.setAttribute('stroke-width', '2');

    instagram_toolbox_icon2.appendChild(var_009);
    instagram_toolbox_icon2.appendChild(var_0010);

    instagram_post_media_save_button0.appendChild(instagram_toolbox_icon2);

    instagram_post_media_control_bar0.appendChild(
        instagram_post_media_main_controls0
    );
    instagram_post_media_control_bar0.appendChild(
        instagram_post_media_save_button0
    );

    instagram_post_media_control_bar_container00.appendChild(
        instagram_post_media_control_bar0
    );

    let instagram_likes_container0 = document.createElement('div');
    instagram_likes_container0.className = 'instagram-likes-container';

    let var_0011 = document.createElement('strong');

    var_0011.innerText = `${humanizeNumber(post.like_count)} likes`;

    instagram_likes_container0.appendChild(var_0011);

    instagram_post_media_section0.appendChild(
        instagram_post_media_header_bar_container0
    );
    instagram_post_media_section0.appendChild(instagram_post_media_content0);
    instagram_post_media_section0.appendChild(
        instagram_post_media_control_bar_container00
    );
    instagram_post_media_section0.appendChild(instagram_likes_container0);

    let instagram_post_comments_container0 = document.createElement('div');
    instagram_post_comments_container0.className =
        'instagram-post-comments-container';

    let instagram_post_comments0 = document.createElement('div');
    instagram_post_comments0.className = 'instagram-post-comments';

    let instagram_post_comment_card_container0 =
        document.createElement('div');
    instagram_post_comment_card_container0.className =
        'instagram-post-comment-card-container';

    let instagram_post_comment_card0 = document.createElement('div');
    instagram_post_comment_card0.className = 'instagram-post-comment-card';

    let var_0012 = document.createElement('img');
    //var_0012.src = post.avatar;

    let instagram_post_comment_data0 = document.createElement('div');
    instagram_post_comment_data0.className = 'instagram-post-comment-data';

    let var_0013 = document.createElement('a');

    let instagram_post_comment_username0 = document.createElement('strong');
    instagram_post_comment_username0.className =
        'instagram-post-comment-username';

    //instagram_post_comment_username0.innerText = post.username;

    (async () => {
        let _profile = await xmr.Guest.User.get_user_id_info(post.posted_by);
        var_001.innerText = instagram_post_comment_username0.innerText =
            _profile.username;

        var_0013.innerText = ` ${post.caption}`;
        var_000.src = var_0012.src = `/${_profile.username}/avatar`;
    })();

    instagram_post_comment_username0.appendChild(var_0013);
    //var_0013.appendChild(instagram_post_comment_username0);

    instagram_post_comment_data0.appendChild(
        instagram_post_comment_username0
    );

    instagram_post_comment_card0.appendChild(var_0012);
    instagram_post_comment_card0.appendChild(instagram_post_comment_data0);

    instagram_post_comment_card_container0.appendChild(
        instagram_post_comment_card0
    );

    instagram_post_comments0.appendChild(
        instagram_post_comment_card_container0
    );

    let instagram_post_comment_add_comment_container0 =
        document.createElement('div');
    instagram_post_comment_add_comment_container0.className =
        'instagram-post-comment-add-comment-container';

    let instagram_post_comment_add_comment0 = document.createElement('div');
    instagram_post_comment_add_comment0.className =
        'instagram-post-comment-add-comment';

    let var_0020 = document.createElement('textarea');
    var_0020.setAttribute('placeholder', 'Write a comment...');
    var_0020.rows = 3;
    var_0020.cols = 38;

    var_0020.innerText = '';
    var_0020.onkeydown = async (e) => {
        //console.log(e);
        if (e.key == 'Enter') {
            e.preventDefault();
            let comment_text = var_0020.value;
            if (comment_text.length !== 0) {
                await xmr.Private.Media.create_comment(post.id, comment_text);
                let new_comments = await xmr.Guest.Media.get_post_comments_via_id(post.id);

                Page_Post_RenderComments(new_comments);
                var_0020.value = '';
            }
        }
    };

    let var_0021 = document.createElement('a');

    var_0021.innerText = 'Send';
    var_0021.onclick = async (e) => {
        let comment_text = var_0020.value;
        if (comment_text.length !== 0) {


            await xmr.Private.Media.create_comment(post.id, comment_text);
            let new_comments = await xmr.Guest.Media.get_post_comments_via_id(post.id);

            Page_Post_RenderComments(new_comments);
            var_0020.value = '';
        }
    };

    instagram_post_comment_add_comment0.appendChild(var_0020);
    instagram_post_comment_add_comment0.appendChild(var_0021);

    instagram_post_comment_add_comment_container0.appendChild(
        instagram_post_comment_add_comment0
    );

    instagram_post_comments_container0.appendChild(instagram_post_comments0);
    instagram_post_comments_container0.appendChild(
        instagram_post_comment_add_comment_container0
    );

    instagram_post_screen_container0.appendChild(
        instagram_post_media_section0
    );
    instagram_post_screen_container0.appendChild(
        instagram_post_comments_container0
    );

    let content = document.getElementById('instagram-page-content-container');
    Page_RemoveAllChildNodes(content);
    content.appendChild(instagram_post_screen_container0);
}