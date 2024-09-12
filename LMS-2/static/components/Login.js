export default {
    data: () => ({
        user: {
            email: '',
            password: ''
        },
        error: ''
    }),
    methods: {
        async login() {
            fetch('/user_login', {
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
                    localStorage.setItem('role', data.role);
                    this.$router.push({ path: '/' });
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
        <div class="col-lg-6 pb-5" style="height:100vh;background:url('static/img/student.webp') center;background-size:cover;">
        </div>
        <div class="col-lg-6">
            <div class="row justify-content-center">
                <div class="col-lg-6">
                    <div style="margin-top: 140px">
                        <h3>Login</h3>
                        <div class="alert alert-danger" v-if="error !== ''">
                            {{ error }}
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
                            <button class="btn btn-dark" @click="login">
                                LOGIN
                            </button>
                        </div>
                        <p class="mb-0 mt-2">Don't have an account yet?</p>
                        <button class="btn btn-outline-dark" @click="$router.push({ path: '/register' })">
                        Register                        
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};
