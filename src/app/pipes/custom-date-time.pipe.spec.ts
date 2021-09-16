import { CustomDateTimePipe } from './custom-date-time.pipe';

describe('CustomDateTimePipe', () => {
  it('create an instance', () => {
    const pipe = new CustomDateTimePipe();
    expect(pipe).toBeTruthy();
  });
});
