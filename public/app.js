// API base URL
const API_URL = window.location.origin;

let allProfiles = [];

// Fetch and display profiles
async function loadProfiles() {
    try {
        const response = await fetch(`${API_URL}/api/profiles`);
        allProfiles = await response.json();
        displayProfiles(allProfiles);
    } catch (error) {
        console.error('Error loading profiles:', error);
        document.getElementById('profilesContainer').innerHTML = 
            '<p class="no-profiles">Error loading profiles. Please try again.</p>';
    }
}

// Display profiles
function displayProfiles(profiles) {
    const container = document.getElementById('profilesContainer');
    
    if (profiles.length === 0) {
        container.innerHTML = '<p class="no-profiles">No profiles found.</p>';
        return;
    }

    container.innerHTML = profiles.map(profile => `
        <div class="profile-card">
            <h3>${profile.name}, ${profile.age}</h3>
            <p class="profile-info"><strong>Gender:</strong> ${profile.gender}</p>
            <p class="profile-info"><strong>Occupation:</strong> ${profile.occupation}</p>
            <p class="profile-info"><strong>Location:</strong> ${profile.location}</p>
            <p class="profile-info"><strong>Education:</strong> ${profile.education}</p>
            <p class="profile-bio">"${profile.bio}"</p>
        </div>
    `).join('');
}

// Filter profiles
function filterProfiles() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const genderFilter = document.getElementById('genderFilter').value;

    const filtered = allProfiles.filter(profile => {
        const matchesSearch = profile.name.toLowerCase().includes(searchTerm) || 
                            profile.location.toLowerCase().includes(searchTerm);
        const matchesGender = !genderFilter || profile.gender === genderFilter;
        return matchesSearch && matchesGender;
    });

    displayProfiles(filtered);
}

// Handle profile form submission
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    const profileData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        occupation: document.getElementById('occupation').value,
        location: document.getElementById('location').value,
        education: document.getElementById('education').value,
        bio: document.getElementById('bio').value
    };

    try {
        const response = await fetch(`${API_URL}/api/profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            alert('Profile created successfully!');
            document.getElementById('profileForm').reset();
            loadProfiles(); // Reload profiles to show the new one
        } else {
            alert('Error creating profile. Please try again.');
        }
    } catch (error) {
        console.error('Error creating profile:', error);
        alert('Error creating profile. Please try again.');
    }
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterProfiles);
document.getElementById('genderFilter').addEventListener('change', filterProfiles);
document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);

// Load profiles on page load
loadProfiles();
