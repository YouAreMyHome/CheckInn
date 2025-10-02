#!/usr/bin/env node

/**
 * Development Server Launcher
 * Starts all CheckInn applications in development mode
 */

const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

const APPS = {
  'api-server': {
    name: 'API Server',
    port: 5001,
    path: 'apps/api-server',
    command: 'npm',
    args: ['run', 'dev'],
    color: 'green'
  },
  'admin-dashboard': {
    name: 'Admin Dashboard', 
    port: 3002,
    path: 'apps/admin-dashboard',
    command: 'npm',
    args: ['start'],
    color: 'blue'
  },
  'client-app': {
    name: 'Client App',
    port: 3000, 
    path: 'apps/client-app',
    command: 'npm',
    args: ['start'],
    color: 'cyan'
  },
  'partner-portal': {
    name: 'Partner Portal',
    port: 3003,
    path: 'apps/partner-portal', 
    command: 'npm',
    args: ['start'],
    color: 'magenta'
  }
};

function startApp(appKey, config) {
  const { name, path: appPath, command, args, color, port } = config;
  
  console.log(chalk[color](`🚀 Starting ${name} on port ${port}...`));
  
  const child = spawn(command, args, {
    cwd: path.resolve(process.cwd(), appPath),
    stdio: 'pipe',
    shell: true
  });

  child.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      console.log(chalk[color](`[${name}] ${message}`));
    }
  });

  child.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      console.log(chalk.red(`[${name}] ERROR: ${message}`));
    }
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`[${name}] Process exited with code ${code}`));
    }
  });

  return child;
}

function main() {
  console.log(chalk.bold.yellow('🏨 CheckInn Development Server\n'));
  
  const processes = [];
  
  // Start all applications
  Object.entries(APPS).forEach(([key, config]) => {
    const process = startApp(key, config);
    processes.push(process);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n⏹️  Shutting down all services...'));
    
    processes.forEach(child => {
      child.kill('SIGTERM');
    });
    
    setTimeout(() => {
      console.log(chalk.green('✅ All services stopped'));
      process.exit(0);
    }, 2000);
  });

  // Keep process alive
  process.stdin.resume();
}

if (require.main === module) {
  main();
}