// $(function() {
//     $("#navigation__main").load('./src/components/navigation.html');
//     $("#game__grid").load('./src/components/game_table.html');
// });

let toggleNav = () => {
    let sideNav = document.getElementById('nav__side');
    let menuButton = document.getElementById('menu_button');
    let menuIcon = document.getElementById('menu_icon');

    if (sideNav.classList.contains('closed-nav')) {
        sideNav.classList.add('open-nav');
        sideNav.classList.remove('closed-nav');
        menuButton.style.backgroundColor = '#151515';
        menuIcon.style.color = '#fafafa';
    } else if (sideNav.classList.contains('open-nav')) {
        sideNav.classList.add('closed-nav');
        sideNav.classList.remove('open-nav');
        menuButton.style.backgroundColor = '#fafafa';
        menuIcon.style.color = '#151515';
    }
};

let closeNav = () => {
    let sideNav = document.getElementById('nav__side');
    let menuButton = document.getElementById('menu_button');
    let menuIcon = document.getElementById('menu_icon');

    if (sideNav.classList.contains('open-nav')) {
        sideNav.classList.add('closed-nav');
        sideNav.classList.remove('open-nav');
        menuButton.style.backgroundColor = '#fafafa';
        menuIcon.style.color = '#151515';
    }
};