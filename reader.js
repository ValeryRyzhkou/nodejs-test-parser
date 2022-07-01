const XLSX = require('xlsx');
const BPromise = require('bluebird');
const csv = require('fast-csv');
const moment = require('moment');

const DELIMITER = '|';
const ROW_RESTRICTION = 100;
const isTestEnv = process.env.NODE_ENV === 'test';
const DATE_FORMATS = [
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DD'
];
const TIME_FORMATS = [
  'H:mm:ss',
  'H:mm'
];

/**
 * @param {Array} textCSV
 * @return {Array}
 */
const deleteEmptyCells = (textCSV) => {
  return textCSV.map((item) => item.replace(/\|{2,}(\n|$)/g, '\n'));
};

/**
 * @param {Object} value raw value from report
 * @param {Object} formattedText formatted text from report
 * @return {string}
 */
const dateDetect = (value, formattedText) => {
  const dateOffSet = moment(value).utcOffset(0, true).format('YYYY-MM-DD');
  const dateTZ = moment.utc(value, 'YYYY-MM-DDTHH:mm:ss[Z]').format('YYYY-MM-DD');
  let correctDate;

  if (dateOffSet > dateTZ || dateOffSet === dateTZ) {
    correctDate = moment(value).utcOffset(0, true);
  } else {
    correctDate = dateTZ;
  }

  if (moment.utc(formattedText, TIME_FORMATS, true).isValid()) {
    return moment.utc(formattedText, 'H:mm:ss').format('HH:mm:ss');
  }

  if (moment.utc(correctDate, DATE_FORMATS, true).isValid()) {
    return moment.utc(correctDate).format('YYYY-MM-DDTHH:mm:ss');
  }

  return correctDate;
};

/**
 * @param {{}} data
 * @return {{}}
 */
const updateFormat = (data) => {
  Object.keys(data).forEach(function(key) {
    const numberRegexp = /E\+[\d]/;
    // https://stackoverflow.com/a/5717133
    const urlRegexp = new RegExp('(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?', 'i'); // fragment locator

    if ((data[key].w) && (numberRegexp.test(data[key].w))) {
      delete data[key].w;
      data[key].z = '0';
    } else if ((data[key].f) && (urlRegexp.test(data[key].f))) {
      data[key].w = data[key].f.match(urlRegexp)[0];
      data[key].v = data[key].f.match(urlRegexp)[0];
    } else if ((data[key].l) && (data[key].l.Target) && (urlRegexp.test(data[key].l.Target))) {
      data[key].w = data[key].l.Target.match(urlRegexp)[0];
      data[key].v = data[key].l.Target.match(urlRegexp)[0];
    }

    if (data[key].w && data[key].v && typeof data[key].v === 'object') {
      data[key].w = dateDetect(data[key].v, data[key].w);
      data[key].v = data[key].w;
    }

    if (data[key].t === 'n' && data[key].v) {
      data[key].w = data[key].v;
    }
  });

  return data;
};

/**
 * @param {Buffer} buffer to convert
 * @return {Array}
 */
const bufferToString = (buffer) => {
  const textCSV = [];
  let sheetRows = 0;

  if (isTestEnv) {
    sheetRows = ROW_RESTRICTION;
  }

  const workbook = XLSX.read(buffer, {
    sheetRows: sheetRows,
    cellDates: true,
  });

  workbook.SheetNames.forEach(function(sheetName) {
    textCSV.push(XLSX.utils.sheet_to_csv(updateFormat(workbook.Sheets[sheetName]), {
      FS: DELIMITER,
      blankrows: false,
      dateNF: 'dd"."mm"."yyyy" "HH":"mm":"ss',
    }));
  });

  return deleteEmptyCells(textCSV);
};

/**
 * @param {Buffer} input to convert
 * @return {Promise<{data: Array}>}
 * @throws
 */
const read = async (input) => {
  if (!input || (!(input instanceof Buffer) && typeof input !== 'string') || !input.length) {
    throw new Error('input must be buffer or string');
  }

  const promisArray = [];
  const csvString = bufferToString(input);

  const parsOneStr = async (csvStr) => {
    return new BPromise((resolve, reject) => {
      const dataPromise = [];

      csv
        .parseString(csvStr, {delimiter: DELIMITER})
        .on('error', (error) => {
          reject(error);
        })
        .on('data', (row) => {
          dataPromise.push(row);
        })
        .on('end', () => {
          resolve(dataPromise);
        });
    });
  };

  csvString.forEach((csvStr) => {
    promisArray.push(parsOneStr(csvStr));
  });

  return {
    data: await Promise.all(promisArray),
  };
};

module.exports = read;
