// Client Portal Logic 💖

class ClientPortal {
  constructor() {
    this.userSession = this.getUserSession();
    this.userDocuments = [];
    this.notifications = [];

    if (!this.userSession || this.userSession.role !== "client") {
      window.location.href = "index.html";
      return;
    }

    this.initializePortal();
    this.loadUserData();
  }

  getUserSession() {
    const session = localStorage.getItem("userSession");
    return session ? JSON.parse(session) : null;
  }

  initializePortal() {
    // Set welcome message
    document.getElementById(
      "welcomeText"
    ).textContent = `Welcome, ${this.userSession.name}!`;

    // Initialize upload functionality
    this.initializeUpload();

    // Load existing documents and notifications
    this.loadDocuments();
    this.loadNotifications();
  }

  initializeUpload() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");

    // Drag and drop events
    dropZone.addEventListener("dragover", this.handleDragOver.bind(this));
    dropZone.addEventListener("dragleave", this.handleDragLeave.bind(this));
    dropZone.addEventListener("drop", this.handleDrop.bind(this));

    // File input change
    fileInput.addEventListener("change", this.handleFileSelect.bind(this));

    // Click to upload
    dropZone.addEventListener("click", () => {
      fileInput.click();
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    document.getElementById("dropZone").classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    document.getElementById("dropZone").classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    document.getElementById("dropZone").classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    this.processFiles(files);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.processFiles(files);
  }

  async processFiles(files) {
    if (files.length === 0) return;

    // Show processing section
    document.getElementById("processingSection").style.display = "block";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.updateProcessingStatus(
        `Processing ${file.name}... (${i + 1}/${files.length})`
      );

      try {
        const result = await this.uploadAndProcessFile(file);
        this.addDocumentToList(result);
        this.addNotification(
          "success",
          "Document Uploaded",
          `${file.name} has been uploaded successfully`
        );
      } catch (error) {
        this.addNotification(
          "error",
          "Upload Failed",
          `Failed to upload ${file.name}: ${error.message}`
        );
      }

      await this.delay(1000);
    }

    // Hide processing section
    document.getElementById("processingSection").style.display = "none";
    this.updateStats();
  }

  async uploadAndProcessFile(file) {
    // Use the better processing logic from script.js
    const text = await this.extractTextFromFile(file);
    
    // Classify document
    const classification = this.classifyDocument(text, file.name);
    
    // Extract client info
    const clientInfo = this.extractClientInfo(text, classification.type);
    
    const documentId = "doc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    
    const document = {
      id: documentId,
      filename: file.name,
      originalName: file.name,
      uploadTime: new Date().toISOString(),
      status: classification.status === 'PROCESSED' ? 'completed' : 
              classification.status === 'PASSWORD_PROTECTED' ? 'review' :
              classification.status === 'UNWANTED' ? 'review' : 'processing',
      size: this.formatFileSize(file.size),
      userEmail: this.userSession.email,
      processedName: this.generateNewFilename(classification.type, clientInfo, file.name),
      details: classification.details,
      clientName: clientInfo.name,
      docType: classification.type
    };

    // If password protected, send notification
    if (classification.status === 'PASSWORD_PROTECTED') {
      this.sendPasswordNotification(document);
    }

    return document;
  }

  generateNewFilename(docType, clientInfo, originalName) {
    const cleanName = clientInfo.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
    return `${cleanName}_${docType}.pdf`;
  }

  async extractTextFromFile(file) {
    if (file.type === 'application/pdf') {
      return await this.simulatePDFExtraction(file);
    } else if (file.type.startsWith('image/')) {
      return await this.simulateOCR(file);
    }
    return '';
  }
  
