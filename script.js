// Cryptic clues will be loaded from JSON file
let crypticClues = [];
let currentClue = null;
let currentClueIndex = 0;
let userStats = {
    solved: 0,
    attempted: 0,
    streak: 0
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCluesFromJSON().then(() => {
        loadCurrentClue();
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
            difficulty: "Easy",
            author: "System"
        }];
    }
}

function loadCurrentClue() {
    // Ensure clues are loaded before selecting one
    if (!crypticClues || crypticClues.length === 0) {
        console.error('No clues available');
        return;
    }
    
    // Check if we've completed all clues
    if (currentClueIndex >= crypticClues.length) {
        showCompletionMessage();
        return;
    }
    
    // Load the current sequential clue
    currentClue = crypticClues[currentClueIndex];
    
    // Update section title with progress
    document.getElementById('sectionTitle').textContent = `Clue ${currentClueIndex + 1} of ${crypticClues.length}`;
    
    document.getElementById('dailyClue').textContent = currentClue.clue;
    document.querySelector('.difficulty').textContent = `Difficulty: ${currentClue.difficulty}`;
    document.querySelector('.length').textContent = `${currentClue.answer.length} letters`;
    document.getElementById('clueAuthor').textContent = currentClue.author || 'Anonymous';
    
    // Update input max length dynamically
    const answerInputElement = document.getElementById('answerInput');
    if (answerInputElement) {
        answerInputElement.maxLength = currentClue.answer.length;
    }
    
    // Reset inline answer input state
    const playBtn = document.querySelector('.play-btn');
    const answerContainer = document.getElementById('answerInputContainer');
    const answerInput = document.getElementById('answerInput');
    
    if (playBtn) playBtn.style.display = 'block';
    if (answerContainer) {
        answerContainer.style.display = 'none';
        answerContainer.classList.remove('show');
    }
    if (answerInput) answerInput.value = '';
}

function showAnswerInput() {
    // Hide the play button and show the answer input container
    const playBtn = document.querySelector('.play-btn');
    const answerContainer = document.getElementById('answerInputContainer');
    const answerInput = document.getElementById('answerInput');
    
    if (playBtn) playBtn.style.display = 'none';
    if (answerContainer) {
        answerContainer.style.display = 'block';
        answerContainer.classList.add('show');
    }
    
    // Focus on the input
    if (answerInput) answerInput.focus();
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
        userStats.solved++;
        userStats.streak++;
        
        // Launch confetti animation
        launchConfetti();
        
        // Show success modal
        showSuccessModal();
        
        // Clear feedback
        feedback.textContent = "";
        feedback.className = "feedback";
    } else {
        feedback.textContent = "❌ Not quite right. Try again!";
        feedback.className = "feedback incorrect";
        userStats.streak = 0;
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

function showSuccessModal() {
    document.getElementById('successAnswer').textContent = currentClue.answer.toUpperCase();
    document.getElementById('successModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function nextClue() {
    closeSuccessModal();
    currentClueIndex++;
    
    // Reset the form (only if elements exist)
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const hint = document.getElementById('hint');
    
    if (answerInput) answerInput.value = '';
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }
    if (hint) hint.style.display = 'none';
    
    // Load next clue (this will reset the inline input state)
    loadCurrentClue();
    
    // Update input max length (only if elements exist)
    if (currentClue && answerInput) {
        answerInput.maxLength = currentClue.answer.length;
    }
}

function showCompletionMessage() {
    document.getElementById('sectionTitle').textContent = '🎉 All Clues Completed!';
    document.querySelector('.clue-card').innerHTML = `
        <div class="completion-message">
            <h3>Congratulations! 🎊</h3>
            <p>You've successfully solved all ${crypticClues.length} cryptic clues!</p>
            <div class="final-stats">
                <p><strong>Clues Solved:</strong> ${userStats.solved}/${crypticClues.length}</p>
                <p><strong>Total Attempts:</strong> ${userStats.attempted}</p>
                <p><strong>Success Rate:</strong> ${userStats.attempted > 0 ? Math.round((userStats.solved / userStats.attempted) * 100) : 0}%</p>
            </div>
            <div class="completion-buttons">
                <button class="prize-btn" onclick="claimPrize()">🎁 Claim Prize!</button>
                <button class="restart-btn" onclick="restartGame()">Play Again</button>
            </div>
        </div>
    `;
}

function restartGame() {
    currentClueIndex = 0;
    userStats.solved = 0;
    userStats.attempted = 0;
    userStats.streak = 0;
    saveUserStats();
    
    // Reset UI
    document.getElementById('answerInput').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('hint').style.display = 'none';
    
    loadCurrentClue();
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
    confetti.style.zIndex = '10002'; // Higher than success modal (10001)
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

// Prize Animation Functions
function claimPrize() {
    const prizeOverlay = document.getElementById('prizeOverlay');
    prizeOverlay.style.display = 'flex';
    
    // Check if we're in a modal or completion screen and dim accordingly
    const modal = document.querySelector('.success-modal-content');
    const clueCard = document.querySelector('.clue-card');
    
    if (modal && modal.style.opacity !== '0.3') {
        modal.style.opacity = '0.3';
    } else if (clueCard) {
        clueCard.style.opacity = '0.3';
    }
}

function openPresent() {
    const present = document.querySelector('.present');
    const prizeText = document.querySelector('.prize-text');
    const overlay = document.getElementById('prizeOverlay');
    
    // Add screen shake effect
    document.body.style.animation = 'screenShake 0.8s ease-out';
    
    // Add exploding animation to present
    present.classList.add('exploding');
    
    // Create additional explosion particles
    createExplosionParticles(overlay);
    
    // Show the prize text after explosion
    setTimeout(() => {
        present.style.display = 'none';
        prizeText.style.display = 'block';
        
        // Add screen flash effect
        createScreenFlash();
        
        // Auto-close after showing the prize
        setTimeout(() => {
            closePrizeOverlay();
        }, 4000);
    }, 800);
}

function createExplosionParticles(container) {
    // Create multiple particle bursts
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = `hsl(${Math.random() * 60 + 40}, 100%, 60%)`;
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.zIndex = '10003';
            particle.style.boxShadow = `0 0 10px ${particle.style.background}`;
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 150 + Math.random() * 100;
            const duration = 800 + Math.random() * 400;
            
            particle.style.animation = `particleBurst ${duration}ms ease-out forwards`;
            particle.style.setProperty('--angle', angle);
            particle.style.setProperty('--velocity', velocity + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration);
        }, i * 20);
    }
}

function createScreenFlash() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(255, 255, 255, 0.9)';
    flash.style.zIndex = '10004';
    flash.style.pointerEvents = 'none';
    flash.style.animation = 'screenFlash 0.3s ease-out';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 300);
}

function closePrizeOverlay() {
    const prizeOverlay = document.getElementById('prizeOverlay');
    const present = document.querySelector('.present');
    const prizeText = document.querySelector('.prize-text');
    
    // Reset everything
    prizeOverlay.style.display = 'none';
    present.style.display = 'block';
    present.classList.remove('exploding');
    prizeText.style.display = 'none';
    
    // Remove screen shake
    document.body.style.animation = '';
    
    // Clean up any remaining particles
    const particles = document.querySelectorAll('[style*="particleBurst"]');
    particles.forEach(particle => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    });
    
    // Restore content opacity
    const modal = document.querySelector('.success-modal-content');
    const clueCard = document.querySelector('.clue-card');
    
    if (modal) {
        modal.style.opacity = '1';
    }
    if (clueCard) {
        clueCard.style.opacity = '1';
    }
}
