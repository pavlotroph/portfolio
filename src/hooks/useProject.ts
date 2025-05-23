// src/hooks/useProject.ts
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface CollectionBlockDB {
  id: number;
  collection_id: number;
  type: string;
  content: any;
  description: string | null;
  position: number;
}

export interface ProjectData {
  id: number;
  title: string;
  folder: string;
  blocks: CollectionBlockDB[];
}

export function useProject(
  parentTable: 'work' | 'photography',
  blocksTable: 'project_blocks' | 'collection_blocks',
  id?: string
) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    (async () => {
      try {
        // 1) Получить сам проект (work или photography)
        const { data: projData, error: projErr } = await supabase
          .from(parentTable)
          .select('id, title, folder')
          .eq('id', id)
          .single();
        if (projErr) throw projErr;
        if (!projData) {
          setProject(null);
          return;
        }

        // 2) Список всех ID из parentTable для слайдера
        const { data: list, error: listErr } = await supabase
          .from(parentTable)
          .select('id');
        if (listErr) throw listErr;
        setAllIds(list.map((r) => r.id));

        // 3) Блоки из blocksTable
        const { data: blocks, error: blocksErr } = await supabase
          .from(blocksTable)
          .select('*')
          .eq('collection_id', projData.id)
          .order('position', { ascending: true });
        if (blocksErr) throw blocksErr;

        setProject({ ...projData, blocks: blocks || [] });
      } catch (e) {
        setError((e as Error).message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [parentTable, blocksTable, id]);

  return { project, allIds, loading, error };
}