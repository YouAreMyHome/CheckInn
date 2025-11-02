#!/usr/bin/env node

/**
 * Migration Script: Convert Relative Imports to Alias Imports
 * 
 * Usage: node scripts/migrate-to-alias.js
 * 
 * This script will:
 * 1. Scan all .js/.jsx files in apps/frontend/src
 * 2. Replace relative paths with appropriate aliases
 * 3. Create backup files before modification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FRONTEND_SRC = path.resolve(__dirname, '../apps/frontend/src');
const DRY_RUN = process.argv.includes('--dry-run');

// Mapping patterns
const REPLACEMENT_PATTERNS = [
  // Shared components
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/components\/([^'"]+)['"]/g,
    replacement: "from '@components/$1'"
  },
  // Shared context
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/context\/([^'"]+)['"]/g,
    replacement: "from '@context/$1'"
  },
  // Shared hooks
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/hooks\/([^'"]+)['"]/g,
    replacement: "from '@hooks/$1'"
  },
  // Shared services
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/services\/([^'"]+)['"]/g,
    replacement: "from '@services/$1'"
  },
  // Shared utils
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/utils\/([^'"]+)['"]/g,
    replacement: "from '@utils/$1'"
  },
  // Two levels up - shared
  {
    pattern: /from ['"]\.\.\/\.\.\/shared\/components\/([^'"]+)['"]/g,
    replacement: "from '@components/$1'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/shared\/context\/([^'"]+)['"]/g,
    replacement: "from '@context/$1'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/shared\/hooks\/([^'"]+)['"]/g,
    replacement: "from '@hooks/$1'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/shared\/services\/([^'"]+)['"]/g,
    replacement: "from '@services/$1'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/shared\/utils\/([^'"]+)['"]/g,
    replacement: "from '@utils/$1'"
  },
];

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  replacements: 0,
  errors: 0
};

/**
 * Recursively scan directory and process files
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (file === 'node_modules' || file === 'dist' || file === 'build') {
        continue;
      }
      scanDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  }
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesScanned++;

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let fileReplacements = 0;

    // Apply all replacement patterns
    for (const { pattern, replacement } of REPLACEMENT_PATTERNS) {
      const originalContent = content;
      content = content.replace(pattern, (match) => {
        fileReplacements++;
        return replacement;
      });
      
      if (content !== originalContent) {
        modified = true;
      }
    }

    if (modified && fileReplacements > 0) {
      const relativePath = path.relative(FRONTEND_SRC, filePath);
      
      if (DRY_RUN) {
        console.log(`[DRY RUN] Would modify: ${relativePath} (${fileReplacements} replacements)`);
      } else {
        // Create backup
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        
        // Write modified content
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Modified: ${relativePath} (${fileReplacements} replacements)`);
      }
      
      stats.filesModified++;
      stats.replacements += fileReplacements;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting import alias migration...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }

  if (!fs.existsSync(FRONTEND_SRC)) {
    console.error('❌ Frontend source directory not found:', FRONTEND_SRC);
    process.exit(1);
  }

  scanDirectory(FRONTEND_SRC);

  // Print statistics
  console.log('\n📊 Migration Statistics:');
  console.log('─'.repeat(50));
  console.log(`Files scanned:   ${stats.filesScanned}`);
  console.log(`Files modified:  ${stats.filesModified}`);
  console.log(`Total replacements: ${stats.replacements}`);
  console.log(`Errors:          ${stats.errors}`);
  console.log('─'.repeat(50));

  if (!DRY_RUN && stats.filesModified > 0) {
    console.log('\n✅ Migration complete!');
    console.log('⚠️  Backup files (.backup) have been created');
    console.log('💡 Test your app and remove backups when satisfied');
    console.log('\nTo remove backups:');
    console.log('  find apps/frontend/src -name "*.backup" -delete');
  } else if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ No files needed modification');
  }
}

// Run the script
main();