  async simulatePDFExtraction(file) {
    const filename = file.name.toLowerCase();
    const sampleNames = ['ARIANA ATKINS', 'MICHAEL JOHNSON', 'SARAH WILLIAMS', 'DAVID BROWN', 'LISA GARCIA'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    
    if (filename.includes('rdl') || filename.includes('rating')) {
      return `DEPARTMENT OF VETERANS AFFAIRS\nVeterans Benefits Administration\nRegional Office\n${randomName}\nVA File Number\n${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}\nRating Decision\n${new Date().toLocaleDateString()}`;
    } else if (filename.includes('rcs') || filename.includes('auth')) {
      const rcsNames = ['John A. Smith', 'Mary Johnson', 'Robert Davis', 'Jennifer Wilson', 'William Martinez'];
      const randomRcsName = rcsNames[Math.floor(Math.random() * rcsNames.length)];
      return `TM CLIENT AUTHORIZATION FORM\nDocument ID: TM-RCS-2023-${Math.floor(Math.random() * 9999)}\nClient: ${randomRcsName} (ID: TM-${Math.floor(Math.random() * 9999)}-2023)\nDate Issued: ${new Date().toLocaleDateString()}`;
    } else if (filename.includes('license') || filename.includes('passport')) {
      return `DRIVER'S LICENSE\nState of California\nName: Test User\nLicense Number: D1234567`;
    }
    return 'Sample document text for processing...';
  }
  
  async simulateOCR(file) {
    return 'OCR extracted text from image...';
  }
  
  classifyDocument(text, filename) {
    const textUpper = text.toUpperCase();
    
    if (filename.toLowerCase().includes('protected')) {
      return {
        type: 'REVIEW',
        status: 'PASSWORD_PROTECTED',
        details: 'Document appears to be password protected'
      };
    }
    
    const unwantedPatterns = ['DRIVER\'S LICENSE', 'PASSPORT', 'BIRTH CERTIFICATE'];
    if (unwantedPatterns.some(pattern => textUpper.includes(pattern))) {
      return {
        type: 'REVIEW',
        status: 'UNWANTED',
        details: 'Document marked as unwanted (ID document)'
      };
    }
    
    if (textUpper.includes('DEPARTMENT OF VETERANS AFFAIRS') && textUpper.includes('RATING DECISION')) {
      return {
        type: 'RDL',
        status: 'PROCESSED',
        details: 'Rating Decision Letter identified and processed'
      };
    }
    
    if (textUpper.includes('TM CLIENT AUTHORIZATION') || textUpper.includes('TM-RCS-')) {
      return {
        type: 'RCS',
        status: 'PROCESSED',
        details: 'Records/Client Services document identified and processed'
      };
    }
    
    return {
      type: 'REVIEW',
      status: 'UNKNOWN',
      details: 'Document type could not be determined automatically'
    };
  }
  
  extractClientInfo(text, docType) {
    if (docType === 'RDL') {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('VA File Number')) {
          for (let j = Math.max(0, i-5); j < i; j++) {
            const nameLine = lines[j].trim();
            if (nameLine.length > 3 && 
                nameLine === nameLine.toUpperCase() && 
                !/\d/.test(nameLine) &&
                !['DEPARTMENT OF VETERANS AFFAIRS', 'VETERANS BENEFITS ADMINISTRATION', 'REGIONAL OFFICE'].includes(nameLine)) {
              return { name: nameLine, id: null };
            }
          }
        }
      }
      return { name: 'UNKNOWN_CLIENT', id: null };
    } else if (docType === 'RCS') {
      const nameMatch = text.match(/Client:\s*([A-Za-z\s\.]+)\s*\(/);
      return {
        name: nameMatch ? nameMatch[1].trim() : 'UNKNOWN_CLIENT',
        id: null
      };
    }
    return { name: 'UNKNOWN_CLIENT', id: null };
  }

  sendPasswordNotification(document) {
    // Simulate sending email notification
    console.log(
      `📧 Email sent to ${this.userSession.email} about password-protected document: ${document.filename}`
    );

    this.addNotification(
      "warning",
      "Password-Protected Document",
      `Your document "${document.filename}" is password-protected. Please resubmit without password protection.`
    );
  }

  addDocumentToList(document) {
    this.userDocuments.unshift(document); // Add to beginning
    this.renderDocuments();
  }

