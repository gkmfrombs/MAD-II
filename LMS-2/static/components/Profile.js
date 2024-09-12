export default {
    data() {
        return {
            user_profile: {
                name: '',
                email: '',
                password: '',
                cpassword: ''
            },
            error: '',
            message: ''
        };
    },
    methods: {
        async getUserProfile() {
            try {
                const res = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.user_profile.name = data.name;
                    this.user_profile.email = data.email;
                } else {
                    this.error = data.message;
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                this.error = 'Error fetching profile';
            }
        },
        async updateUserProfile() {
            const formData = {
                name: this.user_profile.name,
                email: this.user_profile.email,
                password: this.user_profile.password,
                cpassword: this.user_profile.cpassword
            };

            try {
                const res = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (res.ok) {
                    this.message = "Profile updated successfully";
                } else {
                    this.error = data.message;
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                this.error = 'Error updating profile';
            }
        }
    },
    created() {
        this.getUserProfile();
    },
    template: `
    <div class="px-5 mt-5 pb-5">
        <h4>Edit Profile</h4>
        <hr>
        <div class="alert alert-danger" v-if="error">
            {{ error }}
        </div>
        <div class="alert alert-info" v-if="message">
            {{ message }}
        </div>
        <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" v-model="user_profile.name" class="form-control">
        </div>
        <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" v-model="user_profile.email" class="form-control">
        </div>
        <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" v-model="user_profile.password" class="form-control">
        </div>
        <div class="form-group">
            <label class="form-label">Current Password</label>
            <input type="password" v-model="user_profile.cpassword" class="form-control">
        </div>
        <div class="text-end mt-3">
            <button class="btn btn-primary" @click="updateUserProfile">Save</button>
        </div>
    </div>
    `
};
