// MyPetID Application JavaScript

// Global state management
let isLoggedIn = false;
let userData = null;
let petData = [];
let locationsData = [];
let currentEditingPet = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
    loadStoredLocationData();
    checkAuthStatus();
});

// Initialize application
function initializeApp() {
    console.log('MyPetID Application initialized');
    
    // Check if we're viewing a pet profile directly
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('pet');
    const nfcTag = urlParams.get('nfc');
    
    if (petId || nfcTag) {
        loadPetProfile(petId || nfcTag);
        return;
    }
    
    // Handle hash-based navigation
    handleNavigation();
    window.addEventListener('hashchange', handleNavigation);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            navigateToPage(target);
        });
    });

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Authentication forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Pet management
    const addPetBtn = document.getElementById('addPetBtn');
    const petEditorForm = document.getElementById('petEditorForm');
    const closePetEditor = document.getElementById('closePetEditor');
    const cancelPetEditor = document.getElementById('cancelPetEditor');
    
    addPetBtn.addEventListener('click', openPetEditor);
    petEditorForm.addEventListener('submit', handlePetSave);
    closePetEditor.addEventListener('click', closePetEditorModal);
    cancelPetEditor.addEventListener('click', closePetEditorModal);

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);

    // Pet profile actions
    const reportFoundBtn = document.getElementById('reportFoundBtn');
    const reportLostBtn = document.getElementById('reportLostBtn');
    const shareProfileBtn = document.getElementById('shareProfileBtn');
    const viewLocationBtn = document.getElementById('viewLocationBtn');
    const contactOwnerBtn = document.getElementById('contactOwnerBtn');
    
    if (reportFoundBtn) {
        reportFoundBtn.addEventListener('click', handleReportFound);
    }
    
    if (reportLostBtn) {
        reportLostBtn.addEventListener('click', handleReportLost);
    }
    
    if (shareProfileBtn) {
        shareProfileBtn.addEventListener('click', handleShareProfile);
    }
    
    if (viewLocationBtn) {
        viewLocationBtn.addEventListener('click', handleViewLocation);
    }
    
    if (contactOwnerBtn) {
        contactOwnerBtn.addEventListener('click', handleContactOwner);
    }

    // Modal close on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closePetEditorModal();
        }
    });
    
    // Email verification event listeners
    const verifyBtn = document.getElementById('verifyBtn');
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    const verificationCodeInput = document.getElementById('verificationCode');
    
    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const code = verificationCodeInput.value.trim();
            if (!code) {
                showToast('Please enter the verification code', 'error');
                return;
            }
            
            if (!userData || !userData.username) {
                showToast('No user data found. Please register again.', 'error');
                return;
            }
            
            const success = await verifyEmailCode(userData.username, code);
            if (success) {
                // Hide verification section
                document.getElementById('verificationSection').style.display = 'none';
                // Show registration form again for next use
                document.getElementById('registerForm').style.display = 'block';
                // Clear the form
                document.getElementById('registerForm').reset();
                verificationCodeInput.value = '';
            }
        });
    }
    
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', async () => {
            await resendVerificationCode();
        });
    }
    
    // Auto-format verification code input
    if (verificationCodeInput) {
        verificationCodeInput.addEventListener('input', (e) => {
            // Remove any non-digit characters
            e.target.value = e.target.value.replace(/\D/g, '');
            
            // Auto-submit when 6 digits are entered
            if (e.target.value.length === 6) {
                verifyBtn.click();
            }
        });
    }
    
    // Verification page event listeners
    const verifyEmailBtn = document.getElementById('verifyEmailBtn');
    const resendEmailBtn = document.getElementById('resendEmailBtn');
    const verifyEmailCodeInput = document.getElementById('verifyEmailCode');
    
    if (verifyEmailBtn) {
        verifyEmailBtn.addEventListener('click', async () => {
            const code = verifyEmailCodeInput.value.trim();
            if (!code) {
                showToast('Please enter the verification code', 'error');
                return;
            }
            
            if (!userData || !userData.username) {
                showToast('No user data found. Please log in again.', 'error');
                return;
            }
            
            const success = await verifyEmailCode(userData.username, code);
            if (success) {
                verifyEmailCodeInput.value = '';
                navigateToPage('#dashboard');
            }
        });
    }
    
    if (resendEmailBtn) {
        resendEmailBtn.addEventListener('click', async () => {
            if (!userData || !userData.username || !userData.email) {
                showToast('No user data found. Please log in again.', 'error');
                return;
            }
            
            await sendVerificationEmail(userData.username, userData.email, userData.name);
        });
    }
    
    // Auto-format verification code input for verification page
    if (verifyEmailCodeInput) {
        verifyEmailCodeInput.addEventListener('input', (e) => {
            // Remove any non-digit characters
            e.target.value = e.target.value.replace(/\D/g, '');
            
            // Auto-submit when 6 digits are entered
            if (e.target.value.length === 6) {
                verifyEmailBtn.click();
            }
        });
    }
    
    // Dashboard verification alert buttons
    const verifyNowBtn = document.getElementById('verifyNowBtn');
    const resendVerificationBtn = document.getElementById('resendVerificationBtn');
    
    if (verifyNowBtn) {
        verifyNowBtn.addEventListener('click', () => {
            navigateToPage('#verify-email');
        });
    }
    
    if (resendVerificationBtn) {
        resendVerificationBtn.addEventListener('click', async () => {
            if (!userData || !userData.username || !userData.email) {
                showToast('No user data found. Please log in again.', 'error');
                return;
            }
            
            await sendVerificationEmail(userData.username, userData.email, userData.name);
        });
    }
}

