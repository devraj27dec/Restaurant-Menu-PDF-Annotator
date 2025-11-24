

export interface Annotation {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  pageNumber:number;
  groupId: number | null;
  isExtracting:boolean
}

export interface Group {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  description: string;
  category: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}