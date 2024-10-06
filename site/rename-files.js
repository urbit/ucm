
// rename-files.js
import fs from 'fs';
import path from 'path';

const distDir = path.resolve(__dirname, 'dist');

let files;
function renameFilesToLowercase(dir) {
  files = fs.readdirSync(dir);
  console.log(files, "files")
  
  files.forEach((file) => {
    const oldPath = path.join(dir, file);
    const newPath = path.join(dir, file.toLowerCase());
    
    // Rename files
    if (oldPath !== newPath) {
      fs.renameSync(oldPath, newPath);
    }

    // If it's a directory, recursively rename files inside
    if (fs.statSync(newPath).isDirectory()) {
      renameFilesToLowercase(newPath);
    }
  });
}
function updateReferences(dir) {
  const regex = new RegExp(files.join("|"), 'gi');
  const fils = fs.readdirSync(dir);
  console.log("renamed files", fils)
  fils.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const newContent = content.replace(regex, (match) => match.toLowerCase());

      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
      }
    } else if (fs.statSync(filePath).isDirectory()) {
      updateReferences(filePath);
    }
  });
}

renameFilesToLowercase(distDir);
updateReferences(distDir);
