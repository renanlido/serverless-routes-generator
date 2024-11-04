#!/usr/bin/env node

import { Command } from 'commander';
import importConfigFile from '../src';

const program = new Command();

program
  .name('serverless-routes-generator')
  .description('Simplify route creation for Serverless applications')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate serverless routes')
  .action(() => {
    console.log('Generating serverless routes...');
    importConfigFile();
  });

program.parse(process.argv);

// If no arguments are provided, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}