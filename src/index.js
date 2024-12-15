const { stringify } = require('csv-stringify');
const fs = require('fs');

// Parse command line arguments
const generationDateArg = process.argv[2]
const jsonData = process.argv[3];

if (!generationDateArg || !jsonData) {
  console.log('Usage: checklist-generator <YYYY-MM-DD> </path/to/json>');
  process.exit(1);
}

// Prepare date constants
const generationDate = new Date(generationDateArg)
const month = generationDate.getMonth();
const year = generationDate.getFullYear().toString();
const monthString = generationDate.toLocaleString('en-US', { month: 'long' }).toLowerCase()
const daysInMonth = new Date(year, month + 1, 0).getDate();

// Generate dates and corresponding day names
const daysOfWeek = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
const datesAndDays = Array.from({ length: daysInMonth }, (_, day) => {
  const date = new Date(year, month, day + 1);
  const dayOfWeek = date.getDay();
  return {
    date: day + 1,
    day: daysOfWeek[dayOfWeek],
  };
});

const NON_DATE_COLUMNS = 4 // task, empty, empty, date/empty
const TASK_COLUMN_INDEX = 0 // first item
const DATE_COLUMN_L_SPACING = 2 // task, empty

// Prepare the empty row for CSV
let emptyRow = Array(daysInMonth + NON_DATE_COLUMNS).fill('');

// Create header row
let r1 = [...emptyRow];
r1[TASK_COLUMN_INDEX] = 'task';
r1[r1.length - 1] = `${monthString.slice(0, 3)} ${year.slice(-2)}`;

// Create rows for date and day
let r3 = [...emptyRow];
let r4 = [...emptyRow];
datesAndDays.forEach((dateInfo, i) => {
  r3[i + DATE_COLUMN_L_SPACING] = dateInfo.date;
  r4[i + DATE_COLUMN_L_SPACING] = dateInfo.day;
});


// Read checklist data from JSON
const checklistData = JSON.parse(fs.readFileSync(jsonData, 'utf8'));

// Format checklist data
let formattedChecklistData = [r1, [...emptyRow], r3, r4, [...emptyRow]];

checklistData.tasks.forEach((task) => {
  if (!task.when.length || task.when.includes(monthString)) {
    let taskRow = [...emptyRow];
    taskRow[TASK_COLUMN_INDEX] = task.title;
    formattedChecklistData.push(taskRow);
  }
});

// Convert to CSV and output
stringify(formattedChecklistData).pipe(process.stdout);
