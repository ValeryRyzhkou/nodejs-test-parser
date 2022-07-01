const assert = require('assert');
const mock = require('mock-require');

describe(__filename, function() {
  afterEach(() => mock.stopAll());

  describe('Negative cases', function() {
    it('should throw error for wrong input data', async function() {
      mock('fs-extra', {
        readFile: () => Promise.resolve(new Buffer(''))
      });

      const index = mock.reRequire('./index');

      try {
        await index();

        assert.fail('Expected Error');
      } catch (error) {
        assert.strictEqual(error.message, 'input must be buffer or string');
      }
    });
  });

  describe.skip('Positive cases', function() {
    it('should return valid data', async function() {
      const index = mock.reRequire('./index');

      const result = await index();

      assert.strictEqual(result.type, 'parser-type');
      assert.strictEqual(result.data.length, 925);
      assert.deepStrictEqual(result.data.slice(0, 3), [
        {
          title: 'Голдлайн плюс капс.10мг+158,5мг №60',
          client: 'ЭРКАФАРМ',
          inn: '7701047916',
          region: 'Москва г',
          code: 'Москва Рязанский пр-т 45',
          date: '2022-01-01T00:00:00.000Z',
          tranType: 'purchase',
          selfReseller: 'ООО "ЭРКАФАРМ Северо-Запад"',
          clientType: 'pharmacy',
          quantity: 1,
        },
        {
          title: 'Голдлайн плюс капс.10мг+158,5мг №60',
          client: 'Ленмедснаб - Доктор',
          inn: '2341011768',
          region: 'Краснодарский край',
          code: 'Лабинск Халтурина 9а',
          date: '2022-01-01T00:00:00.000Z',
          tranType: 'purchase',
          selfReseller: 'ООО "ЭРКАФАРМ Северо-Запад"',
          clientType: 'pharmacy',
          quantity: 1,
        },
        {
          title: 'Голдлайн плюс капс.10мг+158,5мг №60',
          client: 'ФАРМВОЛГА',
          inn: '6451128364',
          region: 'Саратовская обл',
          code: 'Хвалынск К.С.Петрова-Водкина 5а',
          date: '2022-01-01T00:00:00.000Z',
          tranType: 'purchase',
          selfReseller: 'ООО "ЭРКАФАРМ Северо-Запад"',
          clientType: 'pharmacy',
          quantity: 1,
        },
      ]);
    });
  });
});
