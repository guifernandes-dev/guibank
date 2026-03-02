import { DateTransPipe } from './date-trans.pipe';

describe('DataPipe', () => {
  it('create an instance', () => {
    const pipe = new DateTransPipe();
    expect(pipe).toBeTruthy();
  });
});
