import { Pages } from "../constants/pages.enum";

export interface MenuItem {
  label: string,
  icon: string,
  page: Pages,
  selected: boolean
}

export interface User {
  conta?: string,
  nome: string,
  email: string,
  senha?: string
}