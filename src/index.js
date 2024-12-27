const { stringify } = require('csv-stringify');
const fs = require('fs');

const el = (element, inner, classes) => {
  const classAttribute = classes ? ` class="${classes}"` : ''
  return `<${element}${classAttribute}>${inner}</${element}>`
}

const cellContents = (cellText, rowIdx, columnIdx, rowLength) => {
  if (cellText) {
    return cellText
  }
  if (rowIdx > 4 && columnIdx > 1 && columnIdx < rowLength - 2) {
    return el('div', '&#8226', 'text-center')
  }
  return ''
}

const errorMessages = {
  missingArgs: 'missing arguments'
}

const parseArguments = () => {
  const checklistDateArg = process.argv[2];
  const configPath = process.argv[3];
  if (!checklistDateArg || !configPath) {
    console.log('Usage: checklist-generator <YYYY-MM> </path/to/json>');
    throw new Error(errorMessages.missingArgs);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return { checklistDateArg, config }
}

const buildColumnLabels = (checklistDate, config) => {
  let columnLabels
  switch (config.taskFrequency) {
    case 'weekly':
      const saturdays = [];
      const startDate = new Date(checklistDate.getFullYear(), checklistDate.getMonth(), 1);
      const endDate = new Date(checklistDate.getFullYear(), checklistDate.getMonth() + 1, 0); // last day of the month
      const weeks = [];
      let currentWeek = [];
      // Loop through each day in the month
      for (let day = startDate.getDate(); day <= endDate.getDate(); day++) {
        const date = new Date(checklistDate.getFullYear(), checklistDate.getMonth(), day);
        // Check if the current day is a Saturday (getDay() == 6)
        if (date.getDay() === 6) {
          saturdays.push(date);
        }
      }
      // Now group the Saturdays into weeks and format them
      saturdays.forEach((saturday, index) => {
        const startSaturday = saturday;
        const endSaturday = new Date(saturday);
        endSaturday.setDate(saturday.getDate() + 6); // The Friday of the same week
        // Format the date as 'S MM/DD - F MM/DD'
        const startDateFormatted = `${startSaturday.getMonth() + 1}/${startSaturday.getDate()}`;
        const endDateFormatted = `${endSaturday.getMonth() + 1}/${endSaturday.getDate()}`;
        // Push the week info with 'week X'
        weeks.push({
          label1: `S ${startDateFormatted} - F ${endDateFormatted}`,
          label2: `week ${index + 1}`,
        });
      });
      columnLabels = weeks; // Store the resulting weeks into columnLabels
      break;
    case 'daily':
    default:
      columnLabels = Array.from({ length: dateUtils.daysInMonth(checklistDate) }, (_, day) => {
        const daysOfWeek = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
        const date = new Date(checklistDate.getFullYear(), checklistDate.getFullYear(), day + 1);
        const dayOfWeek = date.getDay();
        return {
          label1: day + 1,
          label2: daysOfWeek[dayOfWeek],
        };
      });
  }
  return columnLabels
}

const buildChecklistArray = (checklistDate, columnLabels, config) => {
  const NON_DATE_COLUMNS = 4 // task, empty, empty, date/empty
  const TASK_COLUMN_INDEX = 0 // first item
  const DATE_COLUMN_L_SPACING = 2 // task, empty
  // Prepare the empty row for CSV
  let emptyRow = Array(columnLabels.length + NON_DATE_COLUMNS).fill('');
  // Create header row
  let r1 = [...emptyRow];
  r1[TASK_COLUMN_INDEX] = 'task';
  r1[r1.length - 1] = `${dateUtils.monthString(checklistDate).slice(0, 3)} ${dateUtils.yearString(checklistDate).slice(-2)}`;
  // Create rows for date and day
  let r3 = [...emptyRow];
  let r4 = [...emptyRow];
  columnLabels.forEach((dateInfo, i) => {
    r3[i + DATE_COLUMN_L_SPACING] = dateInfo.label1;
    r4[i + DATE_COLUMN_L_SPACING] = dateInfo.label2;
  });
  // Build checklist array
  let checklistArray = [r1, [...emptyRow], r3, r4, [...emptyRow]];
  config.tasks.forEach((task) => {
    if (!task.when.length || task.when.includes(dateUtils.monthString(checklistDate))) {
      let taskRow = [...emptyRow];
      taskRow[TASK_COLUMN_INDEX] = task.title;
      checklistArray.push(taskRow);
    }
  });
  return checklistArray
}

const buildHtml = (checklistArray) => {
  const title = el('title', 'Checklist')
  const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>'
  const head = el('head', [title, tailwindScript].join(''))
  const innerTable = checklistArray.map((row, index) => {
    const cellElements = row.map((cell, columnIdx) => {
      cell = cell.toString()
      return el(
        index === 0 ? 'th' : 'td',
        cellContents(cell, index, columnIdx, row.length),
        `${index === 0 ? '' : 'text-center p-0.5'} border border-neutral-200`
      )
    }).join('')
    const rowEl = el('tr', cellElements)
    return rowEl
  }).join('')
  const table = el('table', innerTable, 'text-xs box-border m-2')
  const body = el('body', table)
  const htmlTag = el('html', [head, body].join(''))
  
  const html = `
<!DOCTYPE html>
${htmlTag}
  `
  return html
}

const dateUtils = {
  yearString: (date) => {
    return date.getFullYear().toString();
  },
  monthString: (date) => {
    return date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }).toLowerCase()
  },
  daysInMonth: (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  }
}

const main = () => {
  const { checklistDateArg, config } = parseArguments()
  const checklistDate = new Date(checklistDateArg)
  const columnLabels = buildColumnLabels(checklistDate, config)
  const checklistArray = buildChecklistArray(checklistDate, columnLabels, config)
  const html = buildHtml(checklistArray)
  process.stdout.write(html)
}


try {
  main()
} catch (e) {
  if (e.message !== errorMessages.missingArgs) {
    console.error(e.message)
  }
  process.exit(1);
}
