// Cryptic clues will be loaded from JSON file
let crypticClues = [];
let currentClue = null;
let userStats = {
    solved: 0,
    attempted: 0,
    streak: 0
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCluesFromJSON().then(() => {
        loadDailyClue();
        loadUserStats();
    });
});

// Load clues from JSON file
async function loadCluesFromJSON() {
    try {
        const response = await fetch('clues.json');
        if (!response.ok) {
            throw new Error('Failed to load clues');
        }
        crypticClues = await response.json();
    } catch (error) {
        console.error('Error loading clues:', error);
        // Fallback to a single clue if loading fails
        crypticClues = [{
            clue: "Error loading clues - please refresh (5)",
            answer: "ERROR",
            hint: "Something went wrong loading the clues file",
            difficulty: "Easy"
        }];
    }
}

function loadDailyClue() {
    // Ensure clues are loaded before selecting one
    if (!crypticClues || crypticClues.length === 0) {
        console.error('No clues available');
        return;
    }
    
    // Get today's clue (use date to determine which clue to show)
    const today = new Date();
    const clueIndex = today.getDate() % crypticClues.length;
    currentClue = crypticClues[clueIndex];
    
    document.getElementById('dailyClue').textContent = currentClue.clue;
    document.querySelector('.difficulty').textContent = `Difficulty: ${currentClue.difficulty}`;
    document.querySelector('.length').textContent = `${currentClue.answer.length} letters`;
}

function showAnswerInput() {
    document.getElementById('answerSection').style.display = 'block';
    document.getElementById('answerInput').focus();
    
    // Hide any previous play again button
    document.getElementById('playAgainContainer').style.display = 'none';
    
    // Scroll to answer section
    document.getElementById('answerSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

function checkAnswer() {
    const userAnswer = document.getElementById('answerInput').value.toUpperCase().trim();
    const feedback = document.getElementById('feedback');
    
    if (!userAnswer) {
        feedback.textContent = "Please enter an answer!";
        feedback.className = "feedback";
        return;
    }
    
    userStats.attempted++;
    
    // Case insensitive comparison
    if (userAnswer === currentClue.answer.toUpperCase()) {
        feedback.textContent = "🎉 Correct! Well done!";
        feedback.className = "feedback correct";
        userStats.solved++;
        userStats.streak++;
        
        // Launch confetti animation
        launchConfetti();
        
        // Show play again button
        document.getElementById('playAgainContainer').style.display = 'block';
    } else {
        feedback.textContent = "❌ Not quite right. Try again!";
        feedback.className = "feedback incorrect";
        userStats.streak = 0;
        // Hide play again button on incorrect answers
        document.getElementById('playAgainContainer').style.display = 'none';
    }
    
    saveUserStats();
}

function showHint() {
    const hintElement = document.getElementById('hint');
    hintElement.textContent = currentClue.hint;
    hintElement.style.display = 'block';
}

function showExplanation() {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML += `<br><br><strong>Explanation:</strong> ${currentClue.hint}`;
}

function playAgain() {
    // Select a random clue
    const randomIndex = Math.floor(Math.random() * crypticClues.length);
    currentClue = crypticClues[randomIndex];
    
    // Update the clue display
    document.getElementById('dailyClue').textContent = currentClue.clue;
    document.querySelector('.difficulty').textContent = `Difficulty: ${currentClue.difficulty}`;
    document.querySelector('.length').textContent = `${currentClue.answer.length} letters`;
    
    // Reset the input field
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').maxLength = currentClue.answer.length;
    
    // Hide and reset feedback elements
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('hint').style.display = 'none';
    document.getElementById('playAgainContainer').style.display = 'none';
    
    // Focus on the input field
    document.getElementById('answerInput').focus();
}

function loadUserStats() {
    const saved = localStorage.getItem('crypticStats');
    if (saved) {
        userStats = JSON.parse(saved);
    }
}

function saveUserStats() {
    localStorage.setItem('crypticStats', JSON.stringify(userStats));
}

// Add keyboard support
document.addEventListener('keydown', function(e) {
    const answerInput = document.getElementById('answerInput');
    
    if (e.key === 'Enter' && answerInput === document.activeElement) {
        checkAnswer();
    }
    
    if (e.key === 'Escape') {
        answerInput.blur();
    }
});

// Add input formatting
document.getElementById('answerInput').addEventListener('input', function(e) {
    // Convert to uppercase and remove non-letters
    let value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    // Limit to the answer length
    if (currentClue && value.length > currentClue.answer.length) {
        value = value.substring(0, currentClue.answer.length);
    }
    
    e.target.value = value;
});

// Simulate navigation (for demo purposes)
document.querySelectorAll('a[href^="#"]:not(#privacyLink)').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href').substring(1);
        
        switch(target) {
            case 'guide':
                alert('Guide: Cryptic clues have two parts - a definition and wordplay. Look for anagrams, hidden words, and sound-alikes!');
                break;
            case 'stats':
                alert(`Your Stats:\n• Solved: ${userStats.solved}\n• Attempted: ${userStats.attempted}\n• Current Streak: ${userStats.streak}\n• Success Rate: ${userStats.attempted > 0 ? Math.round((userStats.solved / userStats.attempted) * 100) : 0}%`);
                break;
            case 'account':
                alert('Account management would go here in a full implementation.');
                break;
            default:
                alert(`Navigation to ${target} - this would be implemented in a full version.`);
        }
    });
});

