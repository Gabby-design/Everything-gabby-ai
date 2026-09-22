/**
 * Template management and variable rendering engine for docs/ai/ system.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_TEMPLATES_DIR = path.resolve(__dirname, '..', '..', 'templates', 'docs-ai');

/**
 * Get templates root directory.
 */
function getTemplatesDir(customDir) {
  return customDir || DEFAULT_TEMPLATES_DIR;
}

/**
 * List all available template files relative to templates root.
 */
function listTemplates(customDir) {
  const root = getTemplatesDir(customDir);
  if (!fs.existsSync(root)) return [];

  const results = [];
  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(path.relative(root, fullPath).replace(/\\/g, '/'));
      }
    }
  }

  walk(root);
  return results.sort();
}

/**
 * Read raw template content by name.
 */
function readTemplate(name, customDir) {
  const root = getTemplatesDir(customDir);
  const normalizedName = name.endsWith('.md') ? name : `${name}.md`;
  const filePath = path.join(root, normalizedName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found: "${name}" at ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Render template content with variable substitution (e.g., {{PROJECT}}, {{DATE}}).
 */
function render(templateContent, vars = {}) {
  return templateContent.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return String(vars[key] !== null && vars[key] !== undefined ? vars[key] : '');
    }
    return match;
  });
}

/**
 * Instantiate all docs/ai templates into a target directory with variables applied.
 */
function instantiate(targetDir, vars = {}, options = {}) {
  const root = getTemplatesDir(options.customDir);
  const templateFiles = listTemplates(root);
  const createdFiles = [];

  for (const relPath of templateFiles) {
    const srcPath = path.join(root, relPath);
    const destPath = path.join(targetDir, relPath);
    const destParent = path.dirname(destPath);

    if (!options.dryRun) {
      if (!fs.existsSync(destParent)) {
        fs.mkdirSync(destParent, { recursive: true });
      }

      if (!fs.existsSync(destPath) || options.overwrite) {
        const raw = fs.readFileSync(srcPath, 'utf8');
        const rendered = render(raw, vars);
        fs.writeFileSync(destPath, rendered, 'utf8');
        createdFiles.push(destPath);
      }
    } else {
      createdFiles.push(destPath);
    }
  }

  return {
    success: true,
    targetDir,
    files: createdFiles
  };
}

module.exports = {
  getTemplatesDir,
  listTemplates,
  readTemplate,
  render,
  instantiate
};
