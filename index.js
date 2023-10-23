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

const checklistData = JSON.parse(fs.readFileSync('./checklist.json', 'utf8'));

let formattedChecklistData = []

checklistData.tasks.forEach((category) => {
  formattedChecklistData.push([category.categoryName, ''])
  category.tasks.forEach((task) => {
    formattedChecklistData.push([task.title, task.frequency])})
    formattedChecklistData.push(['', ''])

})

//stringify([['foo', 'bar', 'baz'], ['a', 'b', 'c']]).pipe(process.stdout)
stringify(formattedChecklistData).pipe(process.stdout)
