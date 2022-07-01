const fs = require('fs-extra');

const parser = require('./parser');
const reader = require('./reader');

const parseFile = async () => {
  const buffer = await fs.readFile('./file-to-parse.xlsx');
  const fileData = await reader(buffer);

  return parser(fileData.data);
};

module.exports = parseFile;
