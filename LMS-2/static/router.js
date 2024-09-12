
import Login from './components/Login.js';
import Register from './components/Register.js';
import Home from './components/Home.js';
import LibLogin from './components/LibLogin.js';
import LibrarianDashboard from './components/LibrarianDashboard.js';
import MyBooks from './components/MyBooks.js';

import Profile from './components/Profile.js';
import SearchResults from './components/SearchResults.js';

const routes = [
    { path: '/', component: Home, name: 'Home' },
    { path: '/user_login', component: Login, name: 'Login' },
    { path: '/register', component: Register, name: 'Register' },
    { path: '/librarian_login', component: LibLogin, name: 'LibLogin' },
    { path: '/librarian', component: LibrarianDashboard, name: 'LibrarianDashboard' },
    { path: '/my-requests', component: MyBooks, name: 'MyBooks' },
    
    { path: '/profile', component: Profile, name: 'Profile' },
    { path: '/search-results', component: SearchResults, name: 'SearchResults' },
];

const router = new VueRouter({
    routes
});

router.beforeEach((to, from, next) => {
    let isLoggedIn = localStorage.getItem("auth-token");
    let userRole = localStorage.getItem("role");
    const loginPages = ["LibLogin", "Register", "Login"];

    if (loginPages.includes(to.name)) {
        if (isLoggedIn) {
            if (userRole === "librarian" && to.name === "LibLogin") {
                next({ name: "LibrarianDashboard" });
            } else {
                next({ name: "Home" });
            }
        } else {
            next();
        }
    } else {
        if (isLoggedIn) {
            if (userRole === "librarian" && to.name.startsWith("Librarian")) {
                next();
            } else if (userRole !== "librarian" && to.name !== "LibrarianDashboard") {
                next();
            } else if (userRole === "librarian") {
                next({ name: "LibrarianDashboard" });
            } else {
                next({ name: "Home" });
            }
        } else {
            next({ name: "Login" });
        }
    }
});

export default router;












