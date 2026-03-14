/**
 * Rule-based NLP parser to extract tasks from meeting notes.
 * 
 * Patterns detected:
 *  - "[Name] will [action] by [date]"
 *  - "[Name] should [action]"
 *  - "Need to [action]"
 *  - "We need to [action]"
 *  - "[Action] needs to be done"
 */

const ASSIGNEE_PATTERNS = [
  /^(\w+)\s+will\s+(.+?)(?:\s+by\s+(.+))?$/i,
  /^(\w+)\s+should\s+(.+?)(?:\s+by\s+(.+))?$/i,
  /^(\w+)\s+needs?\s+to\s+(.+?)(?:\s+by\s+(.+))?$/i,
  /^(\w+)\s+is\s+going\s+to\s+(.+?)(?:\s+by\s+(.+))?$/i,
];

const UNASSIGNED_PATTERNS = [
  /^(?:we\s+)?need\s+to\s+(.+?)(?:\s+by\s+(.+))?$/i,
  /^(?:we\s+)?should\s+(.+?)(?:\s+by\s+(.+))?$/i,
  /^(?:we\s+)?have\s+to\s+(.+?)(?:\s+by\s+(.+))?$/i,
  /^(.+?)\s+needs?\s+to\s+be\s+done(?:\s+by\s+(.+))?$/i,
];

export const extractTasksFromNotes = (notesText) => {
  const lines = notesText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 3);

  const tasks = [];

  for (const line of lines) {
    let matched = false;

    // Try assigned patterns first
    for (const pattern of ASSIGNEE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        tasks.push({
          title: capitalize(match[2].trim().replace(/[.!]+$/, '')),
          assigneeName: capitalize(match[1].trim()),
          dueDate: match[3] ? match[3].trim() : null,
        });
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Try unassigned patterns
    for (const pattern of UNASSIGNED_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        tasks.push({
          title: capitalize(match[1].trim().replace(/[.!]+$/, '')),
          assigneeName: null,
          dueDate: match[2] ? match[2].trim() : null,
        });
        matched = true;
        break;
      }
    }
  }

  return tasks;
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
