// Game state
let currentPrompt = '';
let images = [];
let votes = new Map();

// DOM Elements
const promptInput = document.getElementById('prompt');
const sharePromptBtn = document.getElementById('sharePrompt');
const imageUpload = document.getElementById('imageUpload');
const submitImageBtn = document.getElementById('submitImage');
const imageGallery = document.getElementById('imageGallery');

// Event Listeners
sharePromptBtn.addEventListener('click', () => {
    currentPrompt = promptInput.value;
    if (currentPrompt) {
        alert(`Prompt shared: ${currentPrompt}\nEveryone can now generate their images!`);
        promptInput.disabled = true;
        sharePromptBtn.disabled = true;
    }
});

submitImageBtn.addEventListener('click', () => {
    const file = imageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                src: e.target.result,
                id: Date.now(), // Simple unique ID
                votes: 0
            };
            images.push(imageData);
            displayImages();
            imageUpload.value = ''; // Reset file input
        };
        reader.readAsDataURL(file);
    }
});

function displayImages() {
    imageGallery.innerHTML = '';
    // Shuffle images for display
    const shuffledImages = [...images].sort(() => Math.random() - 0.5);
    
    shuffledImages.forEach(img => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative';
        
        const image = document.createElement('img');
        image.src = img.src;
        image.className = 'w-full h-48 object-cover rounded-lg';
        
        const voteButton = document.createElement('button');
        voteButton.textContent = `Vote (${img.votes})`;
        voteButton.className = 'absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm';
        voteButton.onclick = () => vote(img.id);
        
        imgContainer.appendChild(image);
        imgContainer.appendChild(voteButton);
        imageGallery.appendChild(imgContainer);
    });
}

function vote(imageId) {
    // Simple voting system - one vote per image ID
    const image = images.find(img => img.id === imageId);
    if (image) {
        image.votes++;
        displayImages();
    }
} 