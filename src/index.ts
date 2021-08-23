#!/usr/bin/env node

import yaml from 'js-yaml';
import * as changeCase from 'change-case';
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import mkdirp from 'mkdirp';
import 'colors';

async function main() {
  const args = yargs(process.argv);

  const entityName = args.argv._[2];
  const instanceName = String(args.argv._[3]);

  console.log(
    `Creating a ${`${entityName}`.cyan} named ${`${instanceName.cyan}`}`
  );

  try {
    const doc = yaml.load(fs.readFileSync('./.spawn.yml', 'utf8')) as any;
    const entityInfo = doc.entities[entityName];
    for (const filenameTemplateOrFileInfo of entityInfo.files) {
      let filename: string;
      let templateFilename: string | undefined;

      if (typeof filenameTemplateOrFileInfo === 'string') {
        filename = filenameTemplateOrFileInfo;
      } else {
        filename = Object.keys(filenameTemplateOrFileInfo)[0];
        templateFilename = filenameTemplateOrFileInfo.template;
      }

      filename = filename.replace(/%name%/g, instanceName);

      const fullFilepath = `${entityInfo.path}/${filename}`;

      console.log(` - ${fullFilepath.white}`);

      mkdirp.sync(path.dirname(fullFilepath));

      let contents = '';

      if (templateFilename) {
        contents = fs
          .readFileSync(`./.spawn/${entityName}/${templateFilename}`)
          .toString();
        contents = contents
          .split('\n')
          .map(line => {
            return line.replace(/%.*?%/g, substring => {
              const helperUtilMatch = substring.match(
                /^%(?<helperName>.*?)\(name\)%$/
              );

              let result: string;
              if (helperUtilMatch?.groups) {
                const helperName = helperUtilMatch.groups.helperName;
                result = (changeCase as any)[helperName](instanceName);
              } else {
                result = instanceName;
              }

              return result;
            });
          })
          .join('\n');
      }

      fs.writeFileSync(fullFilepath, contents);
    }
  } catch (e) {
    console.log(e);
  }
}

main();
