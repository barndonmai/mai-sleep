const RealDate = Date;

export function withFixedDate(isoString, callback) {
  const fixedInstant = new RealDate(isoString);

  class MockDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(fixedInstant);
        return;
      }

      super(...args);
    }

    static now() {
      return fixedInstant.getTime();
    }

    static parse(value) {
      return RealDate.parse(value);
    }

    static UTC(...args) {
      return RealDate.UTC(...args);
    }
  }

  globalThis.Date = MockDate;

  try {
    return callback();
  } finally {
    globalThis.Date = RealDate;
  }
}
