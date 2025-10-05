# SlackerTracker

A brutally honest habit tracker that doesn't sugarcoat your failures or over-celebrate your wins. It tells it like it is.

[Visit GitHub Repository](https://github.com/NawidJavid/slacker-tracker)

## About

SlackerTracker is a web-based habit tracker that works entirely offline. It's designed to be:

- **Blunt**: Get roasted when you're slacking, and modest praise when you're consistent
- **Simple**: Add habits, track yes/no daily, see your streaks
- **Offline**: All data is stored in your browser's localStorage - no login, no backend, 100% private

## Features

- Add multiple daily habits to track
- Log whether you completed each habit daily
- View your current streak and missed day count for each habit
- Calendar view to visualize your habit history
- Stats dashboard to track your overall performance
- Switch between "Toxic" and "Supportive" mode
- Export/import your data for backup
- Bold, fun UI with emoji status indicators
- Fully responsive design

## Getting Started

### Option 1: Use the live version
Simply visit [SlackerTracker on GitHub Pages](https://nawidjavid.github.io/slacker-tracker/) to use the application directly in your browser.

### Option 2: Run locally
1. Clone this repository:
   ```
   git clone https://github.com/nawidjavid/slacker-tracker.git
   ```
2. Open `index.html` in any modern web browser
3. Add your first habit and start tracking

## How It Works

- **Adding Habits**: Enter a habit name and click "Add Habit"
- **Tracking**: For each habit, click "Done Today" or "Nope" to log your daily progress
- **Calendar View**: View and edit your history by clicking on specific dates
- **Stats**: See your overall performance and completion rates
- **Theme Toggle**: Switch between "Toxic" (harsh feedback) and "Supportive" (gentle encouragement) modes
- **Backup**: Export your data as JSON file and import it later if needed

## Technical Details

SlackerTracker is built with:
- HTML5
- CSS3 (with animations and responsive design)
- Vanilla JavaScript (no frameworks)
- localStorage API for data persistence

## Privacy

All data is stored locally in your browser using localStorage. Nothing is sent to any server, and no tracking or analytics are implemented.

## License

MIT License - feel free to modify and use this code however you want.

## Contributing

Pull requests are welcome! Feel free to improve SlackerTracker and make it even more fun and effective. 
