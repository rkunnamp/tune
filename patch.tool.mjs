import fs from 'node:fs/promises';

export default async function patch({ text, filename }, ctx) {
    const patches = text.split(/<<<<<<<?[^\n]*\n/).filter(Boolean);
    let fileContent = await fs.readFile(filename, 'utf-8');

    for (const patch of patches) {
        const [oldPart, newPart] = patch.split(/=======\n/);
        if (!oldPart || !newPart) continue;
        
        const oldText = oldPart.trim();
        const newText = newPart.replace(/>>>>>>>?[^\n]*(\n|$)/, '');
        
        // Create regex that matches the old text with flexible whitespace
        const oldTextRegex = new RegExp(
            oldText
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex special chars
                .replace(/\s+/g, '\\s+') // replace any whitespace with \s+
        );
        
        fileContent = fileContent.replace(oldTextRegex, newText);
    }

    await fs.writeFile(filename, fileContent);
    return "patched";
}
