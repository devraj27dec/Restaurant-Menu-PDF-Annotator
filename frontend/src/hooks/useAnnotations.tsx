import { useState } from 'react';
import type { Annotation, Group } from '../lib/types';



export function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentGroup, setCurrentGroup] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  const createGroup = () => {
    const groupId = Date.now();
    setCurrentGroup(groupId);
    setGroups([...groups, { id: groupId, name: `Item Group ${groups.length + 1}` }]);
  };

  const finalizeGroup = () => {
    setCurrentGroup(null);
  };

  const deleteAnnotation = (id: number) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const updateAnnotationText = (id: number, text: string) => {
    setAnnotations(annotations.map((a) => (a.id === id ? { ...a, text } : a)));
  };


  return {
    annotations,
    groups,
    setGroups,
    currentGroup,
    createGroup,
    finalizeGroup,
    deleteAnnotation,
    updateAnnotationText
  };
}