// Add some animations and interactions
function addPageInteractions() {
    // Animate cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Confetti animation function
function launchConfetti() {
    const confettiCount = 200; // UNGODLY AMOUNT!
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff7675', '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8', '#e17055', '#81ecec', '#74b9ff', '#55a3ff', '#fd79a8', '#fdcb6e'];
    
    // Launch multiple waves of confetti for maximum chaos
    for (let wave = 0; wave < 5; wave++) {
        setTimeout(() => {
            for (let i = 0; i < confettiCount; i++) {
                createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }
        }, wave * 200); // Stagger the waves
    }
}

function createConfettiPiece(color) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-100px'; // Start much higher up
    
    // Vary the size for more chaos
    const size = Math.random() * 15 + 5; // 5-20px
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    confetti.style.backgroundColor = color;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    
    // Random shapes for maximum visual chaos
    const shapes = ['50%', '0%', '0% 50% 50% 0%', '50% 0% 50% 50%'];
    confetti.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
    
    // Some pieces get box shadows for extra sparkle
    if (Math.random() > 0.7) {
        confetti.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px ${color}`;
    }
    
    document.body.appendChild(confetti);
    
    // More varied animation for chaos
    const animationDuration = Math.random() * 3000 + 1500; // 1.5-4.5 seconds
    const horizontalMovement = (Math.random() - 0.5) * 200; // More horizontal drift
    const rotationAmount = Math.random() * 1440 + 360; // 1-4 full rotations
    
    confetti.animate([
        {
            transform: `translateY(0px) translateX(0px) rotate(0deg) scale(1)`,
            opacity: 1
        },
        {
            transform: `translateY(${window.innerHeight + 200}px) translateX(${horizontalMovement}px) rotate(${rotationAmount}deg) scale(${Math.random() * 0.5 + 0.5})`,
            opacity: 0
        }
    ], {
        duration: animationDuration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
        if (document.body.contains(confetti)) {
            document.body.removeChild(confetti);
        }
    };
}

// Privacy Policy Popup Functions
function showPrivacyPopup() {
    document.getElementById('privacyPopup').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closePrivacyPopup() {
    document.getElementById('privacyPopup').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close popup when clicking outside of it
document.addEventListener('click', function(e) {
    const popup = document.getElementById('privacyPopup');
    if (e.target === popup) {
        closePrivacyPopup();
    }
});

// Close popup with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const popup = document.getElementById('privacyPopup');
        if (popup.style.display === 'flex') {
            closePrivacyPopup();
        }
    }
});

// Initialize interactions when page loads
setTimeout(addPageInteractions, 100);
