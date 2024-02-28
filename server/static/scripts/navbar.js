const backstack = [];

const standby = [
    NavBar_SetHomeStandbyIcon,
    NavBar_SetDirectStandbyIcon,
    NavBar_SetExploreStandbyIcon,
    NavBar_SetLikeStandbyIcon
];

function Page_NavbarSetStandby() {
    for (let i = 0; i < standby.length; i++) {
        let standby_set = standby[i];
        standby_set();
    }
}

function Page_RemoveAllChildNodes(element) {
    while (element.children.length !== 0) {
        element.removeChild(element.children.item(0));
    }
}

function NavBar_SetExploreStandbyIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let instagram_explore_icon = document.createElementNS(xmlns, "svg");
    instagram_explore_icon.setAttribute('id', 'instagram-explore-icon');
    instagram_explore_icon.onclick = (e) => {
        Page_RenderExplorePage( posts );;
    };
    instagram_explore_icon.setAttribute('aria-label', 'Explore');
    instagram_explore_icon.setAttribute('class', 'instagram-toolbox-icon');
    instagram_explore_icon.setAttribute('fill', 'currentColor');
    instagram_explore_icon.setAttribute('height', '24');
    instagram_explore_icon.setAttribute('role', 'img');
    instagram_explore_icon.setAttribute('viewBox', '0 0 24 24');
    instagram_explore_icon.setAttribute('width', '24');

    let var_004 = document.createElement("title");

    var_004.innerText = 'Explore';


    let instagram_toolbox_editable_svg_type0 = document.createElementNS(xmlns, "polygon");
    instagram_toolbox_editable_svg_type0.setAttribute('fill', 'none');
    instagram_toolbox_editable_svg_type0.setAttribute('points', '13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953');
    instagram_toolbox_editable_svg_type0.setAttribute('class', 'instagram-toolbox-editable-svg-type');
    instagram_toolbox_editable_svg_type0.setAttribute('stroke', 'currentColor');
    instagram_toolbox_editable_svg_type0.setAttribute('stroke-linecap', 'round');
    instagram_toolbox_editable_svg_type0.setAttribute('stroke-linejoin', 'round');
    instagram_toolbox_editable_svg_type0.setAttribute('stroke-width', '2');
    let var_005 = document.createElementNS(xmlns, "polygon");
    var_005.setAttribute('fill-rule', 'evenodd');
    var_005.setAttribute('points', '10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056');
    let var_006 = document.createElementNS(xmlns, "circle");
    var_006.setAttribute('cx', '12.001');
    var_006.setAttribute('cy', '12.005');
    var_006.setAttribute('fill', 'none');
    var_006.setAttribute('r', '10.5');
    var_006.setAttribute('stroke', 'currentColor');
    var_006.setAttribute('stroke-linecap', 'round');
    var_006.setAttribute('stroke-linejoin', 'round');
    var_006.setAttribute('stroke-width', '2');

    instagram_explore_icon.appendChild(var_004);
    instagram_explore_icon.appendChild(instagram_toolbox_editable_svg_type0);
    instagram_explore_icon.appendChild(var_005);
    instagram_explore_icon.appendChild(var_006);

    let icon = document.getElementById('instagram-explore-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(instagram_explore_icon);
}

function Page_SetExploreSelectedIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let var_000 = document.createElementNS(xmlns, "svg");
    var_000.setAttribute('aria-label', 'Explore');
    var_000.setAttribute('class', 'instagram-toolbox-icon');
    var_000.setAttribute('fill', 'currentColor');
    var_000.setAttribute('height', '24');
    var_000.setAttribute('role', 'img');
    var_000.setAttribute('viewBox', '0 0 24 24');
    var_000.setAttribute('width', '24');

    let var_001 = document.createElement("title");

    var_001.innerText = 'Explore';


    let var_002 = document.createElementNS(xmlns, "path");
    var_002.setAttribute('d', 'm13.173 13.164 1.491-3.829-3.83 1.49ZM12.001.5a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12.001.5Zm5.35 7.443-2.478 6.369a1 1 0 0 1-.57.569l-6.36 2.47a1 1 0 0 1-1.294-1.294l2.48-6.369a1 1 0 0 1 .57-.569l6.359-2.47a1 1 0 0 1 1.294 1.294Z');

    var_000.appendChild(var_001);
    var_000.appendChild(var_002);

    let icon = document.getElementById('instagram-explore-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(var_000);
}

