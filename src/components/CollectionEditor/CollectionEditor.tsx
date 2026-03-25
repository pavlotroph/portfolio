import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  COLLECTION_BLOCK_TEMPLATES,
  cloneBlockContent,
  getCollectionBlockTemplate,
} from '../CollectionComponent/collectionBlockRegistry';
import type {
  CollectionBlockDB,
  RenderableBlockType,
} from '../CollectionComponent/collectionBlocks';

interface CollectionEditorProps {
  blocks: CollectionBlockDB[];
  selectedBlockId: number | null;
  isPreviewMode: boolean;
  isPublishing: boolean;
  hasUnsavedChanges: boolean;
  publishMessage: string | null;
  publishError: string | null;
  insertMode: boolean;
  pendingInsertType: RenderableBlockType;
  onSelectBlock: (blockId: number) => void;
  onChangeBlock: (nextBlock: CollectionBlockDB) => void;
  onDuplicateBlock: (blockId: number) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onSetPendingInsertType: (type: RenderableBlockType) => void;
  onCreateBlock: () => void;
  onCancelInsert: () => void;
  onTogglePreview: () => void;
  onExitEditMode: () => void;
  onPublish: () => void;
}

const editHeadingBase = css`
  margin: 0;
  font-family: var(--second-family);
  font-style: normal;
  color: inherit;
`;

const EH1 = styled.h1`
  ${editHeadingBase}
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const EH2 = styled.h2`
  ${editHeadingBase}
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const EH3 = styled.h3`
  ${editHeadingBase}
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const EH4 = styled.h4`
  ${editHeadingBase}
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const EH5 = styled.h5`
  ${editHeadingBase}
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.03em;
  text-transform: none;
`;

const EH6 = styled.h6`
  ${editHeadingBase}
  font-size: 11px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const EditorShell = styled.aside`
  position: fixed;
  top: 96px;
  right: 18px;
  bottom: 18px;
  width: min(380px, calc(100vw - 36px));
  display: flex;
  flex-direction: column;
  background: rgba(5, 5, 5, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  color: #fff;
  font-family: var(--second-family);
  z-index: 60;

  * {
    font-family: inherit;
  }

  @media (max-width: 900px) {
    top: auto;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 78vh;
  }
`;

const EditorHeader = styled.div`
  padding: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EditorTitle = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
`;

const EditorHint = styled(EH5)`
  color: rgba(255, 255, 255, 0.72);
`;

const EditorModeLabel = styled(EH6)`
  color: rgba(255, 255, 255, 0.62);
`;

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const ToolbarButton = styled.button<{ $accent?: boolean; $danger?: boolean }>`
  border: 1px solid
    ${({ $accent, $danger }) =>
      $danger
        ? 'rgba(255, 122, 122, 0.35)'
        : $accent
          ? 'rgba(255,255,255,0.4)'
          : 'rgba(255,255,255,0.14)'};
  background: ${({ $accent, $danger }) =>
    $danger
      ? 'rgba(113, 24, 24, 0.4)'
      : $accent
        ? 'rgba(255,255,255,0.14)'
        : 'rgba(255,255,255,0.04)'};
  color: #fff;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusPill = styled.span<{ $tone?: 'warn' | 'ok' }>`
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ok' ? 'rgba(113, 255, 182, 0.3)' : 'rgba(255,255,255,0.18)'};
  background: ${({ $tone }) =>
    $tone === 'ok' ? 'rgba(35, 113, 71, 0.32)' : 'rgba(255,255,255,0.06)'};
  font-size: 11px;
  font-family: inherit;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const HeaderError = styled(EH6)`
  color: #ff9b9b;
  letter-spacing: 0.04em;
  text-transform: none;
`;

const EditorBody = styled.div`
  flex: 1 1 auto;
  overflow: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled(EH3)`
  color: rgba(255, 255, 255, 0.64);
`;

const BlockList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BlockListButton = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid
    ${({ $selected }) => ($selected ? 'rgba(255,255,255,0.44)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $selected }) => ($selected ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)')};
  color: #fff;
  font-family: inherit;
  cursor: pointer;
`;

const BlockItemTitle = styled(EH4)`
  text-align: left;
`;

const BlockItemSummary = styled(EH6)`
  color: rgba(255, 255, 255, 0.58);
  letter-spacing: 0.03em;
  text-transform: none;
`;

const SelectedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const SelectedType = styled(EH6)`
  color: rgba(255, 255, 255, 0.62);
`;

const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SecondaryButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
`;

const TextInput = styled.input`
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
`;

const SelectInput = styled.select`
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(17, 17, 17, 0.96);
  color: #fff;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
`;

const CheckboxRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
`;

const ArrayList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ArrayItemCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ArrayItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.58);
`;

const ArrayActions = styled.div`
  display: flex;
  gap: 8px;
