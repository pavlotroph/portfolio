import type { BlockType, CollectionBlockDB, RenderableBlockType } from './collectionBlocks';

export interface CollectionBlockTemplate {
  type: RenderableBlockType;
  label: string;
  description: string;
  createContent: () => any;
  summarize: (block: Pick<CollectionBlockDB, 'type' | 'content'>) => string;
}

const createStarterContentTextLine = () => ({
  object: 'body',
  style: 'h3',
  text: 'Body copy',
  alignment: 'left',
  size: '',
  link: '',
  inline: false,
});

const createStarterContentTextItem = () => ({
  block: 'text',
  row: '1',
  padding: '14,14,14,14',
  block_items: [createStarterContentTextLine()],
});

const createContentBlock = () => ({
  componentPadding: '0,0,0,0',
  removeWidthRestriction: false,
  items: [createStarterContentTextItem()],
});

export const COLLECTION_BLOCK_TEMPLATES: CollectionBlockTemplate[] = [
  {
    type: 'CONTENT',
    label: 'Content',
    description: 'Flexible text, media, or YouTube layout block.',
    createContent: createContentBlock,
    summarize: (block) => {
      const items = Array.isArray(block.content?.items) ? block.content.items.length : 0;
      return `${items} inner item${items === 1 ? '' : 's'}`;
    },
  },
  {
    type: 'IMAGE_SLIDER',
    label: 'Image Slider',
    description: 'Full-width slider with modal-ready image items.',
    createContent: () => ({
      aspectRatio: '2 / 1',
      items: [
        {
          src: '',
          title: '',
          description: '',
        },
      ],
    }),
    summarize: (block) => {
      const items = Array.isArray(block.content?.items) ? block.content.items.length : 0;
      return `${items} slide${items === 1 ? '' : 's'}`;
    },
  },
  {
    type: 'IMAGE_GALLERY',
    label: 'Image Gallery',
    description: 'Grid gallery with optional row grouping and aspect ratios.',
    createContent: () => ({
      aspectRatio: '16 / 9',
      columns: 2,
      rowAspectRatios: {},
      items: [
        {
          src: '',
          title: '',
          description: '',
          row: '1',
        },
      ],
    }),
    summarize: (block) => {
      const items = Array.isArray(block.content?.items) ? block.content.items.length : 0;
      return `${items} media item${items === 1 ? '' : 's'}`;
    },
  },
  {
    type: 'YOUTUBE_PLAYER',
    label: 'YouTube Player',
    description: 'Embedded YouTube video block.',
    createContent: () => ({
      youtubeUrl: '',
      title: 'YouTube video',
    }),
    summarize: (block) => {
      const url = typeof block.content?.youtubeUrl === 'string' ? block.content.youtubeUrl.trim() : '';
      return url || 'No video URL';
    },
  },
  {
    type: 'SPLITTER',
    label: 'Splitter',
    description: 'Decorative page splitter.',
    createContent: () => ({}),
    summarize: () => 'Visual splitter',
  },
  {
    type: 'SPLITTER_SPACE',
    label: 'Spacer',
    description: 'Vertical empty space between sections.',
    createContent: () => ({
      size: '100px',
    }),
    summarize: (block) => {
      const size = typeof block.content?.size === 'string' ? block.content.size.trim() : '';
      return size || '100px';
    },
  },
  {
    type: 'SPLITTER_DEFAULT',
    label: 'Default Rule',
    description: 'Thin horizontal rule separator.',
    createContent: () => ({}),
    summarize: () => 'Horizontal rule',
  },
];

export const getCollectionBlockTemplate = (type: BlockType) =>
  COLLECTION_BLOCK_TEMPLATES.find((template) => template.type === type) ?? null;

export const cloneBlockContent = <T,>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

export const createDraftCollectionBlock = (
  type: RenderableBlockType,
  collectionId: number,
  position: number,
  tempId: number
): CollectionBlockDB => ({
  id: tempId,
  collection_id: collectionId,
  type,
  content: cloneBlockContent(getCollectionBlockTemplate(type)?.createContent() ?? {}),
  description: null,
  position,
});