function Page_SetDirectSelectedIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let var_007 = document.createElementNS(xmlns, "svg");
    var_007.setAttribute('aria-label', 'Direct');
    var_007.setAttribute('class', 'instagram-toolbox-icon');
    var_007.setAttribute('fill', 'currentColor');
    var_007.setAttribute('height', '24');
    var_007.setAttribute('role', 'img');
    var_007.setAttribute('viewBox', '0 0 24 24');
    var_007.setAttribute('width', '24');

    let var_008 = document.createElement("title");

    var_008.innerText = 'Direct';


    let var_009 = document.createElementNS(xmlns, "path");
    var_009.setAttribute('d', 'M22.91 2.388a.69.69 0 0 0-.597-.347l-20.625.002a.687.687 0 0 0-.482 1.178L7.26 9.16a.686.686 0 0 0 .778.128l7.612-3.657a.723.723 0 0 1 .937.248.688.688 0 0 1-.225.932l-7.144 4.52a.69.69 0 0 0-.3.743l2.102 8.692a.687.687 0 0 0 .566.518.655.655 0 0 0 .103.008.686.686 0 0 0 .59-.337L22.903 3.08a.688.688 0 0 0 .007-.692');
    var_009.setAttribute('fill-rule', 'evenodd');

    var_007.appendChild(var_008);
    var_007.appendChild(var_009);

    let icon = document.getElementById('instagram-direct-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(var_007);
}

function NavBar_SetDirectStandbyIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let instagram_direct_icon = document.createElementNS(xmlns, "svg");
    instagram_direct_icon.setAttribute('id', 'instagram-direct-icon');
    instagram_direct_icon.onclick = (e) => {
        window.location.href = "/direct";
    };
    instagram_direct_icon.setAttribute('aria-label', 'Direct');
    instagram_direct_icon.setAttribute('class', 'instagram-toolbox-icon');
    instagram_direct_icon.setAttribute('fill', 'currentColor');
    instagram_direct_icon.setAttribute('height', '24');
    instagram_direct_icon.setAttribute('role', 'img');
    instagram_direct_icon.setAttribute('viewBox', '0 0 24 24');
    instagram_direct_icon.setAttribute('width', '24');

    let var_0010 = document.createElement("title");

    var_0010.innerText = 'Direct';


    let var_0011 = document.createElementNS(xmlns, "line");
    var_0011.setAttribute('fill', 'none');
    var_0011.setAttribute('stroke', 'currentColor');
    var_0011.setAttribute('stroke-linejoin', 'round');
    var_0011.setAttribute('stroke-width', '2');
    var_0011.setAttribute('x1', '22');
    var_0011.setAttribute('x2', '9.218');
    var_0011.setAttribute('y1', '3');
    var_0011.setAttribute('y2', '10.083');
    let instagram_toolbox_editable_svg_type1 = document.createElementNS(xmlns, "polygon");
    instagram_toolbox_editable_svg_type1.setAttribute('fill', 'none');
    instagram_toolbox_editable_svg_type1.setAttribute('class', 'instagram-toolbox-editable-svg-type');
    instagram_toolbox_editable_svg_type1.setAttribute('points', '11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334');
    instagram_toolbox_editable_svg_type1.setAttribute('stroke', 'currentColor');
    instagram_toolbox_editable_svg_type1.setAttribute('stroke-linejoin', 'round');
    instagram_toolbox_editable_svg_type1.setAttribute('stroke-width', '2');

    instagram_direct_icon.appendChild(var_0010);
    instagram_direct_icon.appendChild(var_0011);
    instagram_direct_icon.appendChild(instagram_toolbox_editable_svg_type1);

    let icon = document.getElementById('instagram-direct-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(instagram_direct_icon);


}

function Page_SetHomeSelectedIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let instagram_home_icon = document.createElementNS(xmlns, "svg");
    instagram_home_icon.setAttribute('id', 'instagram-home-icon');
    instagram_home_icon.onclick = (e) => {

        window.location.href = "/";
        //Page_RenderHomePage(xmr, posts);;
    };
    instagram_home_icon.setAttribute('aria-label', 'Home');
    instagram_home_icon.setAttribute('class', 'instagram-toolbox-icon');
    instagram_home_icon.setAttribute('fill', 'currentColor');
    instagram_home_icon.setAttribute('height', '24');
    instagram_home_icon.setAttribute('role', 'img');
    instagram_home_icon.setAttribute('viewBox', '0 0 24 24');
    instagram_home_icon.setAttribute('width', '24');

    let var_0012 = document.createElement("title");

    var_0012.innerText = 'Home';


    let instagram_toolbox_editable_svg_type2 = document.createElementNS(xmlns, "path");
    instagram_toolbox_editable_svg_type2.setAttribute('class', 'instagram-toolbox-editable-svg-type');
    instagram_toolbox_editable_svg_type2.setAttribute('d', 'M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z');
    instagram_toolbox_editable_svg_type2.setAttribute('fill', 'black');
    instagram_toolbox_editable_svg_type2.setAttribute('stroke', 'currentColor');
    instagram_toolbox_editable_svg_type2.setAttribute('stroke-linejoin', 'round');
    instagram_toolbox_editable_svg_type2.setAttribute('stroke-width', '2');

    instagram_home_icon.appendChild(var_0012);
    instagram_home_icon.appendChild(instagram_toolbox_editable_svg_type2);

    let icon = document.getElementById('instagram-home-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(instagram_home_icon);
}

