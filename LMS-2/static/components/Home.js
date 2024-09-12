export default {
  data() {
    return {
      sections: [],
      books: [],
      feedbacks: {},
      selectedSection: null,
      selectedSectionDescription: '',
      error: '',
      showModal: false,
      selectedBook: null,
    };
  },
  methods: {
    async fetchSections() {
      try {
        const res = await fetch('/api/student/sections', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const data = await res.json();
        if (res.ok) {
          this.sections = data.sections;
        } else {
          this.error = data.error || 'Failed to fetch sections';
        }
      } catch (error) {
        this.error = 'An error occurred while fetching sections';
      }
    },

    async fetchBooks(sectionId) {
      try {
        const res = await fetch(`/api/student/sections/${sectionId}/books`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const data = await res.json();
        if (res.ok) {
          this.books = data.books;
          this.selectedSection = sectionId;
          this.selectedSectionDescription = this.sections.find(section => section.id === sectionId).description;
          this.fetchFeedbacks(data.books.map(book => book.id)); // Fetch feedbacks for the books
        } else {
          this.error = data.error || 'Failed to fetch books';
        }
      } catch (error) {
        this.error = 'An error occurred while fetching books';
      }
    },

    async fetchFeedbacks(bookIds) {
      try {
        const feedbackPromises = bookIds.map(async (bookId) => {
          const res = await fetch(`/api/feedback/${bookId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (res.ok) {
            const data = await res.json();
            // Sort feedbacks by created_date in descending order and keep only the most recent one
            const mostRecentFeedback = data.feedbacks
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
            this.$set(this.feedbacks, bookId, mostRecentFeedback ? [mostRecentFeedback] : []);
          }
        });
        await Promise.all(feedbackPromises);
      } catch (error) {
        this.error = 'An error occurred while fetching feedbacks';
      }
    },

    async requestBook(bookId) {
      try {
        const res = await fetch(`/api/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ book_id: bookId })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Book request submitted successfully');
        } else {
          this.error = data.error || 'Failed to request the book';
        }
      } catch (error) {
        this.error = 'An error occurred while requesting the book';
      }
    },

    selectSection(sectionId) {
      this.fetchBooks(sectionId);
    },

    clearSelection() {
      this.selectedSection = null;
      this.selectedSectionDescription = '';
      this.books = [];
      this.feedbacks = {};
    },
    showSummary(book) {
      this.selectedBook = book;
      this.showModal = true;
    },
    hideSummary() {
      this.showModal = false;
      this.selectedBook = null;
    },
    randomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  },
  created() {
    this.fetchSections();
  },
  template: `
  <div class="container mt-5">
  <h2 class="mb-4">Student Dashboard</h2>
  <div class="alert alert-danger" v-if="error">{{ error }}</div>

  <div v-if="!selectedSection" class="row">
    <h4 class="col-12 mb-3">Sections</h4>
    <div v-for="section in sections" :key="section.id" class="col-md-4">
      <div class="card mb-4 section-card">
        <div class="card-body">
          <h5 class="card-title">{{ section.name }}</h5>
          <button class="btn btn-primary" @click="selectSection(section.id)">View Books</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="selectedSection">
    <button class="btn btn-secondary mb-3" @click="clearSelection">Back to Sections</button>
    <h4 class="mb-3">Books</h4>
    <p class="text-muted mb-4">{{ selectedSectionDescription }}</p>
    <div class="row">
      <div v-for="book in books" :key="book.id" class="col-md-3">
        <div class="card mb-4 book-card">
          <img :src="book.thumbnail" class="card-img-top" alt="Thumbnail">
          <div class="card-body">
            <h5 class="card-title">{{ book.name }}</h5>
            <p class="card-text"><strong>Author:</strong> {{ book.author }}</p>
            <p class="card-text"><strong>Date Issued:</strong> {{ book.date_issued }}</p>
            <div v-if="!book.requested">
              <button class="btn btn-primary" @click="requestBook(book.id)">Request</button>
              <button class="btn btn-outline-secondary mt-2" @click="showSummary(book)">Summary</button>
            </div>
            <a v-else :href="book.content" class="btn btn-primary" target="_blank">View Content</a>
            <div v-if="feedbacks[book.id]" class="feedback-section mt-3">
              <h6>Feedbacks:</h6>
              <div v-if="feedbacks[book.id].length" class="feedback-item">
                <p>{{ feedbacks[book.id][0].user_name }}: {{ feedbacks[book.id][0].feedback }}
                  <span v-for="(star, index) in feedbacks[book.id][0].rating" :key="'filled-' + index" class="bi bi-star-fill text-warning"></span>
                  <span v-for="(star, index) in (5 - feedbacks[book.id][0].rating)" :key="'empty-' + index" class="bi bi-star text-warning"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal for Book Summary -->
  <div v-if="showModal" class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Book Summary</h5>
          <button type="button" class="close" @click="hideSummary" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedBook">
            <img :src="selectedBook.thumbnail" class="card-img-top mb-3" alt="Thumbnail">
            <h5 class="card-title">{{ selectedBook.name }}</h5>
            <p class="card-text"><strong>Author:</strong> {{ selectedBook.author }}</p>
            <p class="card-text"><strong>Date Issued:</strong> {{ selectedBook.date_issued }}</p>
            <p class="card-text">
              <span v-for="i in 10" :key="i" :style="{color: randomColor()}">
                This is just a sample summary.
                In the heart of the ancient forest, 
                where the silver moonlight danced upon the whispering leaves,
                 a hidden portal shimmered with arcane energy, 
                 promising adventures beyond mortal imagination. 
              </span>
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hideSummary">Close</button>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  // 
};
