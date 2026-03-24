import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled, { css } from 'styled-components';
import { supabase } from '../../supabaseClient';
import CollectionComponent from '../../components/CollectionComponent/CollectionComponent';
import CollectionSlider from '../../components/CollectionsSwiper/CollectionsSwiper';
import CollectionEditor from '../../components/CollectionEditor/CollectionEditor';
import {
  cloneBlockContent,
  createDraftCollectionBlock,
} from '../../components/CollectionComponent/collectionBlockRegistry';
import type {
  CollectionBlockDB,
  RenderableBlockType,
} from '../../components/CollectionComponent/collectionBlocks';
import LoadingWebm from '../../assets/video/logo_animated_hq.webm';
import LoadingMp4 from '../../assets/video/logo.mp4';
import { NotFoundWraperr, NotFoundText } from '../Work/Work.styled';
import { DisableReveal } from '../Reveal/Reveal';

interface WorkRecord {
  id: number;
  title: string;
  folder: string;
  slug?: string | null;
}

interface CollectionNavRecord {
  id: number;
  slug?: string | null;
}

interface CollectionPageProps {
  source: 'work' | 'photo';
}

const editPageText = css`
  margin: 0;
  font-family: var(--second-family);
  color: inherit;
`;

const EditPreviewBadge = styled.div`
  position: fixed;
  top: 96px;
  left: 18px;
  z-index: 55;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font-family: var(--second-family);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
`;

const EditPlaceholderButton = styled.button`
  width: 100%;
  aspect-ratio: 21 / 9;
  border: 1px dashed rgba(255, 255, 255, 0.34);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  color: #fff;
  display: grid;
  place-items: center;
  margin-top: 24px;
  margin-bottom: 40px;
  cursor: pointer;
  font-family: var(--second-family);
`;

const EditPlaceholderPlus = styled.span`
  ${editPageText}
  font-size: 44px;
  line-height: 1;
  font-weight: 400;
`;

const EditAuthOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: grid;
  place-items: center;
  z-index: 70;
  padding: 18px;
`;

const EditAuthCard = styled.form`
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(10, 10, 10, 0.96);
  color: #fff;
  font-family: var(--second-family);
`;

const EditAuthTitle = styled.h2`
  ${editPageText}
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1.25;
  text-transform: uppercase;
`;

const EditAuthMessage = styled.p`
  ${editPageText}
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.5;
`;

const EditAuthLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgba(255, 255, 255, 0.78);
  font-family: var(--second-family);
`;

const EditAuthLabelText = styled.span`
  ${editPageText}
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const EditAuthInput = styled.input`
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 10px 12px;
  font-family: var(--second-family);
  font-size: 14px;
`;

const EditAuthError = styled.p`
  ${editPageText}
  color: #ff8f8f;
  font-size: 12px;
  line-height: 1.5;
`;

const EditAuthActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const EditAuthButton = styled.button<{ $primary?: boolean }>`
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) =>
    $primary ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'};
  color: #fff;
  padding: 10px 12px;
  cursor: pointer;
  font-family: var(--second-family);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const DEFAULT_EDITOR_EMAIL = 'pavlotroph@gmail.com';

const normalizeBlocks = (blocks: CollectionBlockDB[]) =>
  blocks.map((block, index) => ({
    ...block,
    position: index + 1,
  }));

const cloneBlocks = (blocks: CollectionBlockDB[]) =>
  normalizeBlocks(
    blocks.map((block) => ({
      ...block,
      content: cloneBlockContent(block.content),
    }))
  );

const serializeComparableBlocks = (blocks: CollectionBlockDB[]) =>
  JSON.stringify(
    normalizeBlocks(blocks).map((block) => ({
      type: block.type,
      description: block.description ?? null,
      position: block.position,
      content: block.content ?? null,
    }))
  );

const isEditableTarget = (target: EventTarget | null) => {
  const node = target as HTMLElement | null;
  if (!node) return false;
  const tagName = node.tagName;

  return (
    node.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    tagName === 'OPTION'
  );
};

const getNextTempId = (blocks: CollectionBlockDB[]) =>
  Math.min(0, ...blocks.map((block) => block.id)) - 1;

