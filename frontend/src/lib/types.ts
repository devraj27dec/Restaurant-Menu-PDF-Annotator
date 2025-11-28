

export interface Annotation {
  id: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  groupId: number | null;
  isExtracting: boolean;

  // ADD THESE FIELDS ↓↓↓↓↓
  name?: string;
  price?: string;
  category?: string;
  description?: string;

  // keep type only for classification
  type: "item" | "price" | "description" | "category";
}


export interface Group {
  id: number;
  name: string;
}

export interface MenuData {
  id: string;
  filename: string;
  uploadDate: string;
  status: string;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  price: number | string;
  description?: string;
  category?: string;
  annotationId?: string;
  menuId?: string;
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
  name?: string;
  price?: string;
  description?: string;
  category?: string;
  text?:string;
}