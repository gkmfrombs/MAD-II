export default {
    data: () => ({
        user: {
            email: '',
            password: ''
        },
        error: ''
    }),
    methods: {
        async LibrarianLogin() {
            fetch('/librarian_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify(this.user)
            })
            .then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('auth-token', data.token);
                    localStorage.setItem('role', data.role);  // Ensure the server sends the role as 'role'
                    this.$router.push({path: '/librarian'}); // Use the route path here
                } else {
                    this.error = data.message;
                }
            })
            .catch(error => {
                console.error('Error logging in:', error);
                this.error = 'Failed to login. Please try again later.';
            });
        }
    },
    template: `
    <div class="row">
        <div class="col-lg-6">
            <div class="row justify-content-center">
                <div class="col-lg-6">
                    <div style="margin-top: 140px">
                        <h3>Librarian Login</h3>
                        <div class="alert alert-danger" v-if="error!=''">
                            {{error}}
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" v-model="user.email" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" v-model="user.password" class="form-control"/>
                        </div>
                        <div class="form-group mt-3">
                            <button class="btn btn-success" @click="LibrarianLogin">
                                LOGIN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 pb-5" style="height:100vh;background:url('static/img/librarian.webp') center;background-size:cover;">
        </div>
    </div>
    `
};
