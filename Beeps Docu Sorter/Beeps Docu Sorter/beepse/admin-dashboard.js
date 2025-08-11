// Admin Dashboard Logic 💖

class AdminDashboard {
    constructor() {
        this.userSession = this.getUserSession();
        this.allDocuments = [];
        this.clients = [];
        this.processingQueue = [];
        this.currentFilter = 'review';
        
        if (!this.userSession || this.userSession.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        this.initializeDashboard();
        this.loadData();
    }
    
    getUserSession() {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    }
    
    initializeDashboard() {
        // Set welcome message
        document.getElementById('adminWelcome').textContent = `Welcome, ${this.userSession.name}!`;
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Load initial data
        this.generateSampleData();
        this.updateStats();
        this.renderProcessingQueue();
        this.renderClients();
        this.renderDocuments();
    }
    
    initializeEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
        
        // Email button
        document.getElementById('emailBtn').addEventListener('click', () => {
            this.showEmailPanel();
        });
        
        // Test email button functionality
        document.getElementById('emailBtn').addEventListener('dblclick', () => {
            this.testEmailConnection();
        });
        
        // Queue filter buttons
        document.querySelectorAll('.queue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterQueue(e.target.dataset.filter);
            });
        });
        
        // Document browser tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterDocuments(e.target.dataset.folder);
            });
        });
        
        // Email form
        document.getElementById('emailForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendEmail();
        });
    }
    
    generateSampleData() {
        // Load real registered users
        this.clients = this.loadRealClients();
        
        // Generate processing queue from real documents that need review
        this.processingQueue = this.generateProcessingQueue();
        
        // Load client documents from localStorage
        this.loadClientDocuments();
    }
    
    generateProcessingQueue() {
        const queue = [];
        
        // Find documents that need review from all clients
        this.clients.forEach(client => {
            const clientDocs = JSON.parse(localStorage.getItem(`documents_${client.email}`) || '[]');
            
            clientDocs.forEach(doc => {
                if (['review', 'error'].includes(doc.status)) {
                    let type = 'review';
                    let issue = 'Document requires manual review';
                    let priority = 'medium';
                    
                    if (doc.details && doc.details.includes('password')) {
                        type = 'password';
                        issue = 'Document is password-protected and cannot be processed';
                        priority = 'high';
                    } else if (doc.status === 'error') {
                        type = 'error';
                        issue = 'Processing failed - document may be corrupted';
                        priority = 'high';
                    }
                    
                    queue.push({
                        id: `q_${doc.id}`,
                        filename: doc.filename,
                        clientEmail: client.email,
                        clientName: client.name,
                        type: type,
                        priority: priority,
                        uploadTime: new Date(doc.uploadTime).toLocaleString(),
                        issue: issue,
                        action: type === 'password' ? 'Email client for resubmission' : 'Manual review required'
                    });
                }
            });
        });
        
        return queue;
    }
    
    loadRealClients() {
        // Get all registered users from login system
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        const defaultUsers = {
            'client@demo.com': { password: 'demo123', role: 'client', name: 'Demo Client' },
            'john@client.com': { password: 'client123', role: 'client', name: 'John Smith' }
        };
        
        const allUsers = { ...defaultUsers, ...registeredUsers };
        const clients = [];
        
        Object.keys(allUsers).forEach((email, index) => {
            const user = allUsers[email];
            if (user.role === 'client') {
                // Count documents for this client
                const clientDocs = JSON.parse(localStorage.getItem(`documents_${email}`) || '[]');
                
                clients.push({
                    id: index + 1,
                    name: user.name,
                    email: email,
                    status: 'active',
                    documents: clientDocs.length,
                    lastActivity: clientDocs.length > 0 ? 
                        new Date(Math.max(...clientDocs.map(d => new Date(d.uploadTime)))).toISOString().split('T')[0] :
                        new Date().toISOString().split('T')[0]
                });
            }
        });
        
        return clients;
    }
    
    loadClientDocuments() {
        this.allDocuments = [];
        
        this.clients.forEach(client => {
            const clientDocs = localStorage.getItem(`documents_${client.email}`);
            if (clientDocs) {
                const docs = JSON.parse(clientDocs);
                docs.forEach(doc => {
                    doc.clientName = client.name;
                    doc.clientEmail = client.email;
                });
                this.allDocuments.push(...docs);
            }
        });
    }
    
    loadData() {
        this.loadClientDocuments();
        this.updateStats();
        this.renderProcessingQueue();
        this.renderClients();
        this.renderDocuments();
    }
    
    refreshData() {
        // Show loading state
        const refreshBtn = document.getElementById('refreshBtn');
        const originalText = refreshBtn.textContent;
        refreshBtn.textContent = '🔄 Refreshing...';
        refreshBtn.disabled = true;
        
        // Reload all data from localStorage
        setTimeout(() => {
            this.clients = this.loadRealClients();
            this.processingQueue = this.generateProcessingQueue();
            this.loadData();
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
            
            // Show success notification
            this.showNotification('success', 'Data refreshed successfully!');
        }, 1000);
    }
    
    updateStats() {
        const totalDocs = this.allDocuments.length;
        const processedDocs = this.allDocuments.filter(doc => doc.status === 'completed').length;
        const reviewDocs = this.allDocuments.filter(doc => ['review', 'error'].includes(doc.status)).length + this.processingQueue.length;
        const activeClients = this.clients.filter(client => client.status === 'active').length;
        
        document.getElementById('totalDocuments').textContent = totalDocs;
        document.getElementById('processedDocs').textContent = processedDocs;
        document.getElementById('reviewDocs').textContent = reviewDocs;
        document.getElementById('activeClients').textContent = activeClients;
    }
    
    filterQueue(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.queue-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderProcessingQueue();
    }
    
    renderProcessingQueue() {
        const grid = document.getElementById('queueGrid');
        let filteredQueue = this.processingQueue;
        
        if (this.currentFilter !== 'all') {
            filteredQueue = this.processingQueue.filter(item => item.type === this.currentFilter);
        }
        
        if (filteredQueue.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <h3>No items in queue</h3>
                    <p>All documents are processed!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filteredQueue.map(item => this.createQueueCard(item)).join('');
    }
    
    createQueueCard(item) {
        const typeLabels = {
            'password': 'Password Protected',
            'review': 'Manual Review',
            'error': 'Processing Error'
        };
        
        return `
            <div class="queue-item ${item.type}">
                <div class="queue-header">
                    <div class="queue-title">${item.filename}</div>
                    <div class="queue-priority priority-${item.priority}">${item.priority.toUpperCase()}</div>
                </div>
                <div class="queue-details">
                    <strong>Client:</strong> ${item.clientName} (${item.clientEmail})<br>
                    <strong>Type:</strong> ${typeLabels[item.type]}<br>
                    <strong>Uploaded:</strong> ${item.uploadTime}<br>
                    <strong>Issue:</strong> ${item.issue}
                </div>
                <div class="queue-actions">
                    <button class="queue-action-btn primary" onclick="adminDashboard.emailClient('${item.clientEmail}', '${item.type}', '${item.filename}')">
                        📧 Email Client
                    </button>
                    <button class="queue-action-btn" onclick="adminDashboard.resolveItem('${item.id}')">
                        ✅ Resolve
                    </button>
                    <button class="queue-action-btn" onclick="adminDashboard.viewDetails('${item.id}')">
                        👁️ Details
                    </button>
                </div>
            </div>
        `;
    }
    
    renderClients() {
        const table = document.getElementById('clientsTable');
        
        table.innerHTML = `
            <div class="table-header">
                <div>Name</div>
                <div>Email</div>
                <div>Documents</div>
                <div>Status</div>
                <div>Actions</div>
            </div>
            ${this.clients.map(client => `
                <div class="table-row">
                    <div>${client.name}</div>
                    <div>${client.email}</div>
                    <div>${client.documents}</div>
                    <div><span class="client-status status-${client.status}">${client.status}</span></div>
                    <div>
                        <button class="queue-action-btn" onclick="adminDashboard.emailClient('${client.email}')">📧</button>
                        <button class="queue-action-btn" onclick="adminDashboard.viewClientDocs('${client.email}')">📁</button>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    renderDocuments() {
        const grid = document.getElementById('documentGrid');
        
        if (this.allDocuments.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No documents found</h3>
                    <p>Documents will appear here as clients upload them</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.allDocuments.map(doc => this.createDocumentCard(doc)).join('');
    }
    
    createDocumentCard(doc) {
        const icons = {
            'RDL': '📋',
            'RCS': '📝',
            'processing': '⏳',
            'completed': '✅',
            'review': '⚠️',
            'error': '❌'
        };
        
        return `
            <div class="document-card ${doc.status}">
                <div class="doc-icon">${icons[doc.status] || '📄'}</div>
                <div class="doc-name">${doc.processedName || doc.filename}</div>
                <div class="doc-details">
                    <strong>Client:</strong> ${doc.clientName}<br>
                    <strong>Original:</strong> ${doc.filename}<br>
                    <strong>Size:</strong> ${doc.size}<br>
                    <strong>Uploaded:</strong> ${new Date(doc.uploadTime).toLocaleString()}<br>
                    <strong>Status:</strong> ${doc.details}
                </div>
                <div class="doc-actions">
                    <button class="action-btn" onclick="adminDashboard.downloadDocument('${doc.id}')">Download</button>
                    <button class="action-btn" onclick="adminDashboard.emailClient('${doc.clientEmail}', adminDashboard.getDocumentEmailType('${doc.status}', '${doc.docType || ''}'), '${doc.filename}', ${JSON.stringify(doc).replace(/'/g, '\"')})">Email Client</button>
                </div>
            </div>
        `;
    }
    
    emailClient(clientEmail, type = 'general', filename = '', docData = null) {
        this.showEmailPanel();
        const recipientField = document.getElementById('recipientEmail');
        const subjectField = document.getElementById('emailSubject');
        const messageField = document.getElementById('emailMessage');
        
        recipientField.value = clientEmail;
        
        const emailTemplates = this.getEmailTemplate(type, filename, docData);
        subjectField.value = emailTemplates.subject;
        messageField.value = emailTemplates.message;
        
        document.getElementById('emailPanel').style.display = 'flex';
    }
    
    getEmailTemplate(type, filename, docData) {
        const templates = {
            'password': {
                subject: '🔒 Document Resubmission Required - Password Protection',
                message: `Dear Client,\n\nYour document "${filename}" could not be processed because it is password-protected.\n\n🔒 ISSUE: Password-protected PDF detected\n📄 DOCUMENT: ${filename}\n⏰ TIME: ${new Date().toLocaleString()}\n\nACTION REQUIRED:\nPlease resubmit your document without password protection to continue processing.\n\nIf you need assistance, please contact our Document Quality Team.\n\nThank you,\nDocument Quality Team 💖`
            },
            'completed_rdl': {
                subject: '✅ RDL Document Processing Complete',
                message: `Dear ${docData?.clientName || 'Client'},\n\nGreat news! Your Rating Decision Letter has been processed successfully.\n\n✅ STATUS: Processing Complete\n📄 ORIGINAL: ${filename}\n📋 PROCESSED AS: ${docData?.processedName || 'Processed_Document.pdf'}\n👤 CLIENT: ${docData?.clientName || 'N/A'}\n📂 DOCUMENT TYPE: Rating Decision Letter (RDL)\n⏰ COMPLETED: ${new Date().toLocaleString()}\n\nYour RDL document has been properly classified and filed in our system. You can now access it through your client portal.\n\nThank you for using our document processing service!\n\nDocument Quality Team 💖`
            },
            'completed_rcs': {
                subject: '✅ RCS Document Processing Complete',
                message: `Dear ${docData?.clientName || 'Client'},\n\nYour Records/Client Services document has been processed successfully.\n\n✅ STATUS: Processing Complete\n📄 ORIGINAL: ${filename}\n📋 PROCESSED AS: ${docData?.processedName || 'Processed_Document.pdf'}\n👤 CLIENT: ${docData?.clientName || 'N/A'}\n📂 DOCUMENT TYPE: Records/Client Services (RCS)\n⏰ COMPLETED: ${new Date().toLocaleString()}\n\nYour RCS authorization form has been properly processed and is now available in your client portal.\n\nThank you for using our document processing service!\n\nDocument Quality Team 💖`
            },
            'review_unwanted': {
                subject: '⚠️ Document Review Required - Unwanted Document Type',
                message: `Dear Client,\n\nWe've reviewed your document "${filename}" and identified it as an unwanted document type.\n\n⚠️ ISSUE: Unwanted document detected\n📄 DOCUMENT: ${filename}\n🚫 TYPE: ID Document (Driver's License, Passport, etc.)\n⏰ TIME: ${new Date().toLocaleString()}\n\nACTION REQUIRED:\nPlease submit only the required documents for processing:\n• Rating Decision Letters (RDL)\n• Records/Client Services forms (RCS)\n• Other authorized documents\n\nIf you believe this is an error, please contact our support team.\n\nThank you,\nDocument Quality Team 💖`
            },
            'review_unknown': {
                subject: '🔍 Document Review Required - Unknown Document Type',
                message: `Dear Client,\n\nYour document "${filename}" requires manual review as we couldn't automatically determine its type.\n\n🔍 ISSUE: Unknown document type\n📄 DOCUMENT: ${filename}\n❓ STATUS: Requires manual classification\n⏰ TIME: ${new Date().toLocaleString()}\n\nNEXT STEPS:\nOur team will manually review your document within 24-48 hours. You will receive an update once the review is complete.\n\nIf you have questions about the document type or processing requirements, please contact our support team.\n\nThank you for your patience,\nDocument Quality Team 💖`
            },
            'error': {
                subject: '❌ Document Processing Error',
                message: `Dear Client,\n\nWe encountered an issue processing your document "${filename}".\n\n❌ ISSUE: Processing error detected\n📄 DOCUMENT: ${filename}\n⏰ TIME: ${new Date().toLocaleString()}\n\nACTION REQUIRED:\nPlease try the following:\n1. Ensure the document is not corrupted\n2. Verify the file format is supported (PDF, JPG, PNG)\n3. Resubmit the document\n\nIf the issue persists, please contact our support team for assistance.\n\nThank you,\nDocument Quality Team 💖`
            },
            'general': {
                subject: '📄 Document Processing Update',
                message: `Dear Client,\n\nWe wanted to provide you with an update regarding your document processing.\n\n📄 DOCUMENT: ${filename || 'Your submitted document'}\n⏰ TIME: ${new Date().toLocaleString()}\n\nIf you have any questions or concerns, please don't hesitate to contact our support team.\n\nThank you,\nDocument Quality Team 💖`
            }
        };
        
        return templates[type] || templates['general'];
    }
    
    async sendEmail() {
        const recipient = document.getElementById('recipientEmail').value;
        const subject = document.getElementById('emailSubject').value;
        const message = document.getElementById('emailMessage').value;
        
        // Show loading state
        const submitBtn = document.querySelector('#emailForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending... ⏳';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('http://localhost:5000/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient: recipient,
                    subject: subject,
                    message: message
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('success', `✅ Email sent to ${recipient}!`);
                this.closeEmailPanel();
                this.logEmailActivity(recipient, subject);
            } else {
                this.showNotification('error', `❌ Failed to send email: ${result.error || 'Unknown error'}`);
            }
            
        } catch (error) {
            console.error('Email send error:', error);
            this.showNotification('error', '❌ Failed to send email. Make sure the API server is running.');
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    closeEmailPanel() {
        document.getElementById('emailPanel').style.display = 'none';
    }
    
    async testEmailConnection() {
        const emailBtn = document.getElementById('emailBtn');
        const originalText = emailBtn.textContent;
        emailBtn.textContent = '🧪 Testing...';
        emailBtn.disabled = true;
        
        try {
            const response = await fetch('http://localhost:5000/api/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('success', '✅ Email system is working! Check your inbox.');
            } else {
                this.showNotification('error', '❌ Email test failed. Check your Gmail configuration.');
            }
            
        } catch (error) {
            console.error('Email test error:', error);
            this.showNotification('error', '❌ Cannot connect to API server. Make sure it\'s running on port 5000.');
        } finally {
            emailBtn.textContent = originalText;
            emailBtn.disabled = false;
        }
    }
    
    showEmailPanel() {
        document.getElementById('emailPanel').style.display = 'flex';
        // Clear form
        document.getElementById('emailForm').reset();
    }
    
    resolveItem(itemId) {
        this.processingQueue = this.processingQueue.filter(item => item.id !== itemId);
        this.renderProcessingQueue();
        this.updateStats();
        this.showNotification('success', 'Item resolved successfully!');
    }
    
    viewDetails(itemId) {
        const item = this.processingQueue.find(i => i.id === itemId);
        if (item) {
            alert(`Queue Item Details:\n\nFilename: ${item.filename}\nClient: ${item.clientName}\nIssue: ${item.issue}\nAction: ${item.action}\nUploaded: ${item.uploadTime}`);
        }
    }
    
    viewClientDocs(clientEmail) {
        const client = this.clients.find(c => c.email === clientEmail);
        const clientDocs = this.allDocuments.filter(doc => doc.clientEmail === clientEmail);
        
        alert(`${client.name}'s Documents:\n\nTotal: ${clientDocs.length}\nProcessed: ${clientDocs.filter(d => d.status === 'completed').length}\nPending: ${clientDocs.filter(d => d.status !== 'completed').length}`);
    }
    
    downloadDocument(docId) {
        alert('Download functionality coming soon!');
    }
    
    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00b894' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    logEmailActivity(recipient, subject) {
        const activity = {
            timestamp: new Date().toISOString(),
            recipient: recipient,
            subject: subject,
            sender: this.userSession.email
        };
        
        // Store in localStorage for demo
        const activities = JSON.parse(localStorage.getItem('emailActivities') || '[]');
        activities.unshift(activity);
        localStorage.setItem('emailActivities', JSON.stringify(activities.slice(0, 50))); // Keep last 50
    }
    
    getDocumentEmailType(status, docType) {
        if (status === 'completed') {
            if (docType === 'RDL') return 'completed_rdl';
            if (docType === 'RCS') return 'completed_rcs';
            return 'general';
        }
        if (status === 'review') {
            // Check if it's unwanted or unknown based on details
            return 'review_unknown';
        }
        if (status === 'error') return 'error';
        return 'general';
    }
    
    filterDocuments(folder) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.folder === folder);
        });
        
        // Filter and render documents
        let filteredDocs = this.allDocuments;
        
        if (folder === 'rdl') {
            filteredDocs = this.allDocuments.filter(doc => doc.processedName && doc.processedName.includes('RDL'));
        } else if (folder === 'rcs') {
            filteredDocs = this.allDocuments.filter(doc => doc.processedName && doc.processedName.includes('RCS'));
        } else if (folder === 'review') {
            filteredDocs = this.allDocuments.filter(doc => ['review', 'error'].includes(doc.status));
        }
        
        const grid = document.getElementById('documentGrid');
        if (filteredDocs.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No documents found</h3>
                    <p>No documents match the selected filter</p>
                </div>
            `;
        } else {
            grid.innerHTML = filteredDocs.map(doc => this.createDocumentCard(doc)).join('');
        }
    }
}

// Global functions
function logout() {
    localStorage.removeItem('userSession');
    window.location.href = 'index.html';
}

function closeEmailPanel() {
    document.getElementById('emailPanel').style.display = 'none';
}

function showAddClientModal() {
    alert('Add client functionality coming soon!');
}

// Add slide animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});