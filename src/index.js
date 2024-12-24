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
    console.log('Usage: checklist-generator <YYYY-MM-DD> </path/to/json>');
    throw new Error(errorMessages.missingArgs);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return { checklistDateArg, config }
}

const buildColumnData = (checklistDate) => {
  const columnData = Array.from({ length: dateUtils.daysInMonth(checklistDate) }, (_, day) => {
    const daysOfWeek = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
    const date = new Date(checklistDate.getFullYear(), checklistDate.getFullYear(), day + 1);
    const dayOfWeek = date.getDay();
    return {
      date: day + 1,
      day: daysOfWeek[dayOfWeek],
    };
  });
  return columnData
}

const buildFormattedChecklistData = (checklistDate, columnData, config) => {
  const NON_DATE_COLUMNS = 4 // task, empty, empty, date/empty
  const TASK_COLUMN_INDEX = 0 // first item
  const DATE_COLUMN_L_SPACING = 2 // task, empty

  // Prepare the empty row for CSV
  let emptyRow = Array(dateUtils.daysInMonth(checklistDate) + NON_DATE_COLUMNS).fill('');

  // Create header row
  let r1 = [...emptyRow];
  r1[TASK_COLUMN_INDEX] = 'task';
  r1[r1.length - 1] = `${dateUtils.monthString(checklistDate).slice(0, 3)} ${dateUtils.yearString(checklistDate).slice(-2)}`;

  // Create rows for date and day
  let r3 = [...emptyRow];
  let r4 = [...emptyRow];
  columnData.forEach((dateInfo, i) => {
    r3[i + DATE_COLUMN_L_SPACING] = dateInfo.date;
    r4[i + DATE_COLUMN_L_SPACING] = dateInfo.day;
  });

  // Format checklist data
  let formattedChecklistData = [r1, [...emptyRow], r3, r4, [...emptyRow]];
  config.tasks.forEach((task) => {
    if (!task.when.length || task.when.includes(dateUtils.monthString(checklistDate))) {
      let taskRow = [...emptyRow];
      taskRow[TASK_COLUMN_INDEX] = task.title;
      formattedChecklistData.push(taskRow);
    }
  });
  return formattedChecklistData
}

const buildHtml = (formattedChecklistData) => {
  const title = el('title', 'Checklist')
  const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>'
  const head = el('head', [title, tailwindScript].join(''))
  const innerTable = formattedChecklistData.map((row, index) => {
    const cellElements = row.map((cell, columnIdx) => {
      cell = cell.toString()
      return el(
        index === 0 ? 'th' : 'td',
        cellContents(cell, index, columnIdx, row.length),
        index === 0 ? '' : 'text-center p-0.5'
      )
    }).join('')
    const rowEl = el('tr', cellElements)
    return rowEl
  }).join('')
  const table = el('table', innerTable, 'text-xs border border-black m-2')
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
    return date.toLocaleString('en-US', { month: 'long' }).toLowerCase()
  },
  daysInMonth: (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  }
}

const main = () => {
  const { checklistDateArg, config } = parseArguments()
  const checklistDate = new Date(checklistDateArg)
  const columnData = buildColumnData(checklistDate)
  const formattedChecklistData = buildFormattedChecklistData(checklistDate, columnData, config)
  const html = buildHtml(formattedChecklistData)
  console.log(html)
}


try {
  main()
} catch (e) {
  if (e.message !== errorMessages.missingArgs) {
    console.error(e.message)
  }
  process.exit(1);
}
