export type StandardMapping = {
  date?: string;
  amount?: string;
  description?: string;
  categoryName?: string;
  tagName?: string;
  memberName?: string;
};

export type WideFormatMapping = {
  date?: string;
  description?: string;
  memberName?: string;
  tagName?: string;
  categoryColumns: string[];
  categoryMapping: Record<string, string>;
};

export type Mapping = StandardMapping | WideFormatMapping;
