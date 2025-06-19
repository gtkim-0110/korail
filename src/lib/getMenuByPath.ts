import {Menu} from "@/types/menu";

export async function getMenuByPath (path: string, menus: Menu[]) {
  return menus.find(i=> i.src === path)
}