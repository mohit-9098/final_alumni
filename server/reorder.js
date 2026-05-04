const fs = require('fs');

const file = 'd:\\final_alumni\\server\\routes\\users.js';
let content = fs.readFileSync(file, 'utf8');

// The routes to move:
// GET /:id, PUT /:id, DELETE /:id
const getIndex = content.indexOf('// @route   GET /api/users/:id');
const statsIndex = content.indexOf('// @route   GET /api/users/stats');

if (getIndex !== -1 && statsIndex !== -1 && getIndex < statsIndex) {
  const routesToMove = content.substring(getIndex, statsIndex);
  
  // Remove routesToMove from original position
  content = content.slice(0, getIndex) + content.slice(statsIndex);
  
  // Find where to insert (before module.exports)
  const exportIndex = content.indexOf('module.exports = router;');
  
  // Insert
  content = content.slice(0, exportIndex) + routesToMove + content.slice(exportIndex);
  
  fs.writeFileSync(file, content);
  console.log('Reordered successfully');
} else {
  console.log('Could not find indices or already reordered');
}
