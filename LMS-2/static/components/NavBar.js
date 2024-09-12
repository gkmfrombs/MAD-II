
export default {
  data() {
    return {
      searchValue: ''
    };
  },
  methods: {
    search() {
      this.$router.push({ name: 'SearchResults', query: { q: this.searchValue } });
    },
    logOutUser() {
      let x = confirm("Are you sure to log out from the app?");
      if (!x) {
        return;
      }
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      this.$router.push({ name: "Login" });
    }
  },
  created() {
    this.searchValue = this.$route.query.q || '';
  },
  computed: {
    role() {
      const role = localStorage.getItem('role');
      console.log("Current role:", role);
      return role;
    },
    isLoggedIn() {
      return !!localStorage.getItem('auth-token');
    }
  },
  template: `
    <div>
      <nav class="navbar navbar-expand-lg border-bottom border-bottom-2">
        <div class="container-fluid">
          <a class="navbar-brand" href="#"> <h2><strong>G</strong>Wonder</h2></a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <template v-if="!isLoggedIn">
                <li class="nav-item">
                  <router-link to="/user_login" tag="a" class="nav-link">Student Login</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/librarian_login" tag="a" class="nav-link">Librarian Login</router-link>
                </li>
              </template>
              <template v-if="isLoggedIn">
                <li class="nav-item" v-if="role=='student'">
                  <router-link to="/" tag="a" class="nav-link">Home</router-link>
                </li>
                <li class="nav-item" v-if="role=='student'">
                  <router-link to="/profile" tag="a" class="nav-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                            </svg>
                            Profile
                  </router-link>
                </li>
                
                <li class="nav-item" v-if="role=='student'">
                  <router-link to="/my-requests" tag="a" class="nav-link">My Books</router-link>
                </li>
                <li class="nav-item ml-4">
                  <button class="btn btn-outline-danger btn-sm mt-2" @click="logOutUser()">Log Out</button>
                </li>
              </template>
            </ul>
          </div>
          <form class="d-flex" role="search" v-if='isLoggedIn && role=="student"' >
            <input class="form-control mt-3 me-2" type="search" placeholder="Search" v-model="searchValue" aria-label="Search">
            <button type="button" class="btn btn-outline-success mt-3 me-2" @click="search">Search</button>
          </form>
        </div>
      </nav>
    </div>`
};
