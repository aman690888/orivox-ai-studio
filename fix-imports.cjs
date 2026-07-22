const fs = require('fs');
const path = require('path');
const dir = 'src/renderer/components';

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync(dir);
files.forEach(f => {
  if (!f.endsWith('.tsx')) return;
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  if (content.includes('../EditableText')) {
    content = content.replace(/['"]\.\.\/EditableText['"]/g, "'../../EditableText'");
    changed = true;
  }
  if (content.includes('../RendererRegistry')) {
    content = content.replace(/['"]\.\.\/RendererRegistry['"]/g, "'../../RendererRegistry'");
    changed = true;
  }
  if (changed) fs.writeFileSync(f, content);
});

const pricingCardPath = 'src/renderer/components/cards/PricingCard.tsx';
if (fs.existsSync(pricingCardPath)) {
  let content = fs.readFileSync(pricingCardPath, 'utf8');
  content = content.replace(/ringColor:/g, '/* ringColor: */');
  fs.writeFileSync(pricingCardPath, content);
}