// Navigation handling
function handleNavigation() {
    const hash = window.location.hash || '#home';
    navigateToPage(hash);
}

function navigateToPage(target) {
    // Remove # from target
    const page = target.replace('#', '');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === target) {
            link.classList.add('active');
        }
    });
    
    // Update URL
    window.location.hash = target;
    
    // Load page-specific data
    if (page === 'dashboard' && isLoggedIn) {
        loadDashboardData();
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    showLoading(true);
    
    try {
        // Simulate authentication via GitHub issue
        const loginData = {
            email: email,
            password: password,
            timestamp: new Date().toISOString()
        };
        
        // Create GitHub issue for login
        await createGitHubIssue('User Login Request', 
            `Email: ${email}\nAction: login\nTimestamp: ${loginData.timestamp}`);
        
        // Simulate successful login
        setTimeout(() => {
            userData = {
                id: generateId(),
                email: email,
                username: email.split('@')[0],
                name: email.split('@')[0],
                patreonVerified: true,
                patreonTier: 'supporter'
            };
            
            isLoggedIn = true;
            saveUserData();
            updateAuthUI();
            showToast('Login successful!', 'success');
            navigateToPage('#dashboard');
            showLoading(false);
        }, 2000);
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    const phone = formData.get('phone');
    const patreonId = formData.get('patreonId');
    
    if (!patreonId) {
        showToast('Patreon ID is required for registration', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Create GitHub issue for registration
        const registrationData = {
            username: username,
            email: email,
            name: name || username,
            phone: phone || '',
            patreonId: patreonId,
            timestamp: new Date().toISOString()
        };
        
        await createGitHubIssue('User Registration Request', 
            `Username: ${username}\nEmail: ${email}\nName: ${name}\nPhone: ${phone}\nPatreonId: ${patreonId}\nAction: register\nTimestamp: ${registrationData.timestamp}`);
        
        // Store user data locally with unverified email status
        userData = {
            id: generateId(),
            username: username,
            email: email,
            name: name || username,
            phone: phone || '',
            patreonId: patreonId,
            patreonVerified: true,
            patreonTier: 'supporter',
            emailVerified: false,
            verificationCode: null,
            verificationCodeIssuedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        saveUserData();
        
        // Hide registration form and show verification section
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('verificationSection').style.display = 'block';
        
        // Send verification email
        await sendVerificationEmail(username, email, name || username);
        
        showLoading(false);
        showToast('Registration successful! Please check your email for verification code.', 'success');
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
        showLoading(false);
    }
}

// Email verification functions
async function sendVerificationEmail(username, email, name) {
    try {
        await createGitHubIssue('Send Verification Email', 
            `Username: ${username}\nEmail: ${email}\nName: ${name}\nAction: send_verification_email`);
        
        showToast('Verification email sent from MyPetID@yahoo.com. Please check your inbox!', 'success');
    } catch (error) {
        console.error('Failed to send verification email:', error);
        showToast('Failed to send verification email. Please try again.', 'error');
    }
}

async function verifyEmailCode(username, code) {
    showLoading(true);
    
    try {
        await createGitHubIssue('Verify Email Token', 
            `Username: ${username}\nCode: ${code}\nAction: verify_email_token`);
        
        // Update local user data
        if (userData && userData.username === username) {
            userData.emailVerified = true;
            userData.emailVerifiedAt = new Date().toISOString();
            userData.verificationCode = null;
            userData.verificationCodeIssuedAt = null;
            saveUserData();
        }
        
        showToast('Email verified successfully!', 'success');
        
        // Login user and redirect to dashboard
        isLoggedIn = true;
        navigateToPage('#dashboard');
        updateAuthUI();
        
        showLoading(false);
        return true;
    } catch (error) {
        console.error('Email verification error:', error);
        showToast('Verification failed. Please check your code and try again.', 'error');
        showLoading(false);
        return false;
    }
}

async function resendVerificationCode() {
    if (!userData || !userData.username || !userData.email) {
        showToast('No user data found. Please register again.', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        await sendVerificationEmail(userData.username, userData.email, userData.name);
        showToast('Verification code resent! Please check your email.', 'success');
        showLoading(false);
    } catch (error) {
        console.error('Failed to resend verification code:', error);
        showToast('Failed to resend verification code. Please try again.', 'error');
        showLoading(false);
    }
}

function handleLogout() {
    isLoggedIn = false;
    userData = null;
    petData = [];
    localStorage.removeItem('mypetid_user');
    localStorage.removeItem('mypetid_pets');
    updateAuthUI();
    showToast('Logged out successfully', 'success');
    navigateToPage('#home');
}

// Pet management functions
function openPetEditor(pet = null) {
    currentEditingPet = pet;
    const modal = document.getElementById('petEditorModal');
    const title = document.getElementById('petEditorTitle');
    const form = document.getElementById('petEditorForm');
    
    if (pet) {
        title.textContent = 'Edit Pet';
        populatePetForm(pet);
    } else {
        title.textContent = 'Add New Pet';
        form.reset();
    }
    
    modal.classList.add('active');
}

function closePetEditorModal() {
    const modal = document.getElementById('petEditorModal');
    modal.classList.remove('active');
    currentEditingPet = null;
}

function populatePetForm(pet) {
    const form = document.getElementById('petEditorForm');
    
    form.name.value = pet.name || '';
    form.nfcTagId.value = pet.nfcTagId || '';
    form.description.value = pet.description || '';
    form.age.value = pet.age || '';
    form.breed.value = pet.breed || '';
    form.weight.value = pet.weight || '';
    form.sex.value = pet.sex || '';
    form.personality.value = pet.personality || '';
    form.medicalInfo.value = pet.medicalInfo || '';
    form.socialLinks.value = pet.socialLinks || '';
    form.donationLink.value = pet.donationLink || '';
    // Note: File inputs can't be pre-populated for security reasons
    // Only show existing photo if available
}

async function handlePetSave(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Handle file uploads
    const photoFile = formData.get('photoFile');
    const medicalFiles = formData.getAll('medicalFile');
    
    let photoUrl = '';
    let medicalFileUrls = [];
    
    // Convert photo file to base64 for storage
    if (photoFile && photoFile.size > 0) {
        try {
            photoUrl = await convertFileToBase64(photoFile);
        } catch (error) {
            console.error('Error converting photo to base64:', error);
            showToast('Failed to process photo. Please try again.', 'error');
            return;
        }
    }
    
    // Convert medical files to base64 for storage
    if (medicalFiles && medicalFiles.length > 0) {
        for (const file of medicalFiles) {
            if (file.size > 0) {
                try {
                    const base64File = await convertFileToBase64(file);
                    medicalFileUrls.push({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64File
                    });
                } catch (error) {
                    console.error('Error converting medical file to base64:', error);
                    showToast(`Failed to process file: ${file.name}`, 'error');
                }
            }
        }
    }
    
    const petInfo = {
        id: currentEditingPet?.id || generateId(),
        name: formData.get('name'),
        nfcTagId: formData.get('nfcTagId') || generateNFCTag(),
        description: formData.get('description'),
        age: formData.get('age'),
        breed: formData.get('breed'),
        weight: formData.get('weight'),
        sex: formData.get('sex'),
        personality: formData.get('personality'),
        medicalInfo: formData.get('medicalInfo'),
        socialLinks: formData.get('socialLinks'),
        donationLink: formData.get('donationLink'),
        photoUrl: photoUrl || currentEditingPet?.photoUrl || '',
        gallery: photoUrl ? [{ data: photoUrl, isMain: true }] : currentEditingPet?.gallery || [],
        medicalFiles: medicalFileUrls,
        isLost: currentEditingPet?.isLost || false,
        lastSeenLocation: currentEditingPet?.lastSeenLocation || null,
        lastSeenTimestamp: currentEditingPet?.lastSeenTimestamp || null,
        ownerId: userData.id,
        ownerName: userData.name,
        ownerEmail: userData.email,
        ownerPhone: userData.phone,
        createdAt: currentEditingPet?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    showLoading(true);
    
    try {
        // Create GitHub issue for pet creation/update
        const action = currentEditingPet ? 'update' : 'create';
        await createGitHubIssue(`Pet ${action.charAt(0).toUpperCase() + action.slice(1)} Request`, 
            `PetId: ${petInfo.id}\nName: ${petInfo.name}\nNFCTag: ${petInfo.nfcTagId}\nOwnerId: ${petInfo.ownerId}\nAction: ${action}\nData: ${JSON.stringify(petInfo)}`);
        
        // Update local data
        if (currentEditingPet) {
            const index = petData.findIndex(p => p.id === currentEditingPet.id);
            if (index !== -1) {
                petData[index] = petInfo;
            }
        } else {
            petData.push(petInfo);
        }
        
        savePetData();
        showToast(`Pet ${action}d successfully!`, 'success');
        closePetEditorModal();
        loadDashboardData();
        showLoading(false);
        
    } catch (error) {
        console.error('Pet save error:', error);
        showToast('Failed to save pet. Please try again.', 'error');
        showLoading(false);
    }
}

async function deletePet(petId) {
    if (!confirm('Are you sure you want to delete this pet?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        // Create GitHub issue for pet deletion
        await createGitHubIssue('Pet Deletion Request', 
            `PetId: ${petId}\nOwnerId: ${userData.id}\nAction: delete`);
        
        // Remove from local data
        petData = petData.filter(pet => pet.id !== petId);
        savePetData();
        
        showToast('Pet deleted successfully', 'success');
        loadDashboardData();
        showLoading(false);
        
    } catch (error) {
        console.error('Pet deletion error:', error);
        showToast('Failed to delete pet. Please try again.', 'error');
        showLoading(false);
    }
}

// Dashboard functions
function loadDashboardData() {
    if (!isLoggedIn || !userData) return;
    
    // Update user name
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = userData.name || userData.username;
    }
    
    // Update stats
    const petCount = document.getElementById('petCount');
    const profileViews = document.getElementById('profileViews');
    
    if (petCount) {
        petCount.textContent = petData.length;
    }
    
    if (profileViews) {
        profileViews.textContent = Math.floor(Math.random() * 100); // Simulated
    }
    
    // Load pets
    loadPetsGrid();
    loadActivityList();
}

function loadPetsGrid() {
    const petsGrid = document.getElementById('petsGrid');
    if (!petsGrid) return;
    
    if (petData.length === 0) {
        petsGrid.innerHTML = '<p class="text-center">No pets added yet. Click "Add New Pet" to get started!</p>';
        return;
    }
    
    petsGrid.innerHTML = petData.map(pet => `
        <div class="pet-card">
            <div class="pet-card-header">
                <h4>${pet.name}</h4>
                <span class="detail-item">${pet.nfcTagId || 'No NFC'}</span>
            </div>
            <p><strong>Breed:</strong> ${pet.breed || 'Unknown'}</p>
            <p><strong>Age:</strong> ${pet.age || 'Unknown'}</p>
            <p class="mb-4">${pet.description || 'No description'}</p>
            <div class="pet-card-actions">
                <button class="btn btn-sm btn-primary" onclick="openPetEditor(${JSON.stringify(pet).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn btn-sm btn-secondary" onclick="viewPetProfile('${pet.id}')">View</button>
                <button class="btn btn-sm btn-secondary" onclick="deletePet('${pet.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function loadActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Simulated activity data
    const activities = [
        {
            icon: '🏷️',
            title: 'Pet profile created',
            description: 'New pet profile has been created successfully',
            time: '2 hours ago'
        },
        {
            icon: '📱',
            title: 'NFC tag scanned',
            description: 'Someone scanned your pet\'s NFC tag',
            time: '1 day ago'
        },
        {
            icon: '👤',
            title: 'Profile updated',
            description: 'Your account information was updated',
            time: '3 days ago'
        }
    ];
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Pet profile functions
function viewPetProfile(petId) {
    const pet = petData.find(p => p.id === petId);
    if (!pet) return;
    
    loadPetProfileData(pet);
    navigateToPage('#pet-profile');
}

async function loadPetProfile(identifier) {
    // This would normally fetch from GitHub data files
    // For demo purposes, we'll show a sample profile
    const samplePet = {
        id: identifier,
        name: 'Buddy',
        description: 'A friendly Golden Retriever who loves to play fetch and swim.',
        age: '3 years',
        breed: 'Golden Retriever',
        weight: '65 lbs',
        sex: 'Male',
        personality: 'Friendly, energetic, loves children and other dogs. Great swimmer!',
        medicalInfo: 'Up to date on all vaccinations. Takes medication for hip dysplasia.',
        photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
        ownerName: 'John Smith',
        ownerEmail: 'john@example.com',
        ownerPhone: '(555) 123-4567'
    };
    
    loadPetProfileData(samplePet);
    navigateToPage('#pet-profile');
}

function loadPetProfileData(pet) {
    document.getElementById('petName').textContent = pet.name;
    document.getElementById('petDescription').textContent = pet.description || 'No description available.';
    document.getElementById('petAge').textContent = pet.age || 'Unknown';
    document.getElementById('petBreed').textContent = pet.breed || 'Unknown';
    document.getElementById('petWeight').textContent = pet.weight || 'Unknown';
    document.getElementById('petSex').textContent = pet.sex || 'Unknown';
    
    // Load pet photo gallery
    const petPhoto = document.getElementById('petPhoto');
    if (pet.gallery && pet.gallery.length > 0) {
        const mainPhoto = pet.gallery.find(img => img.isMain) || pet.gallery[0];
        petPhoto.src = mainPhoto.data;
        petPhoto.style.display = 'block';
        
        // Load photo thumbnails
        const thumbnailsContainer = document.getElementById('photoThumbnails');
        thumbnailsContainer.innerHTML = '';
        
        pet.gallery.forEach((img, index) => {
            const thumb = document.createElement('img');
            thumb.src = img.data;
            thumb.alt = `Pet photo ${index + 1}`;
            thumb.className = 'photo-thumbnail';
            if (img.isMain) thumb.classList.add('active');
            
            thumb.onclick = () => {
                petPhoto.src = img.data;
                document.querySelectorAll('.photo-thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
            
            thumbnailsContainer.appendChild(thumb);
        });
    } else if (pet.photoUrl) {
        petPhoto.src = pet.photoUrl;
        petPhoto.style.display = 'block';
    } else {
        petPhoto.style.display = 'none';
    }
    
    // Load pet status
    const statusBadge = document.getElementById('petStatus');
    if (pet.isLost) {
        statusBadge.textContent = 'Status: Lost';
        statusBadge.className = 'status-badge lost';
    } else {
        statusBadge.textContent = 'Status: Safe';
        statusBadge.className = 'status-badge';
    }
    
    // Load last seen info
    const lastSeen = document.getElementById('lastSeen');
    if (pet.lastSeenTimestamp) {
        lastSeen.textContent = `Last seen: ${new Date(pet.lastSeenTimestamp).toLocaleString()}`;
    } else {
        lastSeen.textContent = 'Last seen: Never';
    }
    
    const personalitySection = document.getElementById('petPersonality');
    personalitySection.innerHTML = pet.personality ? 
        `<p>${pet.personality}</p>` : 
        '<p>No personality information available.</p>';
    
    const medicalSection = document.getElementById('petMedicalInfo');
    let medicalContent = '';
    
    if (pet.medicalInfo) {
        medicalContent += `<p>${pet.medicalInfo}</p>`;
    }
    
    medicalSection.innerHTML = medicalContent || '<p>No medical information available.</p>';
    
    // Load medical documents
    const medicalDocuments = document.getElementById('petMedicalDocuments');
    if (pet.medicalFiles && pet.medicalFiles.length > 0) {
        medicalDocuments.innerHTML = pet.medicalFiles.map(doc => 
            `<a href="${doc.data}" download="${doc.name}" class="medical-document">${doc.name}</a>`
        ).join('');
    } else {
        medicalDocuments.innerHTML = '';
    }
    
    // Load last known location
    const lastLocation = document.getElementById('petLastLocation');
    if (pet.lastSeenLocation) {
        lastLocation.innerHTML = `<p>Last seen at: ${pet.lastSeenLocation}</p>`;
    } else {
        lastLocation.innerHTML = '<p>No location data available.</p>';
    }
    
    // Load owner contact info
    document.getElementById('ownerName').textContent = pet.ownerName || 'Unknown';
    document.getElementById('ownerPhone').textContent = pet.ownerPhone || 'Not provided';
    document.getElementById('ownerEmail').textContent = pet.ownerEmail || 'Not provided';
    
    // Load social links
    const socialLinks = document.getElementById('petSocialLinks');
    if (pet.socialLinks && pet.socialLinks.trim()) {
        const links = pet.socialLinks.split(',').map(link => link.trim()).filter(link => link);
        socialLinks.innerHTML = '<div class="social-links">' + 
            links.map(link => `<a href="${link}" target="_blank" class="social-link">${link}</a>`).join('') +
            '</div>';
    } else {
        socialLinks.innerHTML = '<p>No social links available.</p>';
    }
    
    // Load donation links
    const donations = document.getElementById('petDonations');
    if (pet.donationLink && pet.donationLink.trim()) {
        donations.innerHTML = `<div class="donation-links">
            <a href="${pet.donationLink}" target="_blank" class="donation-link">Support ${pet.name}</a>
        </div>`;
    } else {
        donations.innerHTML = '<p>No donation links available.</p>';
    }
    
    // Load location data for this pet
    loadLocationData(pet.nfcTagId || pet.id);
}

async function handleReportFound() {
    const petName = document.getElementById('petName').textContent;
    
    try {
        await createGitHubIssue('Pet Found Report', 
            `PetName: ${petName}\nFoundAt: ${new Date().toISOString()}\nAction: report_found`);
        
        showToast('Thank you for reporting! The owner has been notified.', 'success');
    } catch (error) {
        console.error('Report found error:', error);
        showToast('Failed to report found pet. Please try again.', 'error');
    }
}

function handleShareProfile() {
    const petName = document.getElementById('petName').textContent;
    const url = `${window.location.origin}${window.location.pathname}?pet=${encodeURIComponent(petName)}`;
    
    if (navigator.share) {
        navigator.share({
            title: `${petName} - MyPetID Profile`,
            text: `Check out ${petName}'s profile on MyPetID`,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Profile link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy link. Please copy manually: ' + url, 'error');
        });
    }
}

// GitHub integration functions
async function createGitHubIssue(title, body) {
    // In a real implementation, this would use GitHub API
    // For demo purposes, we'll just log the issue
    console.log('GitHub Issue Created:', { title, body });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, id: generateId() };
}

// UI helper functions
function updateAuthUI() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userNameDisplay');
    const verificationStatus = document.getElementById('verificationStatus');
    const verifiedIcon = document.getElementById('verifiedIcon');
    const unverifiedIcon = document.getElementById('unverifiedIcon');
    
    if (isLoggedIn && userData) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        dashboardLink.style.display = 'block';
        logoutBtn.style.display = 'block';
        
        // Update user display
        if (userDisplay) {
            userDisplay.textContent = userData.name || userData.username;
        }
        
        // Show verification status
        if (verificationStatus) {
            verificationStatus.style.display = 'inline-block';
            if (userData.emailVerified) {
                verifiedIcon.style.display = 'inline';
                unverifiedIcon.style.display = 'none';
            } else {
                verifiedIcon.style.display = 'none';
                unverifiedIcon.style.display = 'inline';
            }
        }
        
        // Show/hide verification alert
        const verificationAlert = document.getElementById('verificationAlert');
        if (verificationAlert) {
            if (userData.emailVerified) {
                verificationAlert.style.display = 'none';
            } else {
                verificationAlert.style.display = 'block';
            }
        }
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        dashboardLink.style.display = 'none';
        logoutBtn.style.display = 'none';
        
        // Reset user display
        if (userDisplay) {
            userDisplay.textContent = 'User';
        }
        
        // Hide verification status
        if (verificationStatus) {
            verificationStatus.style.display = 'none';
        }
        
        // Hide verification alert
        const verificationAlert = document.getElementById('verificationAlert');
        if (verificationAlert) {
            verificationAlert.style.display = 'none';
        }
    }
}

