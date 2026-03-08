import { Installment } from "../../../server/models/db.model";
import { Pages } from "../../constants/front.enum";

export interface MenuItem {
  label: string,
  icon: string,
  page: Pages
}

export interface User {
  conta: string,
  nome: string,
  email: string,
  renda: number,
  senha?: string
}

export type KeyType = 'pay' | 'edit' | 'delete';

export interface OptionChangeDocs {
  type: KeyType,
  mensagem: string
}

export interface InstallmentCard extends Installment {
  loanId: string,
  title: string,
  subtitle: string
}