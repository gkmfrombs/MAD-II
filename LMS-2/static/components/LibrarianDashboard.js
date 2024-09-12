export default {
    data: () => ({
        sections: [],
        newSection: {
            name: '',
            description: '',
            created_date: ''
        },
        editingSection: null,
        error: '',
        success: '',

        books: [],
        newBook: {
            name: '',
            author: '',
            date_issued: '',
            thumbnail: null,
            content: null
        },
        editingBook: null,
        currentSectionId: null, // To track the current section
        // Data for handling book requests
        requests: [],
        requestError: '',
        statistics: {
            bookCount: 0,
            userCount: 0,
            requestCount: 0,
            feedbackCount: 0,
            chartImage: ''
        },
        showStatistics: false,
        statisticsError: '',
        message: ''
        }),

    methods: {
        // Section methods
        async fetchSections() {
            try {
                const res = await fetch('/api/sections', {
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

        async addSection() {
            try {
                this.newSection.created_date = new Date(this.newSection.created_date).toISOString().split('T')[0];

                const res = await fetch('/api/sections', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify(this.newSection)
                });
                const data = await res.json();
                if (res.ok) {
                    this.success = 'Section created successfully';
                    this.newSection = {
                        name: '',
                        description: '',
                        created_date: ''
                    };
                    this.fetchSections();
                } else {
                    this.error = data.error || 'Failed to create section';
                }
            } catch (error) {
                this.error = 'An error occurred while creating section';
            }
        },

        async updateSection() {
            try {
                const res = await fetch(`/api/sections/${this.editingSection.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify(this.editingSection)
                });
                const data = await res.json();
                if (res.ok) {
                    this.success = 'Section updated successfully';
                    this.editingSection = null;
                    this.fetchSections();
                } else {
                    this.error = data.error || 'Failed to update section';
                }
            } catch (error) {
                this.error = 'An error occurred while updating section';
            }
        },

        async deleteSection(sectionId) {
            try {
                const res = await fetch(`/api/sections/${sectionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.success = 'Section deleted successfully';
                    this.fetchSections();
                } else {
                    this.error = data.error || 'Failed to delete section';
                }
            } catch (error) {
                this.error = 'An error occurred while deleting section';
            }
        },

        startEditing(section) {
            this.editingSection = { ...section };
        },

        cancelEditing() {
            this.editingSection = null;
        },

        // Book methods
        async fetchBooks(sectionId) {
            try {
                const res = await fetch(`/api/sections/${sectionId}/books`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.books = data.books;
                } else {
                    this.error = data.error || 'Failed to fetch books';
                }
            } catch (error) {
                this.error = 'An error occurred while fetching books';
            }
        },

     
        async addBook(sectionId) {
            try {
                const formData = new FormData();
                formData.append('name', this.newBook.name);
                formData.append('author', this.newBook.author);
                formData.append('date_issued', this.newBook.date_issued);
                if (this.newBook.thumbnail) {
                    formData.append('thumbnail', this.newBook.thumbnail);
                }
                if (this.newBook.content) {
                    formData.append('content', this.newBook.content);
                }
        
                const res = await fetch(`/api/sections/${sectionId}/books`, {
                    method: 'POST',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                        // Note: Do not set Content-Type here. It will be set automatically by FormData.
                    },
                    body: formData
                });
        
                const data = await res.json();
                if (res.ok) {
                    this.success = 'Book created successfully';
                    this.newBook = {
                        name: '',
                        author: '',
                        date_issued: '',
                        thumbnail: null,
                        content: null
                    };
                    this.fetchBooks(sectionId);
                } else {
                    this.error = data.error || 'Failed to create book';
                }
            } catch (error) {
                this.error = 'An error occurred while creating book';
            }
        },
        

        async updateBook(sectionId, bookId) {
            try {
                const formData = new FormData();
                formData.append('name', this.editingBook.name);
                formData.append('author', this.editingBook.author);
                formData.append('date_issued', this.editingBook.date_issued);
                formData.append('thumbnail', this.editingBook.thumbnail);
                formData.append('content', this.editingBook.content);

                const res = await fetch(`/api/sections/${sectionId}/books/${bookId}`, {
                    method: 'PUT',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: formData
                });
                const data = await res.json();
                if (res.ok) {
                    this.success = 'Book updated successfully';
                    this.editingBook = null;
                    this.fetchBooks(sectionId);
                } else {
                    this.error = data.error || 'Failed to update book';
                }
            } catch (error) {
                this.error = 'An error occurred while updating book';
            }
        },

        async deleteBook(sectionId, bookId) {
            try {
                const res = await fetch(`/api/sections/${sectionId}/books/${bookId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.success = 'Book deleted successfully';
                    this.fetchBooks(sectionId);
                } else {
                    this.error = data.error || 'Failed to delete book';
                }
            } catch (error) {
                this.error = 'An error occurred while deleting book';
            }
        },

        startEditingBook(book) {
            this.editingBook = { ...book };
        },

        cancelEditingBook() {
            this.editingBook = null;
        },

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                if (event.target.name === 'thumbnail') {
                    this.newBook.thumbnail = file;
                } else if (event.target.name === 'content') {
                    this.newBook.content = file;
                } else if (event.target.name === 'editingThumbnail') {
                    this.editingBook.thumbnail = file;
                } else if (event.target.name === 'editingContent') {
                    this.editingBook.content = file;
                }
            }
        },

        openBooksModal(sectionId) {
            this.currentSectionId = sectionId;
            this.fetchBooks(sectionId);
            const modal = new bootstrap.Modal(document.getElementById('booksModal'));
            modal.show();
        },

        closeBooksModal() {
            this.currentSectionId = null;
            this.books = [];
        },
          // Methods for handling book requests
          async fetchRequests() {
            try {
                const response = await fetch('/api/manage_requests', {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    this.requests = data.requests;
                } else {
                    this.requestError = data.error || 'Failed to fetch requests';
                }
            } catch (error) {
                this.requestError = 'An error occurred while fetching requests';
            }
        },

        async handleRequest(requestId, action) {
            try {
                const response = await fetch('/api/manage_requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify({
                        request_id: requestId,
                        action: action
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    this.fetchRequests();
                    alert(data.message);
                } else {
                    this.requestError = data.error || 'Failed to handle the request';
                }
            } catch (error) {
                this.requestError = 'An error occurred while handling the request';
            }
        },

        openRequestsModal() {
            this.fetchRequests();
            const modal = new bootstrap.Modal(document.getElementById('requestsModal'));
            modal.show();
        },

        closeRequestsModal() {
            this.requests = [];
        },
           // Methods for handling statistics
           async fetchStatistics() {
            try {
                const res = await fetch('/api/statistics', {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    this.statistics.bookCount = data.bookCount;
                    this.statistics.userCount = data.userCount;
                    this.statistics.requestCount = data.requestCount;
                    this.statistics.feedbackCount = data.feedbackCount;
                    this.statistics.chartImage = data.chartImage;
                    this.openStatisticsModal();
                } else {
                    this.statisticsError = data.error;
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
                this.statisticsError = 'Error fetching statistics';
            }
        },
        openStatisticsModal() {
            const modal = new bootstrap.Modal(document.getElementById('statisticsModal'));
            modal.show();
        },
        closeStatisticsModal() {
            this.showStatistics = false;
        }
    },

    created() {
        this.fetchSections();
    },

    template: `
    <div class="container mt-5">
        <h2 class="mb-4">Library Sections</h2>
        <div>
            <button class="btn btn-primary" @click="openRequestsModal">Manage Requests</button>
            <button class="btn btn-info" @click="fetchStatistics">Show Statistics</button>
        </div>
        <div class="alert alert-success" v-if="success">{{ success }}</div>
        <div class="alert alert-danger" v-if="error">{{ error }}</div>

        <div class="mb-4">
            <h4>Add New Section</h4>
            <input v-model="newSection.name" placeholder="Section Name" class="form-control mb-2" />
            <textarea v-model="newSection.description" placeholder="Section Description" class="form-control mb-2" />
            <input type="date" v-model="newSection.created_date" class="form-control mb-2" />
            <button class="btn btn-success" @click="addSection">Add Section</button>
        </div>

        <div v-if="editingSection">
            <h4>Edit Section</h4>
            <input v-model="editingSection.name" placeholder="Section Name" class="form-control mb-2" />
            <input v-model="editingSection.description" placeholder="Section Description" class="form-control mb-2" />
            <button class="btn btn-primary" @click="updateSection">Update Section</button>
            <button class="btn btn-secondary" @click="cancelEditing">Cancel</button>
        </div>
        <table class="table table-striped mt-4">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="section in sections" :key="section.id">
                    <td>{{ section.name }}</td>
                    <td>{{ section.description }}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" @click="startEditing(section)">Edit</button>
                        <button class="btn btn-outline-danger btn-sm" @click="deleteSection(section.id)">Delete</button>
                        <button class="btn btn-info btn-sm mt-1" @click="openBooksModal(section.id)">Manage Books</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Books Modal -->
        <div class="modal fade" id="booksModal" tabindex="-1" aria-labelledby="booksModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="booksModalLabel">Manage Books</h5>
                        <button type="button" class="btn-close" @click="closeBooksModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h4>Add New Book</h4>
                            <input v-model="newBook.name" placeholder="Book Name" class="form-control mb-2" />
                            <input v-model="newBook.author" placeholder="Author" class="form-control mb-2" />
                            <input type="date"  v-model="newBook.date_issued" class="form-control mb-2" />
                            <label class="form-label">Thumbnail:
                            <input type="file" @change="handleFileUpload" name="thumbnail" class="form-control mb-2" />
                            </label>
                            <label class="form-label">Content:
                            <input type="file" @change="handleFileUpload" name="content" class="form-control mb-2" />
                            </label>
                            <button class="btn btn-success" @click="addBook(currentSectionId)">Add Book</button>
                        </div>

                        <div v-if="editingBook">
                            <h4>Edit Book</h4>
                            <input v-model="editingBook.name" placeholder="Book Name" class="form-control mb-2" />
                            <input v-model="editingBook.author" placeholder="Author" class="form-control mb-2" />
                            <input type="date" v-model="editingBook.date_issued" class="form-control mb-2" />
                            <input type="file" @change="handleFileUpload" name="editingThumbnail" class="form-control mb-2" />
                            <input type="file" @change="handleFileUpload" name="editingContent" class="form-control mb-2" />
                            <button class="btn btn-primary" @click="updateBook(currentSectionId, editingBook.id)">Update Book</button>
                            <button class="btn btn-secondary" @click="cancelEditingBook">Cancel</button>
                                                </div>
                        <table class="table table-striped mt-4">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Author</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="book in books" :key="book.id">
                                        <td>{{ book.name }}</td>
                                        <td>{{ book.author}}</td>
                                        <td>
                                            <button class="btn btn-primary btn-sm" @click="startEditingBook(book)">Edit</button>
                                            <button class="btn btn-outline-danger btn-sm mt-1" @click="deleteBook(currentSectionId, book.id)">Delete</button>
                                            
                                        </td>
                                    </tr>
                                </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
<div>
        

        <!-- Modal for managing book requests -->
        <div class="modal fade" id="requestsModal" tabindex="-1" aria-labelledby="requestsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="requestsModalLabel">Manage Book Requests</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="requestError" class="alert alert-danger">{{ requestError }}</div>
                        <ul class="list-group">
                            <li v-for="request in requests" :key="request.id" class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <h5>{{ request.book_name || 'Unknown Book' }}</h5>
                                    <p>Requested by: {{ request.user_name }}</p>
                                    <p>Status: {{ request.status }}</p>
                                </div>
                                <div>
                                    <button v-if="request.status === 'pending'" class="btn btn-success btn-sm me-2" @click="handleRequest(request.id, 'accept')">Accept</button>
                                    <button v-if="request.status === 'pending'" class="btn btn-danger btn-sm" @click="handleRequest(request.id, 'reject')">Decline</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeRequestsModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for statistics -->
        <div class="modal fade" id="statisticsModal" tabindex="-1" aria-labelledby="statisticsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="statisticsModalLabel">Library Statistics</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="statisticsError" class="alert alert-danger">{{ statisticsError }}</div>
                        <div class="statistics">
                            <p>Books: {{ statistics.bookCount }}</p>
                            <p>Users: {{ statistics.userCount }}</p>
                            <p>Requests: {{ statistics.requestCount }}</p>
                            <p>Feedbacks: {{ statistics.feedbackCount }}</p>
                        </div>
                        <div class="chart">
                            <img :src="statistics.chartImage" alt="Statistics Chart">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeStatisticsModal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
      `
    
};



  




