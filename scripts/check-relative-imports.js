#!/usr/bin/env node

/**
 * Check Script: Find files still using relative imports
 * 
 * Usage: node scripts/check-relative-imports.js
 * 
 * This script will scan and report files that still use relative paths
 * for shared resources instead of aliases
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FRONTEND_SRC = path.resolve(__dirname, '../apps/frontend/src');

// Patterns to detect
const PROBLEMATIC_PATTERNS = [
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\//g,
    description: '3 levels up to shared',
    suggestion: 'Use @shared, @components, @context, @hooks, @services, or @utils'
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/shared\//g,
    description: '2 levels up to shared',
    suggestion: 'Use @shared, @components, @context, @hooks, @services, or @utils'
  },
  {
    pattern: /from ['"]\.\.\/shared\//g,
    description: '1 level up to shared',
    suggestion: 'Use @shared, @components, @context, @hooks, @services, or @utils'
  },
];

const issues = [];

/**
 * Recursively scan directory
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === 'build') {
        continue;
      }
      scanDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      checkFile(filePath);
    }
  }
}

/**
 * Check a single file for problematic imports
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(FRONTEND_SRC, filePath);

    lines.forEach((line, index) => {
      PROBLEMATIC_PATTERNS.forEach(({ pattern, description, suggestion }) => {
        if (pattern.test(line)) {
          issues.push({
            file: relativePath,
            line: index + 1,
            content: line.trim(),
            description,
            suggestion
          });
        }
        // Reset regex
        pattern.lastIndex = 0;
      });
    });
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

/**
 * Group issues by file
 */
function groupIssuesByFile(issues) {
  const grouped = {};
  
  for (const issue of issues) {
    if (!grouped[issue.file]) {
      grouped[issue.file] = [];
    }
    grouped[issue.file].push(issue);
  }
  
  return grouped;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Checking for relative imports to shared resources...\n');

  if (!fs.existsSync(FRONTEND_SRC)) {
    console.error('❌ Frontend source directory not found:', FRONTEND_SRC);
    process.exit(1);
  }

  scanDirectory(FRONTEND_SRC);

  if (issues.length === 0) {
    console.log('✅ No problematic relative imports found!');
    console.log('🎉 All files are using import aliases correctly.\n');
    return;
  }

  // Group and display issues
  const groupedIssues = groupIssuesByFile(issues);
  const fileCount = Object.keys(groupedIssues).length;

  console.log(`⚠️  Found ${issues.length} relative imports in ${fileCount} file(s)\n`);
  console.log('─'.repeat(80));

  for (const [file, fileIssues] of Object.entries(groupedIssues)) {
    console.log(`\n📄 ${file}`);
    
    fileIssues.forEach((issue) => {
      console.log(`   Line ${issue.line}: ${issue.content}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  }

  console.log('─'.repeat(80));
  console.log(`\n📊 Summary: ${issues.length} imports need migration in ${fileCount} files`);
  console.log('\n💡 Run migration script to fix automatically:');
  console.log('   node scripts/migrate-to-alias.js --dry-run  (preview)');
  console.log('   node scripts/migrate-to-alias.js            (apply changes)\n');
}

// Run the script
main();
