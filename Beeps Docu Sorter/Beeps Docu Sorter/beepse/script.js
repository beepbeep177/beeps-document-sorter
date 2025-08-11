// Document Processor Frontend Logic 💖

class DocumentProcessor {
    constructor() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.processingSection = document.getElementById('processingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.documentBrowser = document.getElementById('documentBrowser');
        this.documentGrid = document.getElementById('documentGrid');
        this.viewDocsBtn = document.getElementById('viewDocsBtn');
        
        this.stats = {
            total: 0,
            rdl: 0,
            rcs: 0,
            review: 0
        };
        
        this.processedDocuments = [];
        this.currentFilter = 'all';
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Drag and drop events
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        
        // File input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Click to upload
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // View documents button
        this.viewDocsBtn.addEventListener('click', this.toggleDocumentBrowser.bind(this));
        
        // Folder tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchFolder(e.target.dataset.folder);
            });
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.dropZone.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.dropZone.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.dropZone.classList.remove('dragover');
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
        this.processingSection.style.display = 'block';
        this.resultsSection.style.display = 'none';
        
        // Clear previous results
        this.resultsGrid.innerHTML = '';
        this.resetStats();
        
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            this.updateProcessingStatus(`Processing ${file.name}... (${i + 1}/${files.length})`);
            
            try {
                const result = await this.processFile(file);
                results.push(result);
                this.processedDocuments.push(result);
                this.updateStats(result.type);
            } catch (error) {
                const errorResult = {
                    filename: file.name,
                    type: 'ERROR',
                    status: 'Processing failed',
                    details: error.message,
                    timestamp: new Date().toLocaleString()
                };
                results.push(errorResult);
                this.processedDocuments.push(errorResult);
                this.updateStats('ERROR');
            }
            
            // Add small delay for better UX
            await this.delay(500);
        }
        
        // Hide processing, show results
        this.processingSection.style.display = 'none';
        this.displayResults(results);
        this.updateStatsDisplay();
    }
    
    async processFile(file) {
        // Simulate document processing (replace with actual backend call)
        const text = await this.extractTextFromFile(file);
        
        // Classify document
        const classification = this.classifyDocument(text, file.name);
        
        // Extract client info
        const clientInfo = this.extractClientInfo(text, classification.type);
        
        return {
            filename: file.name,
            type: classification.type,
            status: classification.status,
            clientName: clientInfo.name,
            clientId: clientInfo.id,
            newFilename: this.generateNewFilename(classification.type, clientInfo, file.name),
            details: classification.details,
            timestamp: new Date().toLocaleString(),
            size: this.formatFileSize(file.size)
        };
    }
    
    async extractTextFromFile(file) {
        // For demo purposes, we'll simulate text extraction
        // In real implementation, this would use OCR or PDF parsing
        
        if (file.type === 'application/pdf') {
            // Simulate PDF text extraction
            return await this.simulatePDFExtraction(file);
        } else if (file.type.startsWith('image/')) {
            // Simulate OCR
            return await this.simulateOCR(file);
        }
        
        return '';
    }
    
    async simulatePDFExtraction(file) {
        // Simulate different document types with varied names
        const filename = file.name.toLowerCase();
        const sampleNames = ['ARIANA ATKINS', 'MICHAEL JOHNSON', 'SARAH WILLIAMS', 'DAVID BROWN', 'LISA GARCIA'];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        
        if (filename.includes('rdl') || filename.includes('rating')) {
            return `DEPARTMENT OF VETERANS AFFAIRS
Veterans Benefits Administration
Regional Office
${randomName}
VA File Number
${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}
Rating Decision
${new Date().toLocaleDateString()}`;
        } else if (filename.includes('rcs') || filename.includes('auth')) {
            const rcsNames = ['John A. Smith', 'Mary Johnson', 'Robert Davis', 'Jennifer Wilson', 'William Martinez'];
            const randomRcsName = rcsNames[Math.floor(Math.random() * rcsNames.length)];
            return `TM CLIENT AUTHORIZATION FORM
Document ID: TM-RCS-2023-${Math.floor(Math.random() * 9999)}
Client: ${randomRcsName} (ID: TM-${Math.floor(Math.random() * 9999)}-2023)
Date Issued: ${new Date().toLocaleDateString()}`;
        } else if (filename.includes('license') || filename.includes('passport')) {
            return `DRIVER'S LICENSE
State of California
Name: Test User
License Number: D1234567`;
        }
        
        return 'Sample document text for processing...';
    }
    
    async simulateOCR(file) {
        // Simulate OCR processing
        return 'OCR extracted text from image...';
    }
    
    classifyDocument(text, filename) {
        const textUpper = text.toUpperCase();
        
        // Check for password protection (simulate)
        if (filename.toLowerCase().includes('protected')) {
            return {
                type: 'REVIEW',
                status: 'PASSWORD_PROTECTED',
                details: 'Document appears to be password protected'
            };
        }
        
        // Check for unwanted documents
        const unwantedPatterns = ['DRIVER\'S LICENSE', 'PASSPORT', 'BIRTH CERTIFICATE'];
        if (unwantedPatterns.some(pattern => textUpper.includes(pattern))) {
            return {
                type: 'REVIEW',
                status: 'UNWANTED',
                details: 'Document marked as unwanted (ID document)'
            };
        }
        
        // RDL Detection
        if (textUpper.includes('DEPARTMENT OF VETERANS AFFAIRS') && 
            textUpper.includes('RATING DECISION')) {
            return {
                type: 'RDL',
                status: 'PROCESSED',
                details: 'Rating Decision Letter identified and processed'
            };
        }
        
        // RCS Detection
        if (textUpper.includes('TM CLIENT AUTHORIZATION') || 
            textUpper.includes('TM-RCS-')) {
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
            // Look for name before VA File Number
            const lines = text.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('VA File Number')) {
                    // Check previous lines for the name
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
            // Extract TM client info
            const nameMatch = text.match(/Client:\s*([A-Za-z\s\.]+)\s*\(/);
            
            return {
                name: nameMatch ? nameMatch[1].trim() : 'UNKNOWN_CLIENT',
                id: null
            };
        }
        
        return { name: 'UNKNOWN_CLIENT', id: null };
    }
    
    generateNewFilename(docType, clientInfo, originalName) {
        const cleanName = clientInfo.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        
        return `${cleanName}_${docType}.pdf`;
    }
    
    displayResults(results) {
        this.resultsSection.style.display = 'block';
        
        results.forEach(result => {
            const card = this.createResultCard(result);
            this.resultsGrid.appendChild(card);
        });
    }
    
    createResultCard(result) {
        const card = document.createElement('div');
        card.className = `result-card ${result.type.toLowerCase()}`;
        
        const typeLabels = {
            'RDL': 'Rating Decision Letter',
            'RCS': 'Records/Client Services',
            'REVIEW': 'Needs Review',
            'ERROR': 'Processing Error'
        };
        
        card.innerHTML = `
            <div class="result-header">
                <div class="result-title">${result.filename}</div>
                <div class="result-badge badge-${result.type.toLowerCase()}">
                    ${typeLabels[result.type] || result.type}
                </div>
            </div>
            <div class="result-details">
                <strong>Status:</strong> ${result.status}<br>
                ${result.clientName ? `<strong>Client:</strong> ${result.clientName}<br>` : ''}
                ${result.clientId ? `<strong>ID:</strong> ${result.clientId}<br>` : ''}
                ${result.newFilename ? `<strong>New Name:</strong> ${result.newFilename}<br>` : ''}
                <strong>Details:</strong> ${result.details}
            </div>
        `;
        
        return card;
    }
    
    updateProcessingStatus(status) {
        document.getElementById('processingStatus').textContent = status;
    }
    
    resetStats() {
        this.stats = { total: 0, rdl: 0, rcs: 0, review: 0 };
    }
    
    updateStats(type) {
        this.stats.total++;
        if (type === 'RDL') this.stats.rdl++;
        else if (type === 'RCS') this.stats.rcs++;
        else this.stats.review++;
    }
    
    updateStatsDisplay() {
        document.getElementById('totalProcessed').textContent = this.stats.total;
        document.getElementById('rdlCount').textContent = this.stats.rdl;
        document.getElementById('rcsCount').textContent = this.stats.rcs;
        document.getElementById('reviewCount').textContent = this.stats.review;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    toggleDocumentBrowser() {
        const isVisible = this.documentBrowser.style.display !== 'none';
        this.documentBrowser.style.display = isVisible ? 'none' : 'block';
        this.viewDocsBtn.textContent = isVisible ? 'View All Documents 👀' : 'Hide Documents 🙈';
        
        if (!isVisible) {
            this.renderDocuments();
        }
    }
    
    switchFolder(folder) {
        this.currentFilter = folder;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.folder === folder);
        });
        
        this.renderDocuments();
    }
    
    renderDocuments() {
        const filteredDocs = this.filterDocuments(this.processedDocuments, this.currentFilter);
        
        if (filteredDocs.length === 0) {
            this.documentGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>No documents found</h3>
                    <p>Process some documents to see them here!</p>
                </div>
            `;
            return;
        }
        
        this.documentGrid.innerHTML = filteredDocs.map(doc => this.createDocumentCard(doc)).join('');
    }
    
    filterDocuments(documents, filter) {
        if (filter === 'all') return documents;
        if (filter === 'rdl') return documents.filter(doc => doc.type === 'RDL');
        if (filter === 'rcs') return documents.filter(doc => doc.type === 'RCS');
        if (filter === 'review') return documents.filter(doc => doc.type === 'REVIEW' || doc.type === 'ERROR');
        return documents;
    }
    
    createDocumentCard(doc) {
        const icons = {
            'RDL': '📋',
            'RCS': '📝',
            'REVIEW': '⚠️',
            'ERROR': '❌'
        };
        
        return `
            <div class="document-card ${doc.type.toLowerCase()}">
                <div class="doc-icon">${icons[doc.type] || '📄'}</div>
                <div class="doc-name">${doc.newFilename || doc.filename}</div>
                <div class="doc-details">
                    <strong>Original:</strong> ${doc.filename}<br>
                    ${doc.clientName ? `<strong>Client:</strong> ${doc.clientName}<br>` : ''}
                    ${doc.clientId ? `<strong>ID:</strong> ${doc.clientId}<br>` : ''}
                    <strong>Size:</strong> ${doc.size || 'Unknown'}<br>
                    <strong>Processed:</strong> ${doc.timestamp}<br>
                    <strong>Status:</strong> ${doc.status}
                </div>
                <div class="doc-actions">
                    <button class="action-btn" onclick="alert('Download feature coming soon! 💖')">Download</button>
                    <button class="action-btn" onclick="alert('Preview feature coming soon! 👀')">Preview</button>
                </div>
            </div>
        `;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new DocumentProcessor();
    
    // Add some sparkle effects ✨
    setInterval(() => {
        createSparkle();
    }, 2000);
});

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    sparkle.style.fontSize = '20px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '1000';
    sparkle.style.animation = 'sparkleFloat 3s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 3000);
}

// Add sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5);
        }
    }
`;
document.head.appendChild(style);