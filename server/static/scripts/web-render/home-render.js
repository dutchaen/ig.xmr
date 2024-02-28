function Page_RenderHomePage(account, posts) {
    var xmlns = 'http://www.w3.org/2000/svg';

    Page_NavbarSetStandby();
    Page_SetHomeSelectedIcon();
    Page_RemoveAllChildNodes(
        document.getElementById('instagram-page-content-container')
    );


    let instagram_page_content0 = document.createElement('div');
    instagram_page_content0.className = 'instagram-page-content';

    let instagram_post_container = document.createElement('div');
    instagram_post_container.id = 'instagram-post-container';
    instagram_post_container.className = 'instagram-post-container';
    let instagram_suggestions_me_container0 = document.createElement('div');
    instagram_suggestions_me_container0.className =
        'instagram-suggestions-me-container';

    let instagram_me_container0 = document.createElement('div');
    instagram_me_container0.className = 'instagram-me-container';

    let instagram_me_suggest_profile_photo = document.createElement('img');
    instagram_me_suggest_profile_photo.id =
        'instagram-me-suggest-profile-photo';
    instagram_me_suggest_profile_photo.src = `/${account.username}/avatar`;
    document.getElementById(
        'instagram-toolbox-my-icon'
    ).src = `/${account.username}/avatar`;

    instagram_me_suggest_profile_photo.setAttribute('draggable', 'false');
    instagram_me_suggest_profile_photo.setAttribute('height', '60');
    instagram_me_suggest_profile_photo.setAttribute('width', '60');
    let instagram_me_name_handle_container0 = document.createElement('div');
    instagram_me_name_handle_container0.className =
        'instagram-me-name-handle-container';
    instagram_me_name_handle_container0.onclick = (e) => {
        window.location.href = '/' + me.username;
    };

    let instagram_me_handle = document.createElement('a');
    instagram_me_handle.id = 'instagram-me-handle';
    instagram_me_handle.className = 'instagram-me-handle';

    instagram_me_handle.innerText = account.username;

    let instagram_me_name = document.createElement('a');
    instagram_me_name.id = 'instagram-me-name';
    instagram_me_name.className = 'instagram-me-name';

    if (account.alias !== undefined) {
        instagram_me_name.innerText = account.alias;
    } else if (account.name !== undefined) {
        instagram_me_name.innerText = account.name;
    }

    instagram_me_name_handle_container0.appendChild(instagram_me_handle);
    instagram_me_name_handle_container0.appendChild(instagram_me_name);

    instagram_me_container0.appendChild(instagram_me_suggest_profile_photo);
    instagram_me_container0.appendChild(instagram_me_name_handle_container0);

    instagram_suggestions_me_container0.appendChild(instagram_me_container0);

    instagram_page_content0.appendChild(instagram_post_container);
    instagram_page_content0.appendChild(instagram_suggestions_me_container0);

    let content_ref = document.getElementById(
        'instagram-page-content-container'
    );
    content_ref.appendChild(instagram_page_content0);

    Page_Home_RenderPosts(posts);
}

