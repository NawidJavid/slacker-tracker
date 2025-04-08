/**
 * Apple Emoji Replacer
 * Replaces Unicode emoji characters with Apple-style emoji images
 */

class AppleEmojiReplacer {
    constructor() {
        // Base URL for Apple emoji images
        this.baseUrl = 'https://cdn.jsdelivr.net/gh/carpedm20/emoji-data@master/img-apple-64/';
        
        // Common emojis used in the app
        this.emojiMap = {
            '🔥': '1f525.png',  // fire (streak >= 5)
            '😬': '1f62c.png',  // grimacing face (streak >= 2)
            '💀': '1f480.png',  // skull (streak < 2)
            '📊': '1f4ca.png',  // bar chart 
            '📈': '1f4c8.png',  // chart increasing
            '📉': '1f4c9.png',  // chart decreasing
            '🏆': '1f3c6.png',  // trophy
            '✨': '2728.png',   // sparkles
            '👶': '1f476.png',  // baby
            '📱': '1f4f1.png',  // mobile phone
            '🗑️': '1f5d1-fe0f.png', // wastebasket
            '💪': '1f4aa.png',  // flexed biceps
            '🤨': '1f928.png',  // face with raised eyebrow
            '👎': '1f44e.png',  // thumbs down
            '😒': '1f612.png',  // unamused face
            '👀': '1f440.png',  // eyes
            '🤷‍♂️': '1f937-200d-2642-fe0f.png', // man shrugging
            '🫥': '1fae5.png',  // dotted line face
            '💯': '1f4af.png',  // hundred points
            '✅': '2705.png',   // check mark
            '🤔': '1f914.png',  // thinking face
            '😊': '1f60a.png',  // smiling face with smiling eyes
            '👌': '1f44c.png',  // OK hand
            '👍': '1f44d.png',  // thumbs up
            '❌': '274c.png',   // cross mark
            '⚠️': '26a0-fe0f.png', // warning
            '❓': '2753.png',   // question mark
            '⭐': '2b50.png',   // star
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        // Replace emojis in the DOM
        this.replaceEmojis();
        
        // Watch for DOM changes to replace emojis in new elements
        this.observeDOMChanges();
    }
    
    replaceEmojis() {
        // Target elements with emoji classes
        const emojiElements = document.querySelectorAll('.emoji, .habit-status, .habit-stat-status');
        
        emojiElements.forEach(element => {
            const text = element.textContent;
            if (!text) return;
            
            let newContent = text;
            
            // Replace each emoji in the text
            for (const [emoji, filename] of Object.entries(this.emojiMap)) {
                if (text.includes(emoji)) {
                    const imgTag = `<img src="${this.baseUrl}${filename}" alt="${emoji}" class="apple-emoji" style="height: 1.2em; vertical-align: middle; display: inline-block;">`;
                    newContent = newContent.replaceAll(emoji, imgTag);
                }
            }
            
            // Only update if changes were made
            if (newContent !== text) {
                element.innerHTML = newContent;
            }
        });
    }
    
    observeDOMChanges() {
        // Create a MutationObserver to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            let shouldReplace = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    shouldReplace = true;
                    break;
                }
            }
            
            if (shouldReplace) {
                // Delay slightly to ensure all DOM updates are complete
                setTimeout(() => this.replaceEmojis(), 10);
            }
        });
        
        // Start observing the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    // Helper method to manually trigger replacement
    // Can be called after dynamic updates
    refresh() {
        this.replaceEmojis();
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appleEmojiReplacer = new AppleEmojiReplacer();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppleEmojiReplacer;
} 