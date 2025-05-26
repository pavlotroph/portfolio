import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ContactForm from '../../components/ContactForm/ContactForm';
import {
  ContactContainer,
} from './Contact.styled';

import {
  CollectionHeader,
  CollectionWrapper,
  CollectionAdditionalWrapper,
  CUSTOM_SPLITTER,
  COLLECTION_4SEC_TITLE,
  COLLECTION_4SEC_DESCRIPTION,
} from '../../components/CollectionComponent/CollectionComponent.styled';

type ContactSection = {
  id: number;
  position: number;
  label: string;   // «Social», «Contact»…
  text: string;    // подпись ссылки
  tag?: 'h1' | 'h2' | 'h3';
  link?: string | null;
};

const Contact: React.FC = () => {
  const [sections, setSections] = useState<ContactSection[]>([]);

  /* ─── грузим данные ─── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('contact_sections')
        .select('*')
        .order('position');

      if (error) {
        console.error('[Contact] fetch error:', error.message);
      } else {
        setSections(data as ContactSection[]);
      }
    })();
  }, []);

  if (!sections.length) return null;

  /* ─── группируем по label ─── */
  const grouped = sections.reduce<Record<string, ContactSection[]>>((acc, sec) => {
    acc[sec.label] = acc[sec.label] ? [...acc[sec.label], sec] : [sec];
    return acc;
  }, {});

  return (
    <ContactContainer>        {/* внешний контейнер футера */}
      <CUSTOM_SPLITTER />             {/* горизонтальная линия сверху футера */}
      <CollectionAdditionalWrapper>
      <CollectionHeader>
        {Object.entries(grouped).map(([label, items]) => (
          <CollectionWrapper key={label}>
            <COLLECTION_4SEC_TITLE>{label}</COLLECTION_4SEC_TITLE>

            {items.length === 1 ? (
              renderItem(items[0])
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map(renderItem)}
              </div>
            )}
          </CollectionWrapper>
        ))}
      </CollectionHeader>
      </CollectionAdditionalWrapper>
      <ContactForm/>
    </ContactContainer>
  );

};

/* helper: одно звено футера */
function renderItem(sec: ContactSection) {
  const Tag = sec.tag || 'h3';

  if (sec.link) {
    const external = /^https?:\/\//i.test(sec.link);
    return (
      <a
        key={sec.id}
        href={sec.link}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none' }}
      >
        <COLLECTION_4SEC_DESCRIPTION as={Tag}
          dangerouslySetInnerHTML={{ __html: sec.text }}
        />
      </a>
    );
  }

  return (
    <COLLECTION_4SEC_DESCRIPTION
      key={sec.id}
      as={Tag}
      dangerouslySetInnerHTML={{ __html: sec.text }}
    />
  );
}

export default Contact;