  loadUserData() {
    // Load user's existing documents from localStorage
    const savedDocs = localStorage.getItem(
      `documents_${this.userSession.email}`
    );
    if (savedDocs) {
      this.userDocuments = JSON.parse(savedDocs);
    }

    // Load notifications
    const savedNotifications = localStorage.getItem(
      `notifications_${this.userSession.email}`
    );
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications);
    }

    this.renderDocuments();
    this.renderNotifications();
    this.updateStats();
  }

  saveUserData() {
    localStorage.setItem(
      `documents_${this.userSession.email}`,
      JSON.stringify(this.userDocuments)
    );
    localStorage.setItem(
      `notifications_${this.userSession.email}`,
      JSON.stringify(this.notifications)
    );
  }

  loadDocuments() {
    this.renderDocuments();
  }

  renderDocuments() {
    const grid = document.getElementById("documentsGrid");

    if (this.userDocuments.length === 0) {
      grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No documents uploaded yet</h3>
                    <p>Upload your first document to get started!</p>
                </div>
            `;
      return;
    }

    grid.innerHTML = this.userDocuments
      .map((doc) => this.createDocumentCard(doc))
      .join("");
    this.saveUserData();
  }

  createDocumentCard(doc) {
    const statusLabels = {
      processing: "Processing",
      completed: "Completed",
      review: "Needs Review",
      error: "Error",
    };

    return `
            <div class="document-item ${doc.status}">
                <div class="document-header">
                    <div class="document-name">${doc.filename}</div>
                    <div class="document-status status-${doc.status}">
                        ${statusLabels[doc.status]}
                    </div>
                </div>
                <div class="document-details">
                    <strong>Uploaded:</strong> ${new Date(
                      doc.uploadTime
                    ).toLocaleString()}<br>
                    <strong>Size:</strong> ${doc.size}<br>
                    ${
                      doc.processedName
                        ? `<strong>Processed as:</strong> ${doc.processedName}<br>`
                        : ""
                    }
                    <strong>Status:</strong> ${doc.details}
                </div>
                <div class="document-actions">
                    ${
                      doc.status === "completed"
                        ? '<button class="action-btn">Download</button>'
                        : ""
                    }
                    ${
                      doc.status === "review"
                        ? '<button class="action-btn" onclick="clientPortal.resubmitDocument(\'' +
                          doc.id +
                          "')\">Resubmit</button>"
                        : ""
                    }
                    <button class="action-btn" onclick="clientPortal.viewDetails('${
                      doc.id
                    }')">Details</button>
                </div>
            </div>
        `;
  }

  loadNotifications() {
    this.renderNotifications();
  }

  renderNotifications() {
    const list = document.getElementById("notificationsList");

    if (this.notifications.length === 0) {
      list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <h3>No notifications</h3>
                    <p>You'll see updates about your documents here</p>
                </div>
            `;
      return;
    }

    list.innerHTML = this.notifications
      .slice(0, 5)
      .map(
        (notification) => `
            <div class="notification-item ${notification.type}">
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${new Date(
                      notification.time
                    ).toLocaleString()}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
            </div>
        `
      )
      .join("");
  }

  addNotification(type, title, message) {
    const notification = {
      id: Date.now(),
      type: type,
      title: title,
      message: message,
      time: new Date().toISOString(),
    };

    this.notifications.unshift(notification);
    this.renderNotifications();
    this.saveUserData();
  }

  updateStats() {
    const total = this.userDocuments.length;
    const processed = this.userDocuments.filter(
      (doc) => doc.status === "completed"
    ).length;
    const pending = this.userDocuments.filter((doc) =>
      ["processing", "review"].includes(doc.status)
    ).length;

    document.getElementById("totalUploaded").textContent = total;
    document.getElementById("processed").textContent = processed;
    document.getElementById("pending").textContent = pending;
  }

  updateProcessingStatus(status) {
    document.getElementById("processingStatus").textContent = status;
  }

  resubmitDocument(docId) {
    alert(
      "Resubmit functionality coming soon! Please upload a new version without password protection."
    );
  }

  viewDetails(docId) {
    const doc = this.userDocuments.find((d) => d.id === docId);
    if (doc) {
      alert(
        `Document Details:\n\nFilename: ${doc.filename}\nStatus: ${
          doc.details
        }\nUploaded: ${new Date(doc.uploadTime).toLocaleString()}`
      );
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Logout function
function logout() {
  localStorage.removeItem("userSession");
  window.location.href = "index.html";
}

// Initialize client portal
let clientPortal;
document.addEventListener("DOMContentLoaded", () => {
  clientPortal = new ClientPortal();
});