function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (show) {
        loadingSpinner.classList.add('active');
    } else {
        loadingSpinner.classList.remove('active');
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Data persistence functions
function saveUserData() {
    localStorage.setItem('mypetid_user', JSON.stringify(userData));
}

function loadUserData() {
    const saved = localStorage.getItem('mypetid_user');
    if (saved) {
        userData = JSON.parse(saved);
        isLoggedIn = true;
        updateAuthUI();
        
        // Load pet data
        const savedPets = localStorage.getItem('mypetid_pets');
        if (savedPets) {
            petData = JSON.parse(savedPets);
        }
    }
}

function savePetData() {
    localStorage.setItem('mypetid_pets', JSON.stringify(petData));
}

function checkAuthStatus() {
    // This would check authentication status with GitHub
    // For demo purposes, we'll just update the UI
    updateAuthUI();
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Helper function to convert file to base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function generateNFCTag() {
    return 'NFC-' + Date.now().toString(36).toUpperCase();
}

// Location tracking functions
async function loadLocationData(nfcTagId) {
    try {
        const response = await fetch(`/data/locations.json?t=${Date.now()}`);
        if (response.ok) {
            locationsData = await response.json();
            
            // Filter locations for this pet (last 2 hours)
            const recentLocations = locationsData.filter(loc => {
                const locTime = new Date(loc.timestamp);
                const now = new Date();
                const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
                return loc.nfcTagId === nfcTagId && 
                       loc.active && 
                       locTime >= twoHoursAgo && 
                       loc.latitude && 
                       loc.longitude && 
                       !isNaN(loc.latitude) && 
                       !isNaN(loc.longitude);
            });
            
            displayLocationMap(recentLocations);
        }
    } catch (error) {
        console.error('Error loading location data:', error);
    }
}

function displayLocationMap(locations) {
    // Add location section to pet profile if not exists
    const petSections = document.querySelector('.pet-sections');
    if (!petSections) return;
    
    let locationSection = document.getElementById('petLocationSection');
    if (!locationSection) {
        locationSection = document.createElement('div');
        locationSection.id = 'petLocationSection';
        locationSection.className = 'pet-section';
        petSections.appendChild(locationSection);
    }
    
    if (locations.length > 0) {
        const mostRecent = locations[0];
        const mapUrl = `https://maps.google.com/maps?q=${mostRecent.latitude},${mostRecent.longitude}&z=15&output=embed`;
        
        locationSection.innerHTML = `
            <h3>📍 Recent Location</h3>
            <div class="section-content">
                <p><strong>Last seen:</strong> ${new Date(mostRecent.timestamp).toLocaleString()}</p>
                <p><strong>Device:</strong> ${mostRecent.deviceName || 'Unknown'}</p>
                <iframe src="${mapUrl}" width="100%" height="300" frameborder="0" style="border:0;" allowfullscreen="" aria-hidden="false" tabindex="0"></iframe>
            </div>
        `;
    } else {
        locationSection.innerHTML = `
            <h3>📍 Location</h3>
            <div class="section-content">
                <p>No recent location data available.</p>
                <p><em>Location is automatically updated when the NFC tag is scanned with Tasker.</em></p>
            </div>
        `;
    }
}

// Tasker integration - Handle location updates via GitHub Issues
async function handleLocationUpdate(nfcTagId, latitude, longitude, deviceName) {
    const locationData = {
        _id: generateId(),
        nfcTagId: nfcTagId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        deviceName: deviceName || 'Unknown Device',
        timestamp: new Date().toISOString(),
        active: true
    };
    
    try {
        // Create GitHub issue for location update
        await createGitHubIssue('Location Update', 
            `NFC Tag: ${nfcTagId}\nLatitude: ${latitude}\nLongitude: ${longitude}\nDevice: ${deviceName}\nTimestamp: ${locationData.timestamp}\nAction: update_location`);
        
        // Update local data
        locationsData.push(locationData);
        
        // Save to local storage
        localStorage.setItem('locationsData', JSON.stringify(locationsData));
        
        showToast('Location updated successfully!', 'success');
        
        // Refresh location display if we're viewing this pet
        const currentPetName = document.getElementById('petName')?.textContent;
        if (currentPetName) {
            loadLocationData(nfcTagId);
        }
        
    } catch (error) {
        console.error('Location update error:', error);
        showToast('Failed to update location.', 'error');
    }
}

// Initialize location data on app load
function loadStoredLocationData() {
    const stored = localStorage.getItem('locationsData');
    if (stored) {
        try {
            locationsData = JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing stored location data:', error);
            locationsData = [];
        }
    }
}

// Enhanced pet profile actions
async function handleReportLost() {
    const petName = document.getElementById('petName').textContent;
    const petId = window.location.hash.split('#pet-profile/')[1];
    
    if (!petId) {
        showToast('Pet ID not found', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        await createGitHubIssue('Pet Lost Report', 
            `Pet Lost: ${petName}\nPet ID: ${petId}\nReported by: ${userData?.name || 'Anonymous'}\nLocation: ${navigator.geolocation ? 'Location being determined...' : 'Location not available'}\nTimestamp: ${new Date().toISOString()}`);
        
        // Update pet status locally
        const pet = petData.find(p => p.id === petId);
        if (pet) {
            pet.isLost = true;
            pet.lastSeenTimestamp = new Date().toISOString();
            savePetData();
            
            // Update UI
            const statusBadge = document.getElementById('petStatus');
            statusBadge.textContent = 'Status: Lost';
            statusBadge.className = 'status-badge lost';
            
            const lastSeen = document.getElementById('lastSeen');
            lastSeen.textContent = `Last seen: ${new Date().toLocaleString()}`;
        }
        
        showToast('Lost report submitted successfully!', 'success');
        showLoading(false);
        
    } catch (error) {
        console.error('Report lost error:', error);
        showToast('Failed to submit lost report. Please try again.', 'error');
        showLoading(false);
    }
}

function handleViewLocation() {
    const petId = window.location.hash.split('#pet-profile/')[1];
    if (!petId) {
        showToast('Pet ID not found', 'error');
        return;
    }
    
    // Scroll to location section
    const locationSection = document.getElementById('locationMap');
    if (locationSection) {
        locationSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleContactOwner() {
    const ownerEmail = document.getElementById('ownerEmail').textContent;
    const ownerPhone = document.getElementById('ownerPhone').textContent;
    const petName = document.getElementById('petName').textContent;
    
    const options = [];
    
    if (ownerEmail && ownerEmail !== 'Not provided') {
        options.push(`Email: ${ownerEmail}`);
    }
    
    if (ownerPhone && ownerPhone !== 'Not provided') {
        options.push(`Phone: ${ownerPhone}`);
    }
    
    if (options.length > 0) {
        const contactInfo = options.join('\n');
        alert(`Contact information for ${petName}:\n\n${contactInfo}`);
    } else {
        alert(`Contact information for ${petName} is not available. Please use the MyPetID system to reach the owner.`);
    }
}

// Export functions for global access
window.openPetEditor = openPetEditor;
window.viewPetProfile = viewPetProfile;
window.deletePet = deletePet;
window.handleReportLost = handleReportLost;
window.handleViewLocation = handleViewLocation;
window.handleContactOwner = handleContactOwner;