function NavBar_SetHomeStandbyIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let instagram_home_icon = document.createElementNS(xmlns, "svg");
    instagram_home_icon.setAttribute('id', 'instagram-home-icon');
    instagram_home_icon.onclick = (e) => {
        window.location.href = "/";
    };
    instagram_home_icon.setAttribute('aria-label', 'Home');
    instagram_home_icon.setAttribute('class', 'instagram-toolbox-icon');
    instagram_home_icon.setAttribute('fill', 'currentColor');
    instagram_home_icon.setAttribute('height', '24');
    instagram_home_icon.setAttribute('role', 'img');
    instagram_home_icon.setAttribute('viewBox', '0 0 24 24');
    instagram_home_icon.setAttribute('width', '24');

    let var_0014 = document.createElement("title");

    var_0014.innerText = 'Home';


    let instagram_toolbox_editable_svg_type4 = document.createElementNS(xmlns, "path");
    instagram_toolbox_editable_svg_type4.setAttribute('class', 'instagram-toolbox-editable-svg-type');
    instagram_toolbox_editable_svg_type4.setAttribute('d', 'M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z');
    instagram_toolbox_editable_svg_type4.setAttribute('fill', 'none');
    instagram_toolbox_editable_svg_type4.setAttribute('stroke', 'currentColor');
    instagram_toolbox_editable_svg_type4.setAttribute('stroke-linejoin', 'round');
    instagram_toolbox_editable_svg_type4.setAttribute('stroke-width', '2');

    instagram_home_icon.appendChild(var_0014);
    instagram_home_icon.appendChild(instagram_toolbox_editable_svg_type4);

    let icon = document.getElementById('instagram-home-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(instagram_home_icon);


}

function Page_SetLikeSelectedIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let var_0016 = document.createElementNS(xmlns, "svg");
    var_0016.setAttribute('aria-label', 'Notifications');
    var_0016.setAttribute('class', 'instagram-toolbox-icon');
    var_0016.setAttribute('fill', 'currentColor');
    var_0016.setAttribute('height', '24');
    var_0016.setAttribute('role', 'img');
    var_0016.setAttribute('viewBox', '0 0 24 24');
    var_0016.setAttribute('width', '24');
    var_0016.onclick = (e) => {
        
    };
    
    let var_0017 = document.createElement("title");
    
    var_0017.innerText = 'Notifications';
    
    
    let var_0018 = document.createElementNS(xmlns, "path");
    var_0018.setAttribute('d', 'M17.075 1.987a5.852 5.852 0 0 0-5.07 2.66l-.008.012-.01-.014a5.878 5.878 0 0 0-5.062-2.658A6.719 6.719 0 0 0 .5 8.952c0 3.514 2.581 5.757 5.077 7.927.302.262.607.527.91.797l1.089.973c2.112 1.89 3.149 2.813 3.642 3.133a1.438 1.438 0 0 0 1.564 0c.472-.306 1.334-1.07 3.755-3.234l.978-.874c.314-.28.631-.555.945-.827 2.478-2.15 5.04-4.372 5.04-7.895a6.719 6.719 0 0 0-6.425-6.965Z');
    
    var_0016.appendChild(var_0017);
    var_0016.appendChild(var_0018);
    
    
    let icon = document.getElementById('instagram-notification-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(var_0016);

    
}

function NavBar_SetLikeStandbyIcon() {
    var xmlns = 'http://www.w3.org/2000/svg';
    let instagram_notification_icon = document.createElementNS(xmlns, "svg");
    instagram_notification_icon.setAttribute('id', 'instagram-notification-icon');
    instagram_notification_icon.setAttribute('aria-label', 'Notifications');
    instagram_notification_icon.setAttribute('class', 'instagram-toolbox-icon');
    instagram_notification_icon.setAttribute('fill', 'currentColor');
    instagram_notification_icon.setAttribute('height', '24');
    instagram_notification_icon.setAttribute('role', 'img');
    instagram_notification_icon.setAttribute('viewBox', '0 0 24 24');
    instagram_notification_icon.setAttribute('width', '24');

    let var_0015 = document.createElement("title");

    var_0015.innerText = 'Notifications';


    let instagram_toolbox_editable_svg_type5 = document.createElementNS(xmlns, "path");
    instagram_toolbox_editable_svg_type5.setAttribute('class', 'instagram-toolbox-editable-svg-type');
    instagram_toolbox_editable_svg_type5.setAttribute('d', 'M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z');
    instagram_toolbox_editable_svg_type5.setAttribute('fill', 'black');

    instagram_notification_icon.appendChild(var_0015);
    instagram_notification_icon.appendChild(instagram_toolbox_editable_svg_type5);

    let icon = document.getElementById('instagram-notification-icon-container');
    Page_RemoveAllChildNodes(icon);
    icon.appendChild(instagram_notification_icon);
}