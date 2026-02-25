import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Helmet } from 'react-helmet-async';

import CollectionComponent from '../../components/CollectionComponent/CollectionComponent';
import CollectionSlider from '../../components/CollectionsSwiper/CollectionsSwiper';
import LoadingWebm from '../../assets/video/logo_animated_hq.webm';
import LoadingMp4 from '../../assets/video/logo.mp4';
import { NotFoundWraperr, NotFoundText } from '../Work/Work.styled';

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

const CollectionPage: React.FC<CollectionPageProps> = ({ source }) => {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const blocksTable = source === 'work' ? 'project_blocks' : 'collection_blocks';
  const parentTable = source === 'work' ? 'work' : 'photography';

  const [project, setProject] = useState<WorkRecord & { blocks: any[] } | null>(null);
  const [allCollections, setAllCollections] = useState<CollectionNavRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
  const fetchData = async () => {
    if (!slugOrId) return;

    setLoading(true);
    try {
      // is this a numeric id like "3", or a slug like "toronto-collection-part-1"?
      const isNumericId = /^\d+$/.test(slugOrId);

      // 1) Получаем запись из родительской таблицы (work или photography)
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
        return;
      }

      // 2) Получаем все ID для слайдера
      const { data: workList, error: listErr } = await supabase
        .from(parentTable)
        .select('id, slug');
      if (listErr) throw listErr;
      setAllCollections((workList as CollectionNavRecord[]) || []);

      // 3) Загружаем блоки (project_blocks или collection_blocks)
      const { data: blocks, error: blocksErr } = await supabase
        .from(blocksTable)
        .select('*')
        .eq('collection_id', workData.id)
        .order('position', { ascending: true });
      if (blocksErr) throw blocksErr;

      setProject({
        ...workData,
        blocks: blocks || [],
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [slugOrId, parentTable, blocksTable]);


  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (loading && videoRef.current) {
      videoRef.current.play().catch(e => {
        if (e.name !== 'AbortError') console.error('Loading video play error:', e);
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}>
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
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}>
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

  // SEO
  const canonicalSlugOrId = project.slug || project.id;
  const firstTextBlock = project.blocks.find(b => b.type.startsWith('TEXT_'));
  const metaDescription = firstTextBlock
    ? (firstTextBlock.content.sections?.[0]?.text ?? '').slice(0, 160)
    : `Просмотр проекта ${project.title}`;

  return (
    <>
      <Helmet>
        <title>{project.title} | Pavlo Troph Portfolio</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${project.title} | Pavlo Troph Portfolio`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`https://pavlotroph.com/${source}/${canonicalSlugOrId}`}/>
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} | Pavlo Troph Portfolio`} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>
      <div>
        <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
          {project.title}
        </h1>
        <CollectionComponent
          collection={{
            id: project.id,
            folder: project.folder,
            blocks: project.blocks,
          }}
          source={source}
        />
      </div>

      <CollectionSlider
        source={source} 
        currentId={project.id}
        collections={allCollections}
        collectionName={project.title}
      />
    </>
  );
};

export default CollectionPage;
