// SlackerTracker v2 - Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Main UI
    const habitsList = document.getElementById('habits-list');
    const newHabitInput = document.getElementById('new-habit-name');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const feedbackBanner = document.getElementById('feedback-banner');
    
    // DOM Elements - Navigation & Views
    const viewButtons = document.querySelectorAll('.view-btn');
    const listView = document.getElementById('list-view');
    const calendarView = document.getElementById('calendar-view');
    const statsView = document.getElementById('stats-view');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const calendarHabitsList = document.getElementById('calendar-habits-list');
    
    // DOM Elements - Settings & Modal
    const settingsBtn = document.getElementById('settings-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const resetBtn = document.getElementById('reset-btn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmBtn = document.getElementById('modal-confirm');
    const modalCancelBtn = document.getElementById('modal-cancel');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // DOM Elements - Stats
    const totalCompletedElement = document.querySelector('#total-completed .stat-value');
    const completionRateElement = document.querySelector('#overall-completion-rate .stat-value');
    const longestStreakElement = document.querySelector('#longest-streak .stat-value');
    const currentStreakElement = document.querySelector('#current-streak .stat-value');
    const statsHabitsList = document.getElementById('stats-habits-list');

    // App State
    let habits = [];
    let currentViewingMonth = new Date();
    let modalAction = null; // To track the current modal action
    
    // Initialize app
    init();
    
    // Event Listeners - Core Functionality
    addHabitBtn.addEventListener('click', addHabit);
    newHabitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });
    
    // Event Listeners - Navigation
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewId = btn.id.replace('-btn', '');
            switchView(viewId);
        });
    });
    
    prevMonthBtn.addEventListener('click', () => {
        currentViewingMonth.setMonth(currentViewingMonth.getMonth() - 1);
        renderCalendarView();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentViewingMonth.setMonth(currentViewingMonth.getMonth() + 1);
        renderCalendarView();
    });
    
    // Event Listeners - Settings
    themeToggle.addEventListener('change', toggleTheme);
    exportBtn.addEventListener('click', exportData);
    importFile.addEventListener('change', importData);
    resetBtn.addEventListener('click', () => {
        showModal('Reset All Data', 'This will wipe your shame trail. Sure?', 'resetAllData');
    });
    
    // Event Listeners - Modal
    modalConfirmBtn.addEventListener('click', handleModalConfirm);
    modalCancelBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    /**
     * Initialize the app
     */
    function init() {
        loadHabits();
        renderHabits();
        updateFeedbackBanner();
        loadThemePreference();
        
        // Set current month display
        renderCalendarView();
        
        // Initialize stats view
        updateStats();
    }
    
    /**
     * Load habits from localStorage
     */
    function loadHabits() {
        const savedHabits = localStorage.getItem('slackerTracker_habits');
        if (savedHabits) {
            habits = JSON.parse(savedHabits);
            habits.forEach(habit => {
                updateHabitStats(habit);
            });
        }
    }
    
    /**
     * Save habits to localStorage
     */
    function saveHabits() {
        localStorage.setItem('slackerTracker_habits', JSON.stringify(habits));
    }
    
    /**
     * Load theme preference from localStorage
     */
    function loadThemePreference() {
        // If no preference has been set, default to Toxic mode (true)
        const storedPreference = localStorage.getItem('slackerTracker_toxicMode');
        
        // For new users, explicitly set the default preference
        if (storedPreference === null) {
            localStorage.setItem('slackerTracker_toxicMode', 'true');
        }
        
        const isToxicMode = localStorage.getItem('slackerTracker_toxicMode') !== 'false';
        themeToggle.checked = isToxicMode;
        
        if (isToxicMode) {
            document.body.classList.remove('supportive-mode');
        } else {
            document.body.classList.add('supportive-mode');
        }
    }
    
    /**
     * Toggle between toxic and supportive themes
     */
    function toggleTheme() {
        if (themeToggle.checked) {
            document.body.classList.remove('supportive-mode');
            localStorage.setItem('slackerTracker_toxicMode', 'true');
        } else {
            document.body.classList.add('supportive-mode');
            localStorage.setItem('slackerTracker_toxicMode', 'false');
        }
        
        // Update feedback to match the new theme
        updateFeedbackBanner();
    }
    
    /**
     * Switch between different views (list, calendar, stats)
     */
    function switchView(viewId) {
        // Update active button
        viewButtons.forEach(btn => {
            if (btn.id === `${viewId}-btn`) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Hide all views
        listView.classList.remove('active-view');
        calendarView.classList.remove('active-view');
        statsView.classList.remove('active-view');
        
        // Show selected view
        document.getElementById(viewId).classList.add('active-view');
        
        // Refresh views
        if (viewId === 'calendar-view') {
            renderCalendarView();
        } else if (viewId === 'stats-view') {
            updateStats();
        }
    }
    
    /**
     * Add a new habit
     */
    function addHabit() {
        const habitName = newHabitInput.value.trim();
        
        if (habitName === '') {
            shakElement(newHabitInput);
            return;
        }
        
        const habit = {
            id: Date.now().toString(),
            name: habitName,
            history: [],
            streak: 0,
            missed: 0,
            longestStreak: 0,
            createdAt: new Date().toISOString()
        };
        
        habits.push(habit);
        saveHabits();
        renderHabits();
        renderCalendarView();
        updateStats();
        updateFeedbackBanner();
        
        newHabitInput.value = '';
        newHabitInput.focus();
    }
    
    /**
     * Delete a habit
     */
    function deleteHabit(habitId) {
        habits = habits.filter(habit => habit.id !== habitId);
        saveHabits();
        renderHabits();
        renderCalendarView();
        updateStats();
        updateFeedbackBanner();
    }
    
    /**
     * Log a habit for today (done or not done)
     */
    function logHabit(habitId, isDone) {
        const today = new Date().toISOString().split('T')[0];
        const habitIndex = habits.findIndex(h => h.id === habitId);
        
        if (habitIndex === -1) return;
        
        // Check if we already have an entry for today
        const todayEntryIndex = habits[habitIndex].history.findIndex(
            entry => entry.date === today
        );
        
        if (todayEntryIndex !== -1) {
            // Update existing entry
            habits[habitIndex].history[todayEntryIndex].done = isDone;
        } else {
            // Add new entry
            habits[habitIndex].history.push({
                date: today,
                done: isDone
            });
        }
        
        // Update stats
        updateHabitStats(habits[habitIndex]);
        
        saveHabits();
        renderHabits();
        renderCalendarView();
        updateStats();
        updateFeedbackBanner();
    }
    
    /**
     * Log a habit from the calendar view for a specific date
     */
    function logHabitForDate(habitId, date, isDone) {
        const habitIndex = habits.findIndex(h => h.id === habitId);
        
        if (habitIndex === -1) return;
        
        // Check if we already have an entry for this date
        const entryIndex = habits[habitIndex].history.findIndex(
            entry => entry.date === date
        );
        
        if (entryIndex !== -1) {
            // Update existing entry
            habits[habitIndex].history[entryIndex].done = isDone;
        } else {
            // Add new entry
            habits[habitIndex].history.push({
                date: date,
                done: isDone
            });
        }
        
        // Update stats
        updateHabitStats(habits[habitIndex]);
        
        saveHabits();
        renderHabits();
        renderCalendarView();
        updateStats();
        updateFeedbackBanner();
    }
    
    /**
     * Update streak, missed count, and longestStreak for a habit
     */
    function updateHabitStats(habit) {
        if (!habit.history.length) {
            habit.streak = 0;
            habit.missed = 0;
            habit.longestStreak = 0;
            return;
        }
        
        // Sort history by date (newest first)
        const sortedHistory = [...habit.history].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Calculate current streak
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Check if the most recent entry is from today or yesterday
        const mostRecentEntry = sortedHistory[0];
        if (mostRecentEntry && (mostRecentEntry.date === today || mostRecentEntry.date === yesterday)) {
            if (mostRecentEntry.done) {
                streak = 1;
                
                // Count consecutive days before today/yesterday
                for (let i = 1; i < sortedHistory.length; i++) {
                    const currentDate = new Date(sortedHistory[i].date);
                    const previousDate = new Date(sortedHistory[i-1].date);
                    
                    // Check if entries are consecutive days and done is true
                    const dayDiff = Math.round((previousDate - currentDate) / 86400000);
                    
                    if (dayDiff === 1 && sortedHistory[i].done) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }
        
        // Calculate missed days
        const missed = sortedHistory.filter(entry => !entry.done).length;
        
        // Calculate longest streak historically
        let longestStreak = streak; // Start with current streak
        let currentStreakCount = 0;
        
        // Sort history by date (oldest first) for longest streak calculation
        const chronologicalHistory = [...habit.history].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        for (let i = 0; i < chronologicalHistory.length; i++) {
            if (chronologicalHistory[i].done) {
                currentStreakCount++;
                
                // Check if this is end of a streak or the last entry
                if (i === chronologicalHistory.length - 1 || 
                    !chronologicalHistory[i+1].done ||
                    daysBetween(new Date(chronologicalHistory[i].date), new Date(chronologicalHistory[i+1].date)) > 1) {
                    
                    // Update longest streak if current streak is longer
                    if (currentStreakCount > longestStreak) {
                        longestStreak = currentStreakCount;
                    }
                    
                    // Reset current streak counter
                    currentStreakCount = 0;
                }
            } else {
                // Reset streak on missed day
                currentStreakCount = 0;
            }
        }
        
        habit.streak = streak;
        habit.missed = missed;
        habit.longestStreak = longestStreak;
    }
    
    /**
     * Calculate days between two dates
     */
    function daysBetween(date1, date2) {
        return Math.round(Math.abs((date2 - date1) / 86400000));
    }
    
    /**
     * Render all habits to the DOM
     */
    function renderHabits() {
        habitsList.innerHTML = '';
        
        if (habits.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.innerHTML = `
                <i class="fas fa-ghost"></i>
                <p>no habits??? ur arc ain't even started yet <span class="emoji">💀</span></p>
                <p>type something above and stop lurking lil bro <span class="emoji">🫵</span></p>
            `;
            habitsList.appendChild(emptyMessage);
            return;
        }
        
        habits.forEach(habit => {
            const habitCard = document.createElement('div');
            habitCard.className = `habit-card ${getStreakClass(habit.streak)}`;
            
            habitCard.innerHTML = `
                <div class="habit-header">
                    <h3 class="habit-name">${habit.name}</h3>
                    <div class="habit-status">${getStatusEmoji(habit.streak)}</div>
                    <button class="btn btn-delete" data-id="${habit.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="habit-metrics">
                    <div class="metric">
                        <div class="metric-value">${habit.streak}</div>
                        <div class="metric-label">Day Streak</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${habit.missed}</div>
                        <div class="metric-label">Times Missed</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${habit.longestStreak}</div>
                        <div class="metric-label">Best Streak</div>
                    </div>
                </div>
                
                <div class="habit-message">
                    ${getHabitMessage(habit)}
                </div>
                
                <div class="habit-actions">
                    <button class="btn btn-yes" data-id="${habit.id}">
                        <i class="fas fa-check"></i> Done Today
                    </button>
                    <button class="btn btn-no" data-id="${habit.id}">
                        <i class="fas fa-times"></i> Nope
                    </button>
                </div>
            `;
            
            habitsList.appendChild(habitCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.id;
                deleteHabit(habitId);
            });
        });
        
        document.querySelectorAll('.btn-yes').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.id;
                logHabit(habitId, true);
            });
        });
        
        document.querySelectorAll('.btn-no').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.id;
                logHabit(habitId, false);
            });
        });
        
        // After rendering, refresh emoji replacements if the replacer exists
        if (window.appleEmojiReplacer) {
            window.appleEmojiReplacer.refresh();
        }
    }
    
    /**
     * Update the feedback banner based on overall performance
     */
    function updateFeedbackBanner() {
        if (habits.length === 0) {
            feedbackBanner.innerHTML = "bro log something or close the app. <span class='emoji'>deadass</span>.";
            return;
        }
        
        const totalEntries = habits.reduce((sum, habit) => sum + habit.history.length, 0);
        const totalCompleted = habits.reduce((sum, habit) => 
            sum + habit.history.filter(entry => entry.done).length, 0);
        const completionRate = totalEntries > 0 
            ? Math.round((totalCompleted / totalEntries) * 100)
            : 0;
        
        const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
        const avgStreak = totalStreak / habits.length;
        
        let message;
        const isToxicMode = localStorage.getItem('slackerTracker_toxicMode') !== 'false';
        
        if (completionRate === 100 && totalEntries > 0) {
            // Perfect completion rate
            message = isToxicMode
                ? "u actually completed everything? lowkey suspicious <span class='emoji'>🤨</span>"
                : "100% complete? went off a lil too hard bestie <span class='emoji'>🏆</span><span class='emoji'>✨</span>";
        } else if (completionRate === 0 && totalEntries > 0) {
            // 0% completion rate
            message = isToxicMode
                ? "zero percent completion is crazy. like actually wild <span class='emoji'>💀</span>"
                : "bro flopped on every single habit. iconic in a sad way <span class='emoji'>📉</span>";
        } else if (completionRate < 50 && totalEntries > 5) {
            // Less than 50% completion with significant data
            message = isToxicMode
                ? "below 50%?? just delete the whole app fr <span class='emoji'>📱</span><span class='emoji'>🗑️</span>"
                : "struggling a bit. maybe try just one habit? baby steps <span class='emoji'>��</span>";
        } else if (avgStreak >= 5) {
            message = getRandomMessage(isToxicMode ? encouragementMessages : supportiveEncouragementMessages);
        } else if (avgStreak >= 2) {
            message = getRandomMessage(isToxicMode ? neutralMessages : supportiveNeutralMessages);
        } else {
            message = getRandomMessage(isToxicMode ? roastMessages : supportiveRoastMessages);
        }
        
        feedbackBanner.innerHTML = message;
        
        // After updating banner, refresh emoji replacements if the replacer exists
        if (window.appleEmojiReplacer) {
            window.appleEmojiReplacer.refresh();
        }
    }
    
    /**
     * Get a CSS class based on streak count
     */
    function getStreakClass(streak) {
        if (streak >= 5) return 'streak-good';
        if (streak >= 2) return 'streak-ok';
        return 'streak-bad';
    }
    
    /**
     * Get an emoji based on streak count
     */
    function getStatusEmoji(streak) {
        if (streak >= 5) return '🔥';
        if (streak >= 2) return '😬';
        return '💀';
    }
    
    /**
     * Get a message for a specific habit
     */
    function getHabitMessage(habit) {
        const isToxicMode = localStorage.getItem('slackerTracker_toxicMode') !== 'false';
        
        if (habit.streak >= 5) {
            if (habit.streak === habit.longestStreak && habit.streak > 7) {
                return isToxicMode
                    ? `${habit.streak} days?! new high score unlocked 🧠🔥`
                    : `Omg slay, ${habit.streak} days is your new record! 🌟`;
            }
            return isToxicMode
                ? `${habit.streak} days in a row? ok consistency demon 😈`
                : `You're killing it! ${habit.streak} day streak and growing 💪`;
        } else if (habit.streak >= 2) {
            return isToxicMode
                ? `Chain is chainin'. Don't fumble it now 🔗`
                : `Momentum unlocked! ${habit.streak} days strong 💫`;
        } else if (habit.streak === 1) {
            return isToxicMode
                ? `Day 1 again? it's giving deja flop 💀`
                : `Day 1! Proud of u for showing up 🫶`;
        } else if (habit.longestStreak > 5) {
            return isToxicMode
                ? `Ur best was ${habit.longestStreak} days. And now? `
                : `You've done ${habit.longestStreak} days before. Let's run it back 🔁`;
        } else {
            return isToxicMode
                ? `${habit.missed} flops in and still typing. Iconic. 🤡`
                : `Missed ${habit.missed} times, but you're still here 💗`;
        }
    }
    
    /**
     * Get a random message from an array
     */
    function getRandomMessage(messages) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }
    
    /**
     * Shake an element for error feedback
     */
    function shakElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    /**
     * Show the confirmation modal
     */
    function showModal(title, message, action) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalAction = action;
        modal.style.display = 'block';
    }
    
    /**
     * Close the confirmation modal
     */
    function closeModal() {
        modal.style.display = 'none';
        modalAction = null;
    }
    
    /**
     * Handle confirmation modal actions
     */
    function handleModalConfirm() {
        if (modalAction === 'resetAllData') {
            // Reset all data
            habits = [];
            localStorage.removeItem('slackerTracker_habits');
            renderHabits();
            renderCalendarView();
            updateStats();
            updateFeedbackBanner();
            closeModal();
        }
    }
    
    /**
     * Export data as JSON file
     */
    function exportData() {
        // Create a JSON object with all habit data
        const data = {
            habits: habits,
            exportDate: new Date().toISOString(),
            version: 'SlackerTracker-v2'
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(data, null, 2);
        
        // Create a Blob from the JSON string
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `slackertracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    
    /**
     * Import data from JSON file
     */
    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!importedData.habits || !Array.isArray(importedData.habits)) {
                    throw new Error('Invalid data format');
                }
                
                // Confirm before overwriting existing data
                showModal(
                    'Import Data',
                    `This will replace your current data with ${importedData.habits.length} habits from the backup. Continue?`,
                    'importConfirmed'
                );
                
                // Set up for confirmation
                modalConfirmBtn.onclick = function() {
                    habits = importedData.habits;
                    
                    // Update stats for all imported habits
                    habits.forEach(habit => {
                        updateHabitStats(habit);
                    });
                    
                    saveHabits();
                    renderHabits();
                    renderCalendarView();
                    updateStats();
                    updateFeedbackBanner();
                    
                    closeModal();
                    
                    // Reset file input
                    importFile.value = '';
                };
                
            } catch (error) {
                alert('Error importing data: Invalid file format');
                console.error('Import error:', error);
                importFile.value = '';
            }
        };
        
        reader.readAsText(file);
    }
    
    // Message Arrays - Toxic Mode
    const roastMessages = [
        "bro you are so ahhh <span class='emoji'>💀</span>",
        "ts pmo... you ain't even tryin <span class='emoji'>😒</span>",
        "this some npc character arc rn <span class='emoji'>👎</span>",
        "your habits got less consistency than your wifi <span class='emoji'>📶</span><span class='emoji'>❌</span>",
        "just sybau lil bro, this app ain't therapy <span class='emoji'>🧠</span><span class='emoji'>🔨</span>",
        "bro out here logging nothing like it's a personality <span class='emoji'>📉</span>",
        "1 day streak then ghosted. you are so ahhh <span class='emoji'>💀</span>",
        "even your screen time more consistent than your habits <span class='emoji'>📱</span><span class='emoji'>💀</span>",
        "ur effort got nerfed irl <span class='emoji'>💢</span>",
        "bro what is this graph?? modern art? <span class='emoji'>🖼️</span><span class='emoji'>😭</span>"
    ];
    
    const neutralMessages = [
        "you're kinda trying... in a background-process kinda way <span class='emoji'>🛑</span>",
        "half-sent. no delivery. <span class='emoji'>📩</span>",
        "ur stats look like crypto rn <span class='emoji'>📉</span>",
        "ok you're doing *something*... i guess <span class='emoji'>🤷‍♂️</span>",
        "not bad but still not giving... effort <span class='emoji'>😐</span>",
        "this timeline mid. could be worse tho <span class='emoji'>🧍</span>",
        "bare minimum vibes but ok <span class='emoji'>✏️</span>",
        "you're floating bro. log something solid <span class='emoji'>🫥</span>"
    ];
    
    const encouragementMessages = [
        "hold up... lil bro actually grinding?? <span class='emoji'>💪</span>",
        "ok maybe you not background character anymore <span class='emoji'>🎭</span>",
        "not bad for a former ahhh <span class='emoji'>💀</span>",
        "main quest progress detected <span class='emoji'>📈</span>",
        "you're actually doing it?? shocking but slayless <span class='emoji'>💯</span>",
        "consistency? unlocked. just don't choke now <span class='emoji'>🗝️</span>",
        "you got that discipline.exe running <span class='emoji'>✅</span>",
        "daily logging?? real. shocking. <span class='emoji'>🔌</span>"
    ];
    
    // Message Arrays - Supportive Mode
    const supportiveRoastMessages = [
        "hey, you opened the app. that's a W <span class='emoji'>📱</span>",
        "you flopped. it's fine. try again <span class='emoji'>😅</span>",
        "this streak is streaking backwards <span class='emoji'>💀</span>",
        "your habits called. they miss you <span class='emoji'>📞</span>",
        "ngl bro, you ghosted progress <span class='emoji'>👻</span>",
        "relatable L. try tomorrow <span class='emoji'>💤</span>",
        "not mad, just disappointed. like lightly <span class='emoji'>��</span>",
        "even this message trying harder than you rn <span class='emoji'>😬</span>"
    ];
    
    const supportiveNeutralMessages = [
        "you're trying. not hard. but trying <span class='emoji'>��</span>",
        "progress bar loading... slowly <span class='emoji'>��</span>",
        "some days are mid. it's ok <span class='emoji'>🫡</span>",
        "habit graph going through it rn <span class='emoji'>📉</span>",
        "low effort > no effort <span class='emoji'>📊</span>",
        "this is the warm-up arc, right? right? <span class='emoji'>🤨</span>",
        "not you doing things semi-regularly <span class='emoji'>🫢</span>",
        "you alive. barely. but we move <span class='emoji'>💀</span>"
    ];
    
    const supportiveEncouragementMessages = [
        "ok habit demon, i see you <span class='emoji'>🔥</span>",
        "you logging like you mean it <span class='emoji'>🧠</span>",
        "consistency kinda eating lately <span class='emoji'>👀</span>",
        "u cooking now, fr <span class='emoji'>🍳</span>",
        "past you lowkey jealous rn <span class='emoji'>🔁</span>",
        "main character habits loading... <span class='emoji'>��</span>",
        "u got this. don't fold now <span class='emoji'>✊</span>",
        "ur routine looking less unserious. proud-ish <span class='emoji'>🫶</span>"
    ];
    
    /**
     * Render the calendar view for the current month
     */
    function renderCalendarView() {
        const year = currentViewingMonth.getFullYear();
        const month = currentViewingMonth.getMonth();
        
        // Update month display
        currentMonthDisplay.textContent = `${currentViewingMonth.toLocaleString('default', { month: 'long' })} ${year}`;
        
        calendarHabitsList.innerHTML = '';
        
        if (habits.length === 0) {
            calendarHabitsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>calendar dry af. log something before it gets dusty 📅🕸️</p>
                </div>
            `;
            return;
        }
        
        // For each habit, create a calendar
        habits.forEach(habit => {
            const habitCalendar = document.createElement('div');
            habitCalendar.className = 'habit-calendar';
            
            // Get completion rate for this month
            const monthCompletionRate = getMonthCompletionRate(habit, year, month);
            
            habitCalendar.innerHTML = `
                <div class="habit-calendar-header">
                    <h3 class="habit-calendar-name">${habit.name}</h3>
                    <div class="habit-calendar-stats">
                        <div class="habit-calendar-stat">
                            <span>Streak: ${habit.streak}</span>
                        </div>
                        <div class="habit-calendar-stat">
                            <span>This Month: ${monthCompletionRate}%</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Create calendar grid
            const calendarGrid = document.createElement('div');
            calendarGrid.className = 'calendar-grid';
            
            // Add day headers (Sun-Sat)
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayNames.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                calendarGrid.appendChild(dayHeader);
            });
            
            // Get the first day of the month
            const firstDay = new Date(year, month, 1);
            const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Add empty cells for days before the first of the month
            for (let i = 0; i < startingDayOfWeek; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                calendarGrid.appendChild(emptyDay);
            }
            
            // Get the number of days in the month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateString = date.toISOString().split('T')[0];
                
                const calendarDay = document.createElement('div');
                calendarDay.className = 'calendar-day';
                calendarDay.textContent = day;
                calendarDay.dataset.date = dateString;
                calendarDay.dataset.habitId = habit.id;
                
                // Check if this date has an entry
                const entry = habit.history.find(h => h.date === dateString);
                
                // Highlight today
                const today = new Date().toISOString().split('T')[0];
                if (dateString === today) {
                    calendarDay.classList.add('today');
                }
                
                // Can't log for future dates
                if (date > new Date()) {
                    calendarDay.classList.add('future');
                } else {
                    // Add appropriate class based on entry status
                    if (entry) {
                        if (entry.done) {
                            calendarDay.classList.add('completed');
                        } else {
                            calendarDay.classList.add('missed');
                        }
                    }
                    
                    // Add click event to toggle status
                    calendarDay.addEventListener('click', () => {
                        if (entry) {
                            // Toggle status
                            logHabitForDate(habit.id, dateString, !entry.done);
                        } else {
                            // Default to done when clicking empty day
                            logHabitForDate(habit.id, dateString, true);
                        }
                    });
                }
                
                calendarGrid.appendChild(calendarDay);
            }
            
            habitCalendar.appendChild(calendarGrid);
            calendarHabitsList.appendChild(habitCalendar);
        });
    }
    
    /**
     * Update the stats view
     */
    function updateStats() {
        if (habits.length === 0) {
            // Show empty state for stats
            statsHabitsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <p>analytics said: bro you doing NOTHING 📊❌</p>
                </div>
            `;
            
            // Reset global stats
            totalCompletedElement.textContent = '0';
            completionRateElement.textContent = '0%';
            longestStreakElement.textContent = '0';
            currentStreakElement.textContent = '0';
            
            return;
        }
        
        // Calculate global stats
        const totalEntries = habits.reduce((sum, habit) => sum + habit.history.length, 0);
        const totalCompleted = habits.reduce((sum, habit) => 
            sum + habit.history.filter(entry => entry.done).length, 0);
        const completionRate = totalEntries > 0 
            ? Math.round((totalCompleted / totalEntries) * 100)
            : 0;
        const longestStreak = Math.max(...habits.map(habit => habit.longestStreak));
        const currentStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
        
        // Update global stats
        totalCompletedElement.textContent = totalCompleted;
        completionRateElement.textContent = `${completionRate}%`;
        longestStreakElement.textContent = longestStreak;
        currentStreakElement.textContent = currentStreak;
        
        // Render individual habit stats
        statsHabitsList.innerHTML = '';
        
        habits.forEach(habit => {
            const habitEntries = habit.history.length;
            const habitCompleted = habit.history.filter(entry => entry.done).length;
            const habitCompletionRate = habitEntries > 0 
                ? Math.round((habitCompleted / habitEntries) * 100)
                : 0;
            
            const habitStatItem = document.createElement('div');
            habitStatItem.className = 'habit-stat-item';
            
            habitStatItem.innerHTML = `
                <div class="habit-stat-header">
                    <div class="habit-stat-name">${habit.name}</div>
                    <div class="habit-stat-status">${getStatusEmoji(habit.streak)}</div>
                </div>
                <div class="habit-stat-grid">
                    <div class="habit-stat">
                        <div class="habit-stat-value">${habit.streak}</div>
                        <div class="habit-stat-label">Current Streak</div>
                    </div>
                    <div class="habit-stat">
                        <div class="habit-stat-value">${habit.longestStreak}</div>
                        <div class="habit-stat-label">Longest Streak</div>
                    </div>
                    <div class="habit-stat">
                        <div class="habit-stat-value">${habitCompletionRate}%</div>
                        <div class="habit-stat-label">Completion Rate</div>
                    </div>
                </div>
            `;
            
            statsHabitsList.appendChild(habitStatItem);
        });
    }
    
    /**
     * Calculate the completion rate for a habit in a specific month
     */
    function getMonthCompletionRate(habit, year, month) {
        // Get all entries for this month
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        const monthEntries = habit.history.filter(entry => 
            entry.date >= startDate && entry.date <= endDate
        );
        
        if (monthEntries.length === 0) return 0;
        
        const completedEntries = monthEntries.filter(entry => entry.done).length;
        return Math.round((completedEntries / monthEntries.length) * 100);
    }

    // Load the emoji replacer script
    const emojiScript = document.createElement('script');
    emojiScript.src = 'emoji-replacer.js';
    document.head.appendChild(emojiScript);
}); 