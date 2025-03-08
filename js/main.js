// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, collection, addDoc, doc, setDoc, updateDoc, increment, serverTimestamp, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM3tC1gt92wEOegEBMzOHytKSbgb3S6MQ",
  authDomain: "ai-image-game-7daaa.firebaseapp.com",
  projectId: "ai-image-game-7daaa",
  storageBucket: "ai-image-game-7daaa.firebasestorage.app",
  messagingSenderId: "546570462966",
  appId: "1:546570462966:web:3059eacbc9b4c1b1f1aed7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

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

// Share prompt to Firestore
const promptDocRef = doc(db, 'gameState', 'currentPrompt');

window.sharePrompt = async function(promptText) {
  await setDoc(promptDocRef, {
    prompt: promptText,
    timestamp: Date.now()
  });
};

// Listen for prompt updates
onSnapshot(promptDocRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.data();
    promptInput.value = data.prompt;
    promptInput.disabled = true;
    sharePromptBtn.disabled = true;
  }
});

// Share prompt event listener
sharePromptBtn.addEventListener('click', () => {
  const currentPrompt = promptInput.value;
  if (currentPrompt) {
    sharePrompt(currentPrompt);
    alert(`Prompt shared: ${currentPrompt}\nEveryone can now generate their images!`);
    promptInput.disabled = true;
    sharePromptBtn.disabled = true;
  }
});

// Upload image to Firebase Storage
async function uploadImage(file) {
  const storageRef = ref(storage, 'images/' + Date.now() + '_' + file.name);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Submit image to Firestore
async function submitImage(file) {
  try {
    const url = await uploadImage(file);
    await addDoc(collection(db, 'images'), {
      url: url,
      votes: 0,
      timestamp: serverTimestamp()
    });
    console.log("Image URL saved to Firestore!");
  } catch (error) {
    console.error("Error submitting image:", error);
  }
}

// Event listener for image submission
submitImageBtn.addEventListener('click', () => {
  const file = imageUpload.files[0];
  if (file) {
    submitImage(file);
    imageUpload.value = '';
  }
});

// Display images from Firestore
const imagesRef = collection(db, 'images');
const imagesQuery = query(imagesRef, orderBy('timestamp'));

onSnapshot(imagesQuery, (snapshot) => {
  imageGallery.innerHTML = '';
  snapshot.forEach((doc) => {
    const imgData = doc.data();
    const imgContainer = document.createElement('div');
    imgContainer.className = 'relative';

    const img = document.createElement('img');
    img.src = imgData.url;
    img.className = 'w-full h-48 object-cover rounded-lg';

    const voteButton = document.createElement('button');
    voteButton.textContent = `Vote (${imgData.votes})`;
    voteButton.className = 'absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm';
    voteButton.onclick = () => vote(doc.id);

    imgContainer.appendChild(img);
    imgContainer.appendChild(voteButton);
    imageGallery.appendChild(imgContainer);
  });
});

// Voting function
window.vote = async function(imageId) {
  const imageRef = doc(db, 'images', imageId);
  await updateDoc(imageRef, {
    votes: increment(1)
  });
};

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