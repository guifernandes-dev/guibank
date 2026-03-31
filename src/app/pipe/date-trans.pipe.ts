import { Pipe, PipeTransform, Signal } from '@angular/core';
import { DateFormats } from '../constants/front.enum';
import { Language } from '../core/models/services.model';

@Pipe({
  name: 'dateTrans',
  pure: false
})
export class DateTransPipe implements PipeTransform {
  transform(value: Date, lang: Signal<Language>, format: DateFormats): string {
    const {culture} = lang();
    const dataAtual = new Date();
    let objDate: Intl.DateTimeFormatOptions;
    let dataOp: string;
    switch (format) {
      case DateFormats.RESUME_TRANS:
        dataOp = value.toLocaleDateString();        
        objDate = (dataOp === dataAtual.toLocaleDateString(culture)
          ? { hour: "2-digit", minute: "2-digit" }
          : { day: '2-digit', month: 'long' })
        return value.toLocaleString(culture, objDate);
      case DateFormats.DOCS_LIST:
        return value.toLocaleString(culture, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });;;
      case DateFormats.DOCS_CARD:
        return value.toLocaleString(culture, {
          day: "2-digit",
          month: "2-digit"
        });;
      case DateFormats.TRANS_LIST:
        return value.toLocaleTimeString(culture, {
          hour: "2-digit",
          minute: "2-digit"
        });;
      case DateFormats.HEAD_TRANS_LIST:
        dataOp = value.toLocaleDateString(culture);
        objDate = dataAtual.getFullYear() === value.getFullYear()
          ? {day: "2-digit",month: "long"}
          : {day: "2-digit",month: "long", year: "numeric"}
        return dataOp === dataAtual.toLocaleDateString()
          ? 'Hoje'
          : value.toLocaleDateString(culture, objDate);;
      case DateFormats.LOAN_LIST:
        return value.toLocaleString(culture, {
          day: 'numeric',
          month: 'numeric',
          year: '2-digit'
        })
      default:
        return 'error';
    }
  }
}
