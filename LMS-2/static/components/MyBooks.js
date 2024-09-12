export default {
  data() {
    return {
      books: [],
      feedbacks: {},
      feedbackText: '',
      feedbackRating: 0,
      requests: [],
      error: ''
    };
  },
  methods: {
    async fetchRequests() {
      try {
        const res = await fetch('/api/requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const data = await res.json();
        if (res.ok) {
          this.requests = data.requests;
          for (let request of data.requests) {
            await this.fetchFeedbacks(request.book_id);
            
          }
        } else {
          this.error = data.error || 'Failed to fetch requests';
        }
      } catch (error) {
        this.error = 'An error occurred while fetching requests';
      }
    },
    async returnBook(bookId) {
      try {
        const res = await fetch('/api/return', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ book_id: bookId })
        });
        const data = await res.json();
        if (res.ok) {
          this.fetchRequests();
          alert(data.message);
        } else {
          this.error = data.error || 'Failed to return book';
        }
      } catch (error) {
        this.error = 'An error occurred while returning book';
      }
    },
    async fetchFeedbacks(bookId) {
      try {
        const res = await fetch(`/api/feedback/${bookId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const data = await res.json();
        if (res.ok) {
          this.$set(this.feedbacks, bookId, data.feedbacks);
        } else {
          this.error = data.error || 'Failed to fetch feedbacks';
        }
      } catch (error) {
        this.error = 'An error occurred while fetching feedbacks';
      }
    },
    async submitFeedback(bookId) {
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ 
            book_id: bookId, 
            feedback: this.feedbackText,
            rating: this.feedbackRating
          })
        });
        const data = await res.json();
        if (res.ok) {
          this.feedbackText = '';
          this.feedbackRating = 0;
          this.fetchFeedbacks(bookId);
          alert(data.message);
        } else {
          this.error = data.error || 'Failed to submit feedback';
        }
      } catch (error) {
        this.error = 'An error occurred while submitting feedback';
      }
    },
    viewBookContent(book) {
      if (book.status === 'accepted') {
        window.open(book.book_content, '_blank');
      } else {
        alert('Book access has not been accepted yet.');
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  },
  created() {
    this.fetchRequests();
  },
  template: `
    <div class="container mt-5">
      <h2 class="mb-4">My Books</h2>
      <div class="alert alert-danger" v-if="error">{{ error }}</div>

      <div v-if="requests.length === 0">
        <p>You have no book requests.</p>
      </div>
      <div v-else>
        <div v-for="request in requests" :key="request.id" class="card mb-4 book-card">
          <div class="card-body">
            <h3>{{ request.book_name }}</h3>
            <p>Status: {{ request.status }}</p>
            <p v-if="request.status === 'accepted'">Accepted Date: {{ formatDate(request.accepted_date) }}</p>

            <p>Request Date: {{ formatDate(request.request_date) }}</p>
            <p v-if="request.access_expiry_date">Access Expiry Date: {{ formatDate(request.access_expiry_date) }}</p>
            <button v-show="Date.now() < new Date(request.access_expiry_date)" class="btn btn-primary" @click="viewBookContent(request)">View Content</button>
            <button class="btn btn-secondary" @click="returnBook(request.book_id)">Return Book</button>
            <div v-if="request.status === 'accepted'">
              <textarea v-model="feedbackText" placeholder="Leave your feedback" class="form-control mb-2"></textarea>
              <label for="rating">Rating:</label>
              <select v-model="feedbackRating" class="form-control mb-2">
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
              <button class="btn btn-success" @click="submitFeedback(request.book_id)">Submit Feedback</button>
              <div v-if="feedbacks[request.book_id] && feedbacks[request.book_id].length > 0" class="mt-3">
                <h4>Feedbacks:</h4>
                <ul class="list-group">
                  <li class="list-group-item">
                    <span>{{ feedbacks[request.book_id][0].feedback }}</span>
                    <span v-for="(star, index) in feedbacks[request.book_id][0].rating" :key="'filled-' + index" class="bi bi-star-fill text-warning"></span>
                    <span v-for="(star, index) in (5 - feedbacks[request.book_id][0].rating)" :key="'empty-' + index" class="bi bi-star text-warning"></span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  
};
