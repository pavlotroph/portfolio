import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Helmet } from 'react-helmet';

import CollectionComponent from '../../components/CollectionComponent/CollectionComponent';
import CollectionSlider from '../../components/CollectionsSwiper/CollectionsSwiper';
import Loading from '../../assets/video/logo_animated_hq.webm';
import { NotFoundWraperr, NotFoundText } from '../Work/Work.styled';

interface WorkRecord {
  id: number;
  title: string;
  folder: string;
}

interface CollectionPageProps {
  source: 'work' | 'photo';
}

const CollectionPage: React.FC<CollectionPageProps> = ({ source }) => {
  const { id } = useParams<{ id: string }>();

  const blocksTable = source === 'work' ? 'project_blocks' : 'collection_blocks';
  const parentTable = source === 'work' ? 'work' : 'photography';

  const [project, setProject] = useState<WorkRecord & { blocks: any[] } | null>(null);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1) Получаем запись из родительской таблицы (work или photography)
        const { data: workData, error: workErr } = await supabase
          .from(parentTable)
          .select('id, title, folder')
          .eq('id', id)
          .single();
        if (workErr) throw workErr;
        if (!workData) {
          setProject(null);
          return;
        }

        // 2) Получаем все ID для слайдера из той же таблицы
        const { data: workList, error: listErr } = await supabase
          .from(parentTable)
          .select('id');
        if (listErr) throw listErr;
        setAllIds(workList?.map((w) => w.id) || []);

        // 3) Загружаем блоки из нужной таблицы (project_blocks или collection_blocks)
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
  }, [id]);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <video src={Loading} autoPlay loop muted playsInline style={{ width: 150, height: 150 }} />
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
  const firstTextBlock = project.blocks.find(b => b.type.startsWith('TEXT_'));
  const metaDescription = firstTextBlock
    ? (firstTextBlock.content.sections?.[0]?.text ?? '').slice(0, 160)
    : `Просмотр проекта ${project.title}`;

  return (
    <>
      <Helmet>
        <title>{project.title} — MySite</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={metaDescription} />
      </Helmet>

      <CollectionComponent
        collection={{
          id: project.id,
          folder: project.folder,
          blocks: project.blocks,
        }}
        source={source}
      />

      <CollectionSlider
        source={source} 
        currentId={project.id}
        collectionIds={allIds}
        collectionName={project.title}
      />
    </>
  );
};

export default CollectionPage;