const getReadableErrorMessage = (issue: unknown) => {
  if (issue instanceof Error) {
    const details =
      typeof (issue as Error & { details?: unknown }).details === 'string'
        ? (issue as Error & { details?: string }).details
        : '';
    const hint =
      typeof (issue as Error & { hint?: unknown }).hint === 'string'
        ? (issue as Error & { hint?: string }).hint
        : '';
    const code =
      typeof (issue as Error & { code?: unknown }).code === 'string'
        ? (issue as Error & { code?: string }).code
        : '';

    return [issue.message, details, hint, code].filter(Boolean).join(' | ');
  }

  if (typeof issue === 'object' && issue !== null) {
    const maybeIssue = issue as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    return [
      typeof maybeIssue.message === 'string' ? maybeIssue.message : '',
      typeof maybeIssue.details === 'string' ? maybeIssue.details : '',
      typeof maybeIssue.hint === 'string' ? maybeIssue.hint : '',
      typeof maybeIssue.code === 'string' ? maybeIssue.code : '',
    ]
      .filter(Boolean)
      .join(' | ');
  }

  if (typeof issue === 'string') {
    return issue;
  }

  return 'Publish failed for this draft.';
};

const CollectionPage: React.FC<CollectionPageProps> = ({ source }) => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const blocksTable = source === 'work' ? 'project_blocks' : 'collection_blocks';
  const parentTable = source === 'work' ? 'work' : 'photography';
  const editorEmail = import.meta.env.VITE_EDITOR_EMAIL?.trim() || DEFAULT_EDITOR_EMAIL;

  const [project, setProject] = useState<(WorkRecord & { blocks: CollectionBlockDB[] }) | null>(null);
  const [draftBlocks, setDraftBlocks] = useState<CollectionBlockDB[]>([]);
  const [allCollections, setAllCollections] = useState<CollectionNavRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [insertMode, setInsertMode] = useState(false);
  const [pendingInsertType, setPendingInsertType] = useState<RenderableBlockType>('CONTENT');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [editorPassword, setEditorPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthPending, setIsAuthPending] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slugOrId) return;

      setLoading(true);
      setError('');

      try {
        const isNumericId = /^\d+$/.test(slugOrId);

        let workQuery = supabase
          .from(parentTable)
          .select('id, title, folder, slug')
          .limit(1);

        if (isNumericId) {
          workQuery = workQuery.eq('id', Number(slugOrId));
        } else {
          workQuery = workQuery.eq('slug', slugOrId);
        }

        const { data: workData, error: workErr } = await workQuery.single();
        if (workErr) throw workErr;

        if (!workData) {
          setProject(null);
          setDraftBlocks([]);
          setSelectedBlockId(null);
          return;
        }

        const { data: workList, error: listErr } = await supabase
          .from(parentTable)
          .select('id, slug');
        if (listErr) throw listErr;
        setAllCollections((workList as CollectionNavRecord[]) || []);

        const { data: blocks, error: blocksErr } = await supabase
          .from(blocksTable)
          .select('*')
          .eq('collection_id', workData.id)
          .order('position', { ascending: true });
        if (blocksErr) throw blocksErr;

        const normalizedBlocks = normalizeBlocks((blocks as CollectionBlockDB[]) || []);
        setProject({
          ...workData,
          blocks: normalizedBlocks,
        });
        setDraftBlocks(cloneBlocks(normalizedBlocks));
        setSelectedBlockId(normalizedBlocks[0]?.id ?? null);
        setIsEditMode(false);
        setIsPreviewMode(false);
        setInsertMode(false);
        setPublishMessage(null);
        setPublishError(null);
        setIsAuthPromptOpen(false);
        setEditorPassword('');
        setAuthError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [blocksTable, parentTable, slugOrId]);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  useEffect(() => {
    if (loading && videoRef.current) {
      videoRef.current.play().catch((videoError) => {
        if (videoError.name !== 'AbortError') {
          console.error('Loading video play error:', videoError);
        }
      });
    }
  }, [loading]);

  useEffect(() => {
    if (!publishMessage) return;

    const timeoutId = window.setTimeout(() => setPublishMessage(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [publishMessage]);

  const currentBlocks = isEditMode ? draftBlocks : project?.blocks ?? [];
  const hasUnsavedChanges = useMemo(() => {
    if (!project) return false;
    return serializeComparableBlocks(project.blocks) !== serializeComparableBlocks(draftBlocks);
  }, [draftBlocks, project]);

  const handleOpenAuthPrompt = useCallback(() => {
    setAuthError(null);
    setEditorPassword('');
    setIsAuthPromptOpen(true);
  }, []);

  const handleExitEditMode = useCallback(async () => {
    if (!project) return;

    if (
      hasUnsavedChanges &&
      !window.confirm('Discard the current draft changes and leave edit mode?')
    ) {
      return;
    }

    setDraftBlocks(cloneBlocks(project.blocks));
    setSelectedBlockId(project.blocks[0]?.id ?? null);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setInsertMode(false);
    setPublishMessage(null);
    setPublishError(null);
    setIsAuthPromptOpen(false);
    setEditorPassword('');
    setAuthError(null);

    await supabase.auth.signOut();
  }, [hasUnsavedChanges, project]);

  const handleAuthenticate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsAuthPending(true);
      setAuthError(null);

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: editorEmail,
          password: editorPassword,
        });

        if (signInError) throw signInError;

        setIsAuthPromptOpen(false);
        setEditorPassword('');
        setIsEditMode(true);
        setIsPreviewMode(false);
        setInsertMode(false);
        setPublishMessage(null);
        setPublishError(null);
        setSelectedBlockId((current) => current ?? draftBlocks[0]?.id ?? null);
      } catch (authIssue) {
        setAuthError(authIssue instanceof Error ? authIssue.message : 'Unable to enter edit mode.');
      } finally {
        setIsAuthPending(false);
      }
    },
    [draftBlocks, editorEmail, editorPassword]
  );

  const handleChangeBlock = useCallback((nextBlock: CollectionBlockDB) => {
    setDraftBlocks((current) =>
      normalizeBlocks(
        current.map((block) =>
          block.id === nextBlock.id
            ? {
                ...nextBlock,
                content: cloneBlockContent(nextBlock.content),
              }
            : block
        )
      )
    );
  }, []);

  const handleCreateBlock = useCallback(() => {
    if (!project) return;

    setDraftBlocks((current) => {
      const nextBlock = createDraftCollectionBlock(
        pendingInsertType,
        project.id,
        current.length + 1,
        getNextTempId(current)
      );
      setSelectedBlockId(nextBlock.id);
      return normalizeBlocks([...current, nextBlock]);
    });
    setInsertMode(false);
    setIsPreviewMode(false);
  }, [pendingInsertType, project]);

  const handleDuplicateBlock = useCallback((blockId: number) => {
    setDraftBlocks((current) => {
      const targetIndex = current.findIndex((block) => block.id === blockId);
      if (targetIndex === -1) return current;

      const sourceBlock = current[targetIndex];
      const duplicatedBlock: CollectionBlockDB = {
        ...sourceBlock,
        id: getNextTempId(current),
        content: cloneBlockContent(sourceBlock.content),
        description: sourceBlock.description,
      };
      const nextBlocks = [...current];
      nextBlocks.splice(targetIndex + 1, 0, duplicatedBlock);
      setSelectedBlockId(duplicatedBlock.id);
      return normalizeBlocks(nextBlocks);
    });
    setInsertMode(false);
  }, []);

  const handleDeleteBlock = useCallback((blockId: number) => {
    setDraftBlocks((current) => {
      const targetIndex = current.findIndex((block) => block.id === blockId);
      if (targetIndex === -1) return current;
      if (!window.confirm('Delete this block from the draft?')) return current;

      const nextBlocks = current.filter((block) => block.id !== blockId);
      const fallbackBlock = nextBlocks[Math.min(targetIndex, nextBlocks.length - 1)] ?? null;
      setSelectedBlockId(fallbackBlock?.id ?? null);
      return normalizeBlocks(nextBlocks);
    });
    setInsertMode(false);
  }, []);

  const handleMoveBlock = useCallback((blockId: number, direction: 'up' | 'down') => {
    setDraftBlocks((current) => {
      const index = current.findIndex((block) => block.id === blockId);
      if (index === -1) return current;

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const nextBlocks = [...current];
      const [movedBlock] = nextBlocks.splice(index, 1);
      nextBlocks.splice(nextIndex, 0, movedBlock);
      return normalizeBlocks(nextBlocks);
    });
  }, []);

  const handlePublish = useCallback(async () => {
    if (!project) return;
    if (isPublishing) return;

    setIsPublishing(true);
    setPublishMessage(null);
    setPublishError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Editor session missing. Enter edit mode again before publishing.');
      }

      const payload = normalizeBlocks(draftBlocks).map((block) => ({
        ...(block.id > 0 ? { id: block.id } : {}),
        collection_id: project.id,
        type: block.type,
        content: cloneBlockContent(block.content),
        description: block.description?.trim() ? block.description.trim() : null,
        position: block.position,
      }));

      const { data: existingRows, error: existingRowsError } = await supabase
        .from(blocksTable)
        .select('id')
        .eq('collection_id', project.id);
      if (existingRowsError) throw existingRowsError;

      const rowsToUpdate = payload.filter((row) => 'id' in row);
      const rowsToInsert = payload.filter((row) => !('id' in row));

      if (rowsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from(blocksTable)
          .upsert(rowsToUpdate, { onConflict: 'id' });
        if (updateError) throw updateError;
      }

      if (rowsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from(blocksTable)
          .insert(rowsToInsert);
        if (insertError) throw insertError;
      }

      const keptIds = new Set(
        rowsToUpdate
          .map((row) => ('id' in row ? row.id : null))
          .filter((id): id is number => typeof id === 'number')
      );
      const idsToDelete = ((existingRows as Array<{ id: number }> | null) ?? [])
        .map((row) => row.id)
        .filter((id) => !keptIds.has(id));

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from(blocksTable).delete().in('id', idsToDelete);
        if (deleteError) throw deleteError;
      }

      const { data: freshBlocks, error: refreshError } = await supabase
        .from(blocksTable)
        .select('*')
        .eq('collection_id', project.id)
        .order('position', { ascending: true });
      if (refreshError) throw refreshError;

      const nextPublishedBlocks = normalizeBlocks((freshBlocks as CollectionBlockDB[]) || []);
      setProject((current) =>
        current
          ? {
              ...current,
              blocks: nextPublishedBlocks,
            }
          : current
      );
      setDraftBlocks(cloneBlocks(nextPublishedBlocks));
      setSelectedBlockId((current) => {
        if (current == null) return nextPublishedBlocks[0]?.id ?? null;
        return nextPublishedBlocks.find((block) => block.id === current)?.id ?? nextPublishedBlocks[0]?.id ?? null;
      });
      setPublishMessage('Published');
    } catch (publishIssue) {
      const message = getReadableErrorMessage(publishIssue);
      console.error('Publish failed', {
        publishIssue,
        blocksTable,
        collectionId: project.id,
        draftBlocks,
      });
      setPublishError(message);
      window.alert(message);
    } finally {
      setIsPublishing(false);
    }
  }, [blocksTable, draftBlocks, isPublishing, project]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (!event.shiftKey) return;

      const key = event.key.toLowerCase();
      if (key === 'e') {
        event.preventDefault();
        if (isEditMode) {
          void handleExitEditMode();
        } else {
          handleOpenAuthPrompt();
        }
        return;
      }

      if (!isEditMode) return;

      if (key === 'p') {
        event.preventDefault();
        setIsPreviewMode((current) => !current);
        return;
      }

      if (key === 'u') {
        event.preventDefault();
        void handlePublish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExitEditMode, handleOpenAuthPrompt, handlePublish, isEditMode]);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          aria-label="Loading animation"
          style={{ width: 150, height: 150 }}
        >
          <source src={LoadingWebm} type="video/webm" />
          <source src={LoadingMp4} type="video/mp4" />
        </video>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <p style={{ color: '#fff' }}>Error: {error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <NotFoundWraperr>
        <NotFoundText>
          404<br />NOT FOUND
        </NotFoundText>
      </NotFoundWraperr>
    );
  }

  const canonicalSlugOrId = project.slug || project.id;
  const firstTextBlock = project.blocks.find((block) => block.type.startsWith('TEXT_'));
  const metaDescription = firstTextBlock
    ? (firstTextBlock.content.sections?.[0]?.text ?? '').slice(0, 160)
    : `Просмотр проекта ${project.title}`;

  const collectionNode = (
    <CollectionComponent
      collection={{
        id: project.id,
        folder: project.folder,
        blocks: currentBlocks,
      }}
      source={source}
      editor={
        isEditMode
          ? {
              enabled: true,
              preview: isPreviewMode,
              selectedBlockId,
              onSelectBlock: setSelectedBlockId,
              placeholder: (
                <EditPlaceholderButton
                  type="button"
                  onClick={() => {
                    setInsertMode(true);
                    setIsPreviewMode(false);
                    setSelectedBlockId(null);
                  }}
                  aria-label="Add a new block"
                >
                  <EditPlaceholderPlus>+</EditPlaceholderPlus>
                </EditPlaceholderButton>
              ),
            }
          : undefined
      }
    />
  );

  return (
    <>
      <Helmet>
        <title>{project.title} | Pavlo Troph Portfolio</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${project.title} | Pavlo Troph Portfolio`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`https://pavlotroph.com/${source}/${canonicalSlugOrId}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} | Pavlo Troph Portfolio`} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>

      <div>
        <h1
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {project.title}
        </h1>
        {isEditMode ? <DisableReveal>{collectionNode}</DisableReveal> : collectionNode}
      </div>

      {isEditMode && isPreviewMode ? (
        <EditPreviewBadge>
          Preview mode. `Shift+P` returns to editing.
        </EditPreviewBadge>
      ) : null}

      {isEditMode && !isPreviewMode ? (
        <CollectionEditor
          blocks={draftBlocks}
          selectedBlockId={selectedBlockId}
          isPreviewMode={isPreviewMode}
          isPublishing={isPublishing}
          hasUnsavedChanges={hasUnsavedChanges}
          publishMessage={publishMessage}
          publishError={publishError}
          insertMode={insertMode}
          pendingInsertType={pendingInsertType}
          onSelectBlock={setSelectedBlockId}
          onChangeBlock={handleChangeBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveBlock={handleMoveBlock}
          onSetPendingInsertType={setPendingInsertType}
          onCreateBlock={handleCreateBlock}
          onCancelInsert={() => setInsertMode(false)}
          onTogglePreview={() => setIsPreviewMode((current) => !current)}
          onExitEditMode={() => {
            void handleExitEditMode();
          }}
          onPublish={() => {
            void handlePublish();
          }}
        />
      ) : null}

      {!isEditMode ? (
        <CollectionSlider
          source={source}
          currentId={project.id}
          collections={allCollections}
          collectionName={project.title}
        />
      ) : null}

      {isAuthPromptOpen ? (
        <EditAuthOverlay>
          <EditAuthCard onSubmit={handleAuthenticate}>
            <EditAuthTitle>
              You&apos;re requested to edit this page.
            </EditAuthTitle>
            <EditAuthMessage>
              Enter the editor password to start a secure Supabase-authenticated edit session.
            </EditAuthMessage>
            <EditAuthLabel>
              <EditAuthLabelText>Password</EditAuthLabelText>
              <EditAuthInput
                type="password"
                autoFocus
                value={editorPassword}
                onChange={(event) => setEditorPassword(event.target.value)}
              />
            </EditAuthLabel>
            {authError ? (
              <EditAuthError>{authError}</EditAuthError>
            ) : null}
            <EditAuthActions>
              <EditAuthButton
                type="button"
                onClick={() => {
                  setIsAuthPromptOpen(false);
                  setEditorPassword('');
                  setAuthError(null);
                }}
              >
                Cancel
              </EditAuthButton>
              <EditAuthButton
                type="submit"
                $primary
                disabled={isAuthPending}
              >
                {isAuthPending ? 'Checking…' : 'Enter Edit Mode'}
              </EditAuthButton>
            </EditAuthActions>
          </EditAuthCard>
        </EditAuthOverlay>
      ) : null}
    </>
  );
};

export default CollectionPage;
