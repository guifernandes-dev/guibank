import { Pages } from "../../constants/pages.enum";

export interface MenuItem {
  label: string,
  icon: string,
  page: Pages
}

export interface User {
  conta?: string,
  nome: string,
  email: string,
  renda: number,
  senha?: string
}