function Page_Home_RenderPost(post) {


    let comments = [];
    (async () => {
        comments = await xmr.Guest.Media.get_post_comments_via_id(post.id);
    })();

    var xmlns = 'http://www.w3.org/2000/svg';
    let instagram_post0 = document.createElement('div');
    instagram_post0.className = 'instagram-post';

    let instagram_poster_bar0 = document.createElement('div');
    instagram_poster_bar0.className = 'instagram-poster-bar';

    let instagram_poster_data0 = document.createElement('div');
    instagram_poster_data0.className = 'instagram-poster-data';

    let instagram_my_icon = document.createElement('img');
    instagram_my_icon.id = 'instagram-my-icon';
    instagram_my_icon.className = 'instagram-toolbox-icon';
    //instagram_my_icon.src = post.avatar;
    instagram_my_icon.setAttribute('draggable', 'false');
    instagram_my_icon.setAttribute('height', '35');
    instagram_my_icon.setAttribute('width', '35');
    let instagram_poster_username0 = document.createElement('a');
    instagram_poster_username0.className = 'instagram-poster-username';

    //instagram_poster_username0.innerText = post.username;
    instagram_poster_username0.onclick = async (e) => {
        let _profile = await xmr.Guest.User.get_user_id_info(post.posted_by);
        let _posts = await xmr.Guest.User.get_medias_via_user_id(post.posted_by);
        Page_RenderProfile(_profile, _posts);
    };



    instagram_poster_data0.appendChild(instagram_my_icon);
    instagram_poster_data0.appendChild(instagram_poster_username0);

    let instagram_other_dots_container0 = document.createElement('div');
    instagram_other_dots_container0.className =
        'instagram-other-dots-container';

    let instagram_other_dots = document.createElement('img');
    instagram_other_dots.id = 'instagram-other-dots';
    instagram_other_dots.src = '../static/images/ic_dots_nil.png';
    instagram_other_dots.setAttribute('height', '20');
    instagram_other_dots.setAttribute('width', '20');

    instagram_other_dots_container0.appendChild(instagram_other_dots);

    instagram_poster_bar0.appendChild(instagram_poster_data0);
    instagram_poster_bar0.appendChild(instagram_other_dots_container0);

    let instagram_post_content0 = document.createElement('div');
    instagram_post_content0.className = 'instagram-post-content';
    instagram_post_content0.onclick = async (e) => {
        let _comments = await xmr.Guest.Media.get_post_comments_via_id(post.id);
        Page_RenderPostView(post);
        Page_Post_RenderComments(_comments);
    };

    let var_000 = document.createElement('img');
    var_000.src = `/rest/guest/media/${post.short_code}`;
    var_000.setAttribute('width', '100%');
    var_000.setAttribute('draggable', 'false');

    instagram_post_content0.appendChild(var_000);

    let instagram_post_media_control_bar0 = document.createElement('div');
    instagram_post_media_control_bar0.className =
        'instagram-post-media-control-bar';

    let instagram_post_media_main_controls0 = document.createElement('div');
    instagram_post_media_main_controls0.className =
        'instagram-post-media-main-controls';

    instagram_post_media_control_bar0.appendChild(
        instagram_post_media_main_controls0
    );

    let instagram_post_media_control_bar_container0 =
        document.createElement('div');
    instagram_post_media_control_bar_container0.className =
        'instagram-post-media-control-bar-container';
    instagram_post_media_control_bar_container0.appendChild(
        instagram_post_media_control_bar0
    );

    let instagram_post_more_post_data0 = document.createElement('div');
    instagram_post_more_post_data0.className =
        'instagram-post-more-post-data';

    let instagram_post_poster_handle = document.createElement('strong');
    instagram_post_poster_handle.className = 'instagram-post-poster-handle';

    
    instagram_post_poster_handle.onclick = (e) => {


        Page_RenderProfile(post);
    };

    let instagram_post_poster_caption = document.createElement('a');
    instagram_post_poster_caption.className = 'instagram-post-poster-caption';

    instagram_post_poster_caption.textContent = post.caption;

    instagram_post_more_post_data0.appendChild(instagram_post_poster_handle);
    instagram_post_more_post_data0.appendChild(instagram_post_poster_caption);

    let instagram_likes_container0 = document.createElement('div');
    instagram_likes_container0.className = 'instagram-likes-container';

    let var_0019 = document.createElement('strong');

    var_0019.innerText = `${humanizeNumber(post.like_count)} likes`;
    instagram_likes_container0.appendChild(var_0019);

    instagram_post0.appendChild(instagram_poster_bar0);
    instagram_post0.appendChild(instagram_post_content0);
    instagram_post0.appendChild(instagram_post_media_control_bar_container0);
    instagram_post0.appendChild(instagram_likes_container0);
    instagram_post0.appendChild(instagram_post_more_post_data0);

    (async () => {
        let _profile = await xmr.Guest.User.get_user_id_info(post.posted_by);

        instagram_poster_username0.innerText = _profile.username;
        instagram_poster_username0.innerText = _profile.username;
        instagram_post_poster_handle.innerText = _profile.username;
        instagram_my_icon.src = `/${_profile.username}/avatar`;

    })();

    return instagram_post0;
}

function Page_Home_RenderPosts(posts) {
    let post_container = document.getElementById('instagram-post-container');
    Page_RemoveAllChildNodes(post_container);

    for (let i = 0; i < posts.length; i++) {
        let post_element = Page_Home_RenderPost(posts[i]);
        post_container.appendChild(post_element);
    }
}

function Page_RenderSearchResults(results) {
    var xmlns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < results.length; i++) {
        let user = results[i];

        let instagram_search_result0 = document.createElement('div');
        instagram_search_result0.className = 'instagram-search-result';

        let var_0012 = document.createElement('img');
        var_0012.src = `/${user['username']}/avatar`;
        let instagram_search_result_aliases0 = document.createElement('div');
        instagram_search_result_aliases0.className =
            'instagram-search-result-aliases';

        let var_0013 = document.createElement('strong');

        var_0013.innerText = user['username'];

        let var_0014 = document.createElement('a');

        var_0014.innerText = user['name'];

        instagram_search_result_aliases0.appendChild(var_0013);
        instagram_search_result_aliases0.appendChild(var_0014);

        instagram_search_result0.appendChild(var_0012);
        instagram_search_result0.appendChild(instagram_search_result_aliases0);
        instagram_search_result0.onclick = (e) => {
            search_bar_element.value = '';
            window.location.href = '/' + user['username'];
        };

        search_box_popup.appendChild(instagram_search_result0);
    }
}


function Page_RenderExplorePage(posts) {
    var xmlns = 'http://www.w3.org/2000/svg';

    Page_NavbarSetStandby();
    Page_SetExploreSelectedIcon();

    Page_RemoveAllChildNodes(
        document.getElementById('instagram-page-content-container')
    );

    let instagram_explore_feed_container0 = document.createElement('div');
    instagram_explore_feed_container0.className =
        'instagram-explore-feed-container';
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

        var_002.innerText = `${kmbFormatter(post.likes)} likes`;

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
        var_005.src = post.media_src;

        instagram_preview_post0.appendChild(instagram_preview_post_overlay0);
        instagram_preview_post0.appendChild(var_005);

        instagram_explore_feed_container0.appendChild(instagram_preview_post0);
    }

    let invis_count = posts.length - parseInt(posts.length / 3) * 3;
    for (let i = 0; i < invis_count; i++) {
        let instagram_preview_invisible_post0 = document.createElement('div');
        instagram_preview_invisible_post0.className =
            'instagram-preview-invisible-post';

        instagram_explore_feed_container0.appendChild(
            instagram_preview_invisible_post0
        );
    }

    let content = document.getElementById('instagram-page-content-container');
    Page_RemoveAllChildNodes(content);
    content.appendChild(instagram_explore_feed_container0);
}