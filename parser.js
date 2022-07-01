const moment = require('moment');

const TYPE = 'parser-type';
const ROWS_TO_CHECK = 15;
const MONTHS = {
  'январь': '01',
  'февраль': '02',
  'март': '03',
  'апрель': '04',
  'май': '05',
  'июнь': '06',
  'июль': '07',
  'август': '08',
  'сентябрь': '09',
  'октябрь': '10',
  'ноябрь': '11',
  'декабрь': '12',
};

/**
 * @param {Array<Array>} _data - file data
 * @return {{data: Array<Object>, type: string}}
 * @throws
 */
const parser = (_data) => {
  if (!Array.isArray(_data[0]) || !_data[0].length) {
    throw new Error('Data must be an array of file values');
  }

  let data = _data[0].slice();
  let isErkafarm = false;

  for (let i = 0; i < ROWS_TO_CHECK; i++) {
    isErkafarm = isErkafarm || data[i].some((row) => row.toLowerCase() === 'код тт');
  }

  if (!isErkafarm) {
    throw new Error('Data is not valid');
  }

  data = data.filter((item) => {
    if (typeof item[0] === 'string') {
      return !item[0].toLowerCase().includes('итог');
    } else {
      return true;
    }
  });

  const result = [];
  const date = moment.utc(data[0][0].split(' ')[5] + '-' + MONTHS[data[0][0].split(' ')[4].toLowerCase()] + '-01')
    .toISOString();

  for (let row = 0; row < data.length; row++) {
    if (row >= 9) {
      for (let column = 0; column < data[2].length; column++) {
        if (column >= 8) {
          const obj = {
            title: data[row][1],
            client: data[3][column],
            inn: data[4][column],
            region: data[5][column],
            code: data[6][column],
            date: date,
            tranType: 'purchase',
            selfReseller: 'ООО "ЭРКАФАРМ Северо-Запад"',
            clientType: 'pharmacy',
          };

          obj['quantity'] = parseInt(data[row][column]) || 0;

          result.push(obj);
        }
      }
    }
  }

  return {
    type: TYPE,
    data: result.filter((row) => !!row.quantity),
  };
};

module.exports = parser;
