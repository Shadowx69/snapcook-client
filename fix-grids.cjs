const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/SHADOW/Desktop/SnapCook/Semester Project/frontend/src/pages');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/gridTemplateColumns: '1fr 1fr'/g, "gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'");
    newContent = newContent.replace(/gridTemplateColumns: '1fr 1fr 1fr'/g, "gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))'");
    newContent = newContent.replace(/gridTemplateColumns: viewMode === 'grid' \? '1fr 1fr' : '1fr'/g, "gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(160px, 1fr))' : '1fr'");
    
    if(newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated ' + file);
    }
});
