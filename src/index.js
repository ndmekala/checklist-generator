import { stringify } from 'csv-stringify';
import fs from 'fs';

//  "tasks": [
//    {
//      "categoryName": "organization",
//      "tasks": [                          
//        {                                 
//          "title": "daily review",        
//          "frequency": "daily",
//          "when": ""
//        },
//        {
//          "title": "weekly review",
//          "frequency": "weekly",
//          "when": ""
//        },
//        {
//          "title": "create new checklist",
//          "frequency": "monthly",
//          "when": ""
//        }
//      ]
//    },

// TODO rename vars ... lots of ugly names

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year, month) {
  // Months are 0-based in JavaScript, so January is 0, February is 1, and so on.
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return daysInMonth[month];
}

function generateMonthDatesAndDays(month, year, daysInMonth) {
  const daysOfWeek = [
    "U", "M", "T", "W", "R", "F", "S"
  ];

  const dateObjects = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const dayName = daysOfWeek[dayOfWeek]

    dateObjects.push({
      date: day,
      day: dayName
    });
  }

  return dateObjects;
}


// TODO add conditional logic for node as argv[0] or not
// TODO usage if you fail to supply arguments
// assumes you run this as node index.js <month> <year>
const month = process.argv[2]
const year = process.argv[3]

// THIS IS WRONG
const monthStringToNumber = (month) => {
  switch (month) {
  case 'january':
    return 0;
  case 'february':
    return 1;
  case 'march':
    return 2;
  case 'april':
    return 3;
  case 'may':
    return 4;
  case 'june':
    return 5;
  case 'july':
    return 6;
  case 'august':
    return 7;
  case 'september':
    return 8;
  case 'october':
    return 9;
  case 'november':
    return 10;
  case 'december':
    return 11;
  }
}

//console.log(generateMonthDatesAndDays(monthStringToNumber(month), year, getDaysInMonth(year, monthStringToNumber(month))))

let emptyRow = []

// n + 5 columns where n is # of days in month
for (let i = 0; i < (getDaysInMonth(year, monthStringToNumber(month)) + 5); i++) {
  emptyRow.push('')
}

let r1 = emptyRow.slice()
r1[0] = 'task'
r1[1] = 'frequency'
r1[r1.length - 1] = month.slice(0, 3) + ' ' + year.toString().slice(2)

let r2 = emptyRow.slice()

let r3 = emptyRow.slice()
let r4 = emptyRow.slice()
let datesAndDays = generateMonthDatesAndDays(monthStringToNumber(month), year, getDaysInMonth(year, monthStringToNumber(month)))
for (let i = 0; i < getDaysInMonth(year, monthStringToNumber(month)); i++) {
  r3[i+3] = datesAndDays[i].date
  r4[i+3] = datesAndDays[i].day
}

let r5 = emptyRow.slice()

// console.log([r1, r2, r3, r4, r5])

const checklistData = JSON.parse(fs.readFileSync('./checklist.json', 'utf8'));

let formattedChecklistData = [r1, r2, r3, r4, r5]


// TODO make this handle when!
checklistData.tasks.forEach((category) => {

  let categoryRow = emptyRow.slice()
  categoryRow[0] = category.categoryName

  formattedChecklistData.push(categoryRow)
  category.tasks.forEach((task) => {
    if (task.when === month || task.when === '') {
      let taskRow = emptyRow.slice()
      taskRow[0] = task.title
      taskRow[1] = task.frequency
      formattedChecklistData.push(taskRow)
    }
  })
  formattedChecklistData.push(emptyRow.slice())

})

stringify(formattedChecklistData).pipe(process.stdout)