`;

const InlineMessage = styled(EH5)`
  color: rgba(255, 255, 255, 0.64);
`;

const RawJsonApply = styled.button`
  align-self: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
`;

const resolveBlockLabel = (block: CollectionBlockDB) =>
  getCollectionBlockTemplate(block.type)?.label ?? block.type;

const resolveBlockSummary = (block: CollectionBlockDB) =>
  getCollectionBlockTemplate(block.type)?.summarize(block) ?? 'Custom block';

const ensureItems = (value: any) => (Array.isArray(value) ? value : []);

const createContentTextLine = (object: 'heading' | 'body' = 'body') => ({
  object,
  style: object === 'heading' ? 'h4' : 'h3',
  text: object === 'heading' ? 'Heading' : 'Body copy',
  alignment: 'left',
  size: '',
  link: '',
  inline: false,
});

const createContentItem = (kind: 'text' | 'media' | 'youtube' | 'empty') => {
  if (kind === 'text') {
    return {
      block: 'text',
      row: '1',
      padding: '14,14,14,14',
      block_items: [createContentTextLine('body')],
    };
  }

  if (kind === 'media') {
    return {
      block: 'media',
      row: '1',
      padding: '0,0,0,0',
      aspectRatio: '16 / 9',
      items: [
        {
          media: '',
          title: '',
          description: '',
          modal: 'no',
        },
      ],
    };
  }

  if (kind === 'youtube') {
    return {
      block: 'youtube',
      row: '1',
      padding: '0,0,0,0',
      aspectRatio: '16 / 9',
      title: 'YouTube video',
      youtubeUrl: '',
    };
  }

  return {
    block: 'empty',
    row: '1',
    padding: '0,0,0,0',
  };
};

const resolveContentItemAspectRatio = (item: any) => {
  if (typeof item?.aspectRatio === 'string') return item.aspectRatio;
  if (typeof item?.['aspect-ratio'] === 'string') return item['aspect-ratio'];
  if (typeof item?.aspect_ratio === 'string') return item.aspect_ratio;
  return '';
};

const setContentItemAspectRatio = (draftItem: any, value: string) => {
  draftItem.aspectRatio = value;
  delete draftItem['aspect-ratio'];
  delete draftItem.aspect_ratio;
};

const CollectionEditor: React.FC<CollectionEditorProps> = ({
  blocks,
  selectedBlockId,
  isPreviewMode,
  isPublishing,
  hasUnsavedChanges,
  publishMessage,
  publishError,
  insertMode,
  pendingInsertType,
  onSelectBlock,
  onChangeBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveBlock,
  onSetPendingInsertType,
  onCreateBlock,
  onCancelInsert,
  onTogglePreview,
  onExitEditMode,
  onPublish,
}) => {
  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );
  const [rawJson, setRawJson] = useState('');
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBlock) {
      setRawJson('');
      setRawJsonError(null);
      return;
    }

    setRawJson(JSON.stringify(selectedBlock.content ?? {}, null, 2));
    setRawJsonError(null);
  }, [selectedBlock]);

  const updateSelectedBlock = (mutate: (draft: CollectionBlockDB) => void) => {
    if (!selectedBlock) return;

    const nextBlock: CollectionBlockDB = {
      ...selectedBlock,
      content: cloneBlockContent(selectedBlock.content ?? {}),
    };
    mutate(nextBlock);
    onChangeBlock(nextBlock);
  };

  const updateImageItems = (
    makeItem: () => Record<string, any>,
    fields: Array<{ key: string; label: string; multiline?: boolean }>
  ) => {
    if (!selectedBlock) return null;
    const items = ensureItems(selectedBlock.content?.items);

    return (
      <ArrayList>
        {items.map((item, index) => (
          <ArrayItemCard key={`${selectedBlock.id}-item-${index}`}>
            <ArrayItemHeader>
              <span>Item {index + 1}</span>
              <ArrayActions>
                <SecondaryButton
                  type="button"
                  onClick={() =>
                    updateSelectedBlock((draft) => {
                      const nextItems = ensureItems(draft.content?.items).filter((_: any, itemIndex: number) => itemIndex !== index);
                      draft.content = { ...(draft.content ?? {}), items: nextItems };
                    })
                  }
                >
                  Remove
                </SecondaryButton>
              </ArrayActions>
            </ArrayItemHeader>
            <FieldGrid>
              {fields.map((field) => (
                <Field key={`${selectedBlock.id}-${field.key}-${index}`} style={field.multiline ? { gridColumn: '1 / -1' } : undefined}>
                  <span>{field.label}</span>
                  {field.multiline ? (
                    <TextArea
                      value={typeof item?.[field.key] === 'string' ? item[field.key] : ''}
                      onChange={(event) =>
                        updateSelectedBlock((draft) => {
                          const nextItems = cloneBlockContent(ensureItems(draft.content?.items));
                          nextItems[index] = {
                            ...(nextItems[index] ?? makeItem()),
                            [field.key]: event.target.value,
                          };
                          draft.content = { ...(draft.content ?? {}), items: nextItems };
                        })
                      }
                    />
                  ) : (
                    <TextInput
                      value={typeof item?.[field.key] === 'string' ? item[field.key] : ''}
                      onChange={(event) =>
                        updateSelectedBlock((draft) => {
                          const nextItems = cloneBlockContent(ensureItems(draft.content?.items));
                          nextItems[index] = {
                            ...(nextItems[index] ?? makeItem()),
                            [field.key]: event.target.value,
                          };
                          draft.content = { ...(draft.content ?? {}), items: nextItems };
                        })
                      }
                    />
                  )}
                </Field>
              ))}
            </FieldGrid>
          </ArrayItemCard>
        ))}
        <SecondaryButton
          type="button"
          onClick={() =>
            updateSelectedBlock((draft) => {
              const nextItems = cloneBlockContent(ensureItems(draft.content?.items));
              nextItems.push(makeItem());
              draft.content = { ...(draft.content ?? {}), items: nextItems };
            })
          }
        >
          Add Item
        </SecondaryButton>
      </ArrayList>
    );
  };

  const renderContentItemsEditor = () => {
    if (!selectedBlock || selectedBlock.type !== 'CONTENT') return null;

    const contentItems = ensureItems(selectedBlock.content?.items);

    const updateContentItems = (mutate: (items: any[]) => void) => {
      updateSelectedBlock((draft) => {
        const nextItems = cloneBlockContent(ensureItems(draft.content?.items));
        mutate(nextItems);
        draft.content = { ...(draft.content ?? {}), items: nextItems };
      });
    };

    return (
      <ArrayList>
        {contentItems.map((item, index) => {
          const rawKind = typeof item?.block === 'string' ? item.block.toLowerCase().trim() : 'empty';
          const kind =
            rawKind === 'text' || rawKind === 'media' || rawKind === 'youtube' || rawKind === 'empty'
              ? rawKind
              : rawKind === 'youtube_player'
                ? 'youtube'
                : 'empty';

          const setContentItem = (mutate: (draftItem: any) => void) => {
            updateContentItems((nextItems) => {
              const nextItem = cloneBlockContent(nextItems[index] ?? createContentItem(kind as 'text' | 'media' | 'youtube' | 'empty'));
              mutate(nextItem);
              nextItems[index] = nextItem;
            });
          };

          return (
            <ArrayItemCard key={`${selectedBlock.id}-content-item-${index}`}>
              <ArrayItemHeader>
                <span>Content Item {index + 1}</span>
                <ArrayActions>
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      updateContentItems((nextItems) => {
                        if (index <= 0) return;
                        const reorderedItems = [...nextItems];
                        const [movedItem] = reorderedItems.splice(index, 1);
                        reorderedItems.splice(index - 1, 0, movedItem);
                        nextItems.splice(0, nextItems.length, ...reorderedItems);
                      })
                    }
                    disabled={index <= 0}
                  >
                    ↑
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      updateContentItems((nextItems) => {
                        if (index >= nextItems.length - 1) return;
                        const reorderedItems = [...nextItems];
                        const [movedItem] = reorderedItems.splice(index, 1);
                        reorderedItems.splice(index + 1, 0, movedItem);
                        nextItems.splice(0, nextItems.length, ...reorderedItems);
                      })
                    }
                    disabled={index >= contentItems.length - 1}
                  >
                    ↓
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      updateContentItems((nextItems) => {
                        const duplicateItem = cloneBlockContent(
                          nextItems[index] ?? createContentItem(kind as 'text' | 'media' | 'youtube' | 'empty')
                        );
                        nextItems.splice(index + 1, 0, duplicateItem);
                      })
                    }
                  >
                    ⧉
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      updateContentItems((nextItems) => {
                        nextItems.splice(index, 1);
                      })
                    }
                  >
                    🗑
                  </SecondaryButton>
                </ArrayActions>
              </ArrayItemHeader>

              <FieldGrid>
                <Field>
                  <span>Kind</span>
                  <SelectInput
                    value={kind}
                    onChange={(event) =>
                      updateContentItems((nextItems) => {
                        const nextItem = createContentItem(
                          event.target.value as 'text' | 'media' | 'youtube' | 'empty'
                        );
                        nextItem.row = typeof item?.row === 'string' ? item.row : '1';
                        nextItems[index] = nextItem;
                      })
                    }
                  >
                    <option value="text">Text</option>
                    <option value="media">Media</option>
                    <option value="youtube">YouTube</option>
                    <option value="empty">Empty</option>
                  </SelectInput>
                </Field>
                <Field>
                  <span>Row</span>
                  <TextInput
                    value={typeof item?.row === 'string' ? item.row : '1'}
                    onChange={(event) =>
                      setContentItem((draftItem) => {
                        draftItem.row = event.target.value;
                      })
                    }
                  />
                </Field>
                <Field>
                  <span>Padding</span>
                  <TextInput
                    value={typeof item?.padding === 'string' ? item.padding : ''}
                    onChange={(event) =>
                      setContentItem((draftItem) => {
                        draftItem.padding = event.target.value;
                      })
                    }
                  />
                </Field>
                {(kind === 'text' || kind === 'media' || kind === 'youtube') ? (
                  <Field style={{ gridColumn: '1 / -1' }}>
                    <span>Aspect Ratio</span>
                    <TextInput
                      value={resolveContentItemAspectRatio(item)}
                      onChange={(event) =>
                        setContentItem((draftItem) => {
                          setContentItemAspectRatio(draftItem, event.target.value);
                        })
                      }
                    />
                  </Field>
                ) : null}
              </FieldGrid>

              {kind === 'text' ? (
                <ArrayList>
                  {ensureItems(item?.block_items).map((line, lineIndex) => (
                    <ArrayItemCard key={`${selectedBlock.id}-content-line-${index}-${lineIndex}`}>
                      <ArrayItemHeader>
                        <span>Text Line {lineIndex + 1}</span>
                        <ArrayActions>
                          <SecondaryButton
                            type="button"
                            onClick={() =>
                              setContentItem((draftItem) => {
                                const nextLines = ensureItems(draftItem.block_items).filter(
                                  (_: any, currentLineIndex: number) => currentLineIndex !== lineIndex
                                );
                                draftItem.block_items = nextLines;
                              })
                            }
                          >
                            Remove
                          </SecondaryButton>
                        </ArrayActions>
                      </ArrayItemHeader>
                      <FieldGrid>
                        <Field>
                          <span>Object</span>
                          <SelectInput
                            value={typeof line?.object === 'string' ? line.object : 'body'}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                                nextLines[lineIndex] = {
                                  ...(nextLines[lineIndex] ?? createContentTextLine()),
                                  object: event.target.value,
                                };
                                draftItem.block_items = nextLines;
                              })
                            }
                          >
                            <option value="heading">Heading</option>
                            <option value="body">Body</option>
                          </SelectInput>
                        </Field>
                        <Field>
                          <span>HTML Tag</span>
                          <TextInput
                            value={typeof line?.style === 'string' ? line.style : ''}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                                nextLines[lineIndex] = {
                                  ...(nextLines[lineIndex] ?? createContentTextLine()),
                                  style: event.target.value,
                                };
                                draftItem.block_items = nextLines;
                              })
                            }
                          />
                        </Field>
                        <Field>
                          <span>Alignment</span>
                          <SelectInput
                            value={typeof line?.alignment === 'string' ? line.alignment : 'left'}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                                nextLines[lineIndex] = {
                                  ...(nextLines[lineIndex] ?? createContentTextLine()),
                                  alignment: event.target.value,
                                };
                                draftItem.block_items = nextLines;
                              })
                            }
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </SelectInput>
                        </Field>
                        <Field>
                          <span>Size</span>
                          <TextInput
                            value={String(line?.size ?? '')}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                                nextLines[lineIndex] = {
                                  ...(nextLines[lineIndex] ?? createContentTextLine()),
                                  size: event.target.value,
                                };
                                draftItem.block_items = nextLines;
                              })
                            }
                          />
                        </Field>
                        <Field style={{ gridColumn: '1 / -1' }}>
                          <span>Text</span>
                          <TextArea
                            value={typeof line?.text === 'string' ? line.text : ''}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                                nextLines[lineIndex] = {
                                  ...(nextLines[lineIndex] ?? createContentTextLine()),
                                  text: event.target.value,
                                };
                                draftItem.block_items = nextLines;
                              })
                            }
                          />
                        </Field>
                        <Field style={{ gridColumn: '1 / -1' }}>
                          <span>Link</span>
                          <TextInput
                            value={typeof line?.link === 'string' ? line.link : ''}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                                nextLines[lineIndex] = {
                                  ...(nextLines[lineIndex] ?? createContentTextLine()),
                                  link: event.target.value,
                                };
                                draftItem.block_items = nextLines;
                              })
                            }
                          />
                        </Field>
                      </FieldGrid>
                      <CheckboxRow>
                        <input
                          type="checkbox"
                          checked={!!line?.inline}
                          onChange={(event) =>
                            setContentItem((draftItem) => {
                              const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                              nextLines[lineIndex] = {
                                ...(nextLines[lineIndex] ?? createContentTextLine()),
                                inline: event.target.checked,
                              };
                              draftItem.block_items = nextLines;
                            })
                          }
                        />
                        Inline text segment
                      </CheckboxRow>
                    </ArrayItemCard>
                  ))}
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      setContentItem((draftItem) => {
                        const nextLines = cloneBlockContent(ensureItems(draftItem.block_items));
                        nextLines.push(createContentTextLine('body'));
                        draftItem.block_items = nextLines;
                      })
                    }
                  >
                    Add Text Line
                  </SecondaryButton>
                </ArrayList>
              ) : null}

              {kind === 'media' ? (
                <ArrayList>
                  {ensureItems(item?.items).map((mediaItem, mediaIndex) => (
                    <ArrayItemCard key={`${selectedBlock.id}-content-media-${index}-${mediaIndex}`}>
                      <ArrayItemHeader>
                        <span>Media Item {mediaIndex + 1}</span>
                        <ArrayActions>
                          <SecondaryButton
                            type="button"
                            onClick={() =>
                              setContentItem((draftItem) => {
                                const nextMediaItems = ensureItems(draftItem.items).filter(
                                  (_: any, currentMediaIndex: number) => currentMediaIndex !== mediaIndex
                                );
                                draftItem.items = nextMediaItems;
                              })
                            }
                          >
                            Remove
                          </SecondaryButton>
                        </ArrayActions>
                      </ArrayItemHeader>
                      <FieldGrid>
                        <Field>
                          <span>Storage File Name</span>
                          <TextInput
                            value={typeof mediaItem?.media === 'string' ? mediaItem.media : ''}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextMediaItems = cloneBlockContent(ensureItems(draftItem.items));
                                nextMediaItems[mediaIndex] = {
                                  ...(nextMediaItems[mediaIndex] ?? { media: '', title: '', description: '', modal: 'no' }),
                                  media: event.target.value,
                                };
                                draftItem.items = nextMediaItems;
                              })
                            }
                          />
                        </Field>
                        <Field>
                          <span>Modal</span>
                          <SelectInput
                            value={typeof mediaItem?.modal === 'string' ? mediaItem.modal : 'no'}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextMediaItems = cloneBlockContent(ensureItems(draftItem.items));
                                nextMediaItems[mediaIndex] = {
                                  ...(nextMediaItems[mediaIndex] ?? { media: '', title: '', description: '', modal: 'no' }),
                                  modal: event.target.value,
                                };
                                draftItem.items = nextMediaItems;
                              })
                            }
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </SelectInput>
                        </Field>
                        <Field>
                          <span>Title</span>
                          <TextInput
                            value={typeof mediaItem?.title === 'string' ? mediaItem.title : ''}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextMediaItems = cloneBlockContent(ensureItems(draftItem.items));
                                nextMediaItems[mediaIndex] = {
                                  ...(nextMediaItems[mediaIndex] ?? { media: '', title: '', description: '', modal: 'no' }),
                                  title: event.target.value,
                                };
                                draftItem.items = nextMediaItems;
                              })
                            }
                          />
                        </Field>
                        <Field style={{ gridColumn: '1 / -1' }}>
                          <span>Description</span>
                          <TextArea
                            value={typeof mediaItem?.description === 'string' ? mediaItem.description : ''}
                            onChange={(event) =>
                              setContentItem((draftItem) => {
                                const nextMediaItems = cloneBlockContent(ensureItems(draftItem.items));
                                nextMediaItems[mediaIndex] = {
                                  ...(nextMediaItems[mediaIndex] ?? { media: '', title: '', description: '', modal: 'no' }),
                                  description: event.target.value,
                                };
                                draftItem.items = nextMediaItems;
                              })
                            }
                          />
                        </Field>
                      </FieldGrid>
                    </ArrayItemCard>
                  ))}
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      setContentItem((draftItem) => {
                        const nextMediaItems = cloneBlockContent(ensureItems(draftItem.items));
                        nextMediaItems.push({ media: '', title: '', description: '', modal: 'no' });
                        draftItem.items = nextMediaItems;
                      })
                    }
                  >
                    Add Media Item
                  </SecondaryButton>
                </ArrayList>
              ) : null}

              {kind === 'youtube' ? (
                <FieldGrid>
                  <Field style={{ gridColumn: '1 / -1' }}>
                    <span>Video Title</span>
                    <TextInput
                      value={typeof item?.title === 'string' ? item.title : ''}
                      onChange={(event) =>
                        setContentItem((draftItem) => {
                          draftItem.title = event.target.value;
                        })
                      }
                    />
                  </Field>
                  <Field style={{ gridColumn: '1 / -1' }}>
                    <span>YouTube URL or ID</span>
                    <TextInput
                      value={typeof item?.youtubeUrl === 'string' ? item.youtubeUrl : ''}
                      onChange={(event) =>
                        setContentItem((draftItem) => {
                          draftItem.youtubeUrl = event.target.value;
                          draftItem.youtubeId = event.target.value;
                        })
                      }
                    />
                  </Field>
                </FieldGrid>
              ) : null}

              {kind === 'empty' ? (
                <InlineMessage>This item intentionally renders as an empty slot inside the `CONTENT` layout.</InlineMessage>
              ) : null}
            </ArrayItemCard>
          );
        })}

        <ActionsRow>
          <SecondaryButton
            type="button"
            onClick={() =>
              updateContentItems((nextItems) => {
                nextItems.push(createContentItem('text'));
              })
            }
          >
            Add Text
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() =>
              updateContentItems((nextItems) => {
                nextItems.push(createContentItem('media'));
              })
            }
          >
            Add Media
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() =>
              updateContentItems((nextItems) => {
                nextItems.push(createContentItem('youtube'));
              })
            }
          >
            Add YouTube
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() =>
              updateContentItems((nextItems) => {
                nextItems.push(createContentItem('empty'));
              })
            }
          >
            Add Empty
          </SecondaryButton>
        </ActionsRow>
      </ArrayList>
    );
  };

  const renderSelectedBlockFields = () => {
    if (!selectedBlock) return null;

    switch (selectedBlock.type) {
      case 'SPLITTER_SPACE':
        return (
          <Field>
            <span>Spacer Size</span>
            <TextInput
              value={typeof selectedBlock.content?.size === 'string' ? selectedBlock.content.size : ''}
              onChange={(event) =>
                updateSelectedBlock((draft) => {
                  draft.content = { ...(draft.content ?? {}), size: event.target.value };
                })
              }
            />
          </Field>
        );

      case 'YOUTUBE_PLAYER':
        return (
          <FieldGrid>
            <Field style={{ gridColumn: '1 / -1' }}>
              <span>Video Title</span>
              <TextInput
                value={typeof selectedBlock.content?.title === 'string' ? selectedBlock.content.title : ''}
                onChange={(event) =>
                  updateSelectedBlock((draft) => {
                    draft.content = { ...(draft.content ?? {}), title: event.target.value };
                  })
                }
              />
            </Field>
            <Field style={{ gridColumn: '1 / -1' }}>
              <span>YouTube URL or ID</span>
              <TextInput
                value={
                  typeof selectedBlock.content?.youtubeUrl === 'string'
                    ? selectedBlock.content.youtubeUrl
                    : typeof selectedBlock.content?.youtubeId === 'string'
                      ? selectedBlock.content.youtubeId
                      : ''
                }
                onChange={(event) =>
                  updateSelectedBlock((draft) => {
                    draft.content = {
                      ...(draft.content ?? {}),
                      youtubeUrl: event.target.value,
                      youtubeId: event.target.value,
                    };
                  })
                }
              />
            </Field>
          </FieldGrid>
        );

      case 'IMAGE_SLIDER':
        return (
          <Section>
            <Field>
              <span>Aspect Ratio</span>
              <TextInput
                value={typeof selectedBlock.content?.aspectRatio === 'string' ? selectedBlock.content.aspectRatio : ''}
                onChange={(event) =>
                  updateSelectedBlock((draft) => {
                    draft.content = { ...(draft.content ?? {}), aspectRatio: event.target.value };
                  })
                }
              />
            </Field>
            {updateImageItems(
              () => ({ src: '', title: '', description: '' }),
              [
                { key: 'src', label: 'Storage File Name' },
                { key: 'title', label: 'Title' },
                { key: 'description', label: 'Description', multiline: true },
              ]
            )}
          </Section>
        );

      case 'IMAGE_SCROLLER':
        return (
          <Section>
            <FieldGrid>
              <Field>
                <span>Aspect Ratio</span>
                <TextInput
                  value={typeof selectedBlock.content?.aspectRatio === 'string' ? selectedBlock.content.aspectRatio : ''}
                  onChange={(event) =>
                    updateSelectedBlock((draft) => {
                      draft.content = { ...(draft.content ?? {}), aspectRatio: event.target.value };
                    })
                  }
                />
              </Field>
              <Field>
                <span>Storage File Name</span>
                <TextInput
                  value={typeof selectedBlock.content?.src === 'string' ? selectedBlock.content.src : ''}
                  onChange={(event) =>
                    updateSelectedBlock((draft) => {
                      draft.content = { ...(draft.content ?? {}), src: event.target.value };
                    })
                  }
                />
              </Field>
            </FieldGrid>
            <Field>
              <span>Title / Alt Text</span>
              <TextInput
                value={typeof selectedBlock.content?.title === 'string' ? selectedBlock.content.title : ''}
                onChange={(event) =>
                  updateSelectedBlock((draft) => {
                    draft.content = { ...(draft.content ?? {}), title: event.target.value };
                  })
                }
              />
            </Field>
            <Field>
              <span>Description</span>
              <TextArea
                value={typeof selectedBlock.content?.description === 'string' ? selectedBlock.content.description : ''}
                onChange={(event) =>
                  updateSelectedBlock((draft) => {
                    draft.content = { ...(draft.content ?? {}), description: event.target.value };
                  })
                }
              />
            </Field>
          </Section>
        );

      case 'IMAGE_GALLERY':
        return (
          <Section>
            <FieldGrid>
              <Field>
                <span>Aspect Ratio</span>
                <TextInput
                  value={typeof selectedBlock.content?.aspectRatio === 'string' ? selectedBlock.content.aspectRatio : ''}
                  onChange={(event) =>
                    updateSelectedBlock((draft) => {
                      draft.content = { ...(draft.content ?? {}), aspectRatio: event.target.value };
                    })
                  }
                />
              </Field>
              <Field>
                <span>Columns</span>
                <TextInput
                  value={String(selectedBlock.content?.columns ?? '')}
                  onChange={(event) =>
                    updateSelectedBlock((draft) => {
                      const nextColumns = Number(event.target.value);
                      draft.content = {
                        ...(draft.content ?? {}),
                        columns: Number.isFinite(nextColumns) ? nextColumns : event.target.value,
                      };
                    })
                  }
                />
              </Field>
            </FieldGrid>
            <InlineMessage>
              If you need per-row aspect ratios, use the Advanced JSON section below and edit `rowAspectRatios` directly.
            </InlineMessage>
            {updateImageItems(
              () => ({ src: '', title: '', description: '', row: '1', aspectRatio: '' }),
              [
                { key: 'src', label: 'Storage File Name' },
                { key: 'row', label: 'Row' },
                { key: 'aspectRatio', label: 'Item Aspect Ratio' },
                { key: 'title', label: 'Title' },
                { key: 'description', label: 'Description', multiline: true },
              ]
            )}
          </Section>
        );

      case 'CONTENT':
        return (
          <Section>
            <CheckboxRow>
              <input
                type="checkbox"
                checked={!!selectedBlock.content?.removeWidthRestriction}
                onChange={(event) =>
                  updateSelectedBlock((draft) => {
                    draft.content = {
                      ...(draft.content ?? {}),
                      removeWidthRestriction: event.target.checked,
                    };
                  })
                }
              />
              Remove Width Restriction
            </CheckboxRow>
            <Field>
              <span>Component Padding</span>
              <TextInput
                value={typeof selectedBlock.content?.componentPadding === 'string' ? selectedBlock.content.componentPadding : ''}
                onChange={(event) =>
                  updateSelectedBlock((draft) => {
                    draft.content = { ...(draft.content ?? {}), componentPadding: event.target.value };
                  })
                }
              />
            </Field>
            <InlineMessage>
              Build the common `CONTENT` layouts here, then use Advanced JSON only for unusual nested values that are not exposed yet.
            </InlineMessage>
            {renderContentItemsEditor()}
          </Section>
        );

      case 'SPLITTER':
      case 'SPLITTER_DEFAULT':
        return (
          <InlineMessage>
            This block is visual only and does not need extra content fields.
          </InlineMessage>
        );

      default:
        return null;
    }
  };

  return (
    <EditorShell aria-label="Collection page editor">
      <EditorHeader>
        <EditorTitle>
          <EH1 as="strong">Collection Editor</EH1>
          <EditorModeLabel>{isPreviewMode ? 'Preview' : 'Edit'}</EditorModeLabel>
        </EditorTitle>
        <EditorHint as="p">
          `Shift+E` exits edit mode. `Shift+P` toggles preview. `Shift+U` publishes the current draft.
        </EditorHint>
        <StatusRow>
          <StatusPill>{hasUnsavedChanges ? 'Draft Changed' : 'Draft Saved'}</StatusPill>
          {publishMessage ? <StatusPill $tone="ok">{publishMessage}</StatusPill> : null}
          {isPublishing ? <StatusPill>Publishing…</StatusPill> : null}
        </StatusRow>
        {publishError ? <HeaderError>{publishError}</HeaderError> : null}
        <Toolbar>
          <ToolbarButton type="button" onClick={onTogglePreview} $accent>
            {isPreviewMode ? 'Back To Edit' : 'Preview'}
          </ToolbarButton>
          <ToolbarButton type="button" onClick={onPublish} disabled={isPublishing}>
            Publish
          </ToolbarButton>
          <ToolbarButton type="button" onClick={onExitEditMode} $danger>
            Exit
          </ToolbarButton>
        </Toolbar>
      </EditorHeader>

      <EditorBody>
        <Section>
          <SectionTitle>Add Block</SectionTitle>
          {insertMode ? (
            <>
              <Field>
                <span>Component</span>
                <SelectInput
                  value={pendingInsertType}
                  onChange={(event) => onSetPendingInsertType(event.target.value as RenderableBlockType)}
                >
                  {COLLECTION_BLOCK_TEMPLATES.map((template) => (
                    <option key={template.type} value={template.type}>
                      {template.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <InlineMessage>
                {getCollectionBlockTemplate(pendingInsertType)?.description ?? 'Select a block type to insert.'}
              </InlineMessage>
              <ActionsRow>
                <SecondaryButton type="button" onClick={onCreateBlock}>
                  Insert Block
                </SecondaryButton>
                <SecondaryButton type="button" onClick={onCancelInsert}>
                  Cancel
                </SecondaryButton>
              </ActionsRow>
            </>
          ) : (
            <InlineMessage>Use the plus placeholder on the page to add a new block at the next free page position.</InlineMessage>
          )}
        </Section>

        <Section>
          <SectionTitle>Blocks</SectionTitle>
          <BlockList>
            {blocks.map((block) => (
              <BlockListButton
                key={block.id}
                type="button"
                $selected={block.id === selectedBlockId}
                onClick={() => onSelectBlock(block.id)}
              >
                <BlockItemTitle as="div">
                  {block.position}. {resolveBlockLabel(block)}
                </BlockItemTitle>
                <BlockItemSummary as="div">{resolveBlockSummary(block)}</BlockItemSummary>
              </BlockListButton>
            ))}
          </BlockList>
        </Section>

        <Section>
          <SectionTitle>Selected Block</SectionTitle>
          {selectedBlock ? (
            <>
              <SelectedHeader>
                <EH2 as="strong">{resolveBlockLabel(selectedBlock)}</EH2>
                <SelectedType>{selectedBlock.type}</SelectedType>
              </SelectedHeader>
              <InlineMessage>
                {getCollectionBlockTemplate(selectedBlock.type)?.description ?? 'Editable block.'}
              </InlineMessage>
              <ActionsRow>
                <SecondaryButton
                  type="button"
                  onClick={() => onMoveBlock(selectedBlock.id, 'up')}
                  disabled={selectedBlock.position <= 1}
                >
                  ↑
                </SecondaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() => onMoveBlock(selectedBlock.id, 'down')}
                  disabled={selectedBlock.position >= blocks.length}
                >
                  ↓
                </SecondaryButton>
                <SecondaryButton type="button" onClick={() => onDuplicateBlock(selectedBlock.id)}>
                  ⧉
                </SecondaryButton>
                <SecondaryButton type="button" onClick={() => onDeleteBlock(selectedBlock.id)}>
                  🗑
                </SecondaryButton>
              </ActionsRow>
              <Field>
                <span>Block Description</span>
                <TextArea
                  value={selectedBlock.description ?? ''}
                  onChange={(event) =>
                    updateSelectedBlock((draft) => {
                      draft.description = event.target.value.trim() ? event.target.value : null;
                    })
                  }
                />
              </Field>
              {renderSelectedBlockFields()}
              <Section>
                <SectionTitle>Advanced JSON</SectionTitle>
                <TextArea value={rawJson} onChange={(event) => setRawJson(event.target.value)} />
                {rawJsonError ? <InlineMessage>{rawJsonError}</InlineMessage> : null}
                <RawJsonApply
                  type="button"
                  onClick={() => {
                    if (!selectedBlock) return;

                    try {
                      const nextContent = JSON.parse(rawJson);
                      onChangeBlock({
                        ...selectedBlock,
                        content: nextContent,
                      });
                      setRawJsonError(null);
                    } catch (error) {
                      setRawJsonError(error instanceof Error ? error.message : 'Invalid JSON');
                    }
                  }}
                >
                  Apply JSON
                </RawJsonApply>
              </Section>
            </>
          ) : (
            <InlineMessage>Select a block on the page or from the block list to edit its content.</InlineMessage>
          )}
        </Section>
      </EditorBody>
    </EditorShell>
  );
};

export default CollectionEditor;
