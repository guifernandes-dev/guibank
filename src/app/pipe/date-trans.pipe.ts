import { Pipe, PipeTransform } from '@angular/core';
import { DateFormats } from '../constants/pages.enum';

@Pipe({
  name: 'dateTrans'
})
export class DateTransPipe implements PipeTransform {
  private readonly LOCALE = "pt-BR";

  transform(value: Date, format: DateFormats): string {
    const dataAtual = new Date();
    let objDate: Intl.DateTimeFormatOptions;
    switch (format) {
      case DateFormats.RESUME_TRANS:
        const dataOp = value.toLocaleDateString();
        objDate = (dataOp === dataAtual.toLocaleDateString()
          ? { hour: "2-digit", minute: "2-digit" }
          : { day: '2-digit', month: 'long' })
        return value.toLocaleString(this.LOCALE, objDate);
      case DateFormats.DOCS_LIST:
        return value.toLocaleString(this.LOCALE, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });;;
      case DateFormats.DOCS_CARD:
        return value.toLocaleString(this.LOCALE, {
          day: "2-digit",
          month: "2-digit"
        });;
      case DateFormats.TRANS_LIST:
        return value.toLocaleTimeString(this.LOCALE, {
          hour: "2-digit",
          minute: "2-digit"
        });;
      case DateFormats.HEAD_TRANS_LIST:
        objDate = dataAtual.getFullYear() === value.getFullYear()
          ? {day: "2-digit",month: "long"}
          : {day: "2-digit",month: "long", year: "numeric"}
        return value.toLocaleDateString(this.LOCALE, objDate);;
      default:
        return 'error';
    }
  }
}
