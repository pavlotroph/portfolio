export type BlockType =
  | 'IMAGE_SLIDER'
  | 'IMAGE_SCROLLER'
  | 'IMAGE_DOUBLE'
  | 'IMAGE_GALLERY'
  | 'IMAGE_TRIPLE'
  | 'IMAGE_QUADRUPLE'
  | 'IMAGE_QUINTUPLE'
  | 'SQUARE'
  | 'TEXT_TITLE'
  | 'YOUTUBE_PLAYER'
  | 'SPLITTER'
  | 'SPLITTER_SPACE'
  | 'SPLITTER_DEFAULT'
  | 'CONTENT';

export interface CollectionBlockDB {
  id: number;
  collection_id: number;
  type: BlockType;
  content: any;
  description: string | null;
  position: number;
}

export interface CollectionData {
  id: number;
  folder: string;
  blocks: CollectionBlockDB[];
  main?: {
    label: string;
    text: string;
    tag?: 'h1' | 'h2' | 'h3';
  }[];
  work_title?: string;
}

export const RENDERABLE_BLOCK_TYPES = [
  'CONTENT',
  'IMAGE_SLIDER',
  'IMAGE_SCROLLER',
  'IMAGE_GALLERY',
  'YOUTUBE_PLAYER',
  'SPLITTER',
  'SPLITTER_SPACE',
  'SPLITTER_DEFAULT',
] as const satisfies readonly BlockType[];

export type RenderableBlockType = (typeof RENDERABLE_BLOCK_TYPES)[number];

export const isRenderableBlockType = (value: string): value is RenderableBlockType =>
  RENDERABLE_BLOCK_TYPES.includes(value as RenderableBlockType);
