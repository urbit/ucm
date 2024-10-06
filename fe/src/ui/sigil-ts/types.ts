export type Attributes = {
  style?: {
    [key: string]: string;
  };
  version?: string;
  class?: string;
  width?: string;
  height?: string;
  viewBox?: string;
  fill?: string;
  xmlns?: string;
  id?: string;
  'clip-path'?: string;
  d?: string;
  stroke?: string;
  'stroke-width'?: string;
  x1?: string;
  x2?: string;
  y2?: string;
  'stroke-linecap'?: string;
  cx?: string;
  cy?: string;
  r?: string;
  x?: string;
  y?: string;
  transform?: string;
  'vector-effect'?: string;
  dataisgeon?: string;
};

export type Ast = {
  name: string;
  type: string;
  value: string;
  attributes: Attributes;
  children: Ast[];
};

export type Config = {
  patp: string;
  colors?: [string, string];
  attributes?: Attributes;
  style?: {
    [key: string]: string;
  };
  class?: string;
  size?: number;
  width?: number;
  height?: number;
  margin?: boolean;
  strokeScalingFunction?: Function;
  renderer?: Function;
  icon?: boolean;
};
