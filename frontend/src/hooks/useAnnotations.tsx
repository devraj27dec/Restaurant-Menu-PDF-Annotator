import { useState } from 'react';
import type { Group } from '../lib/types';



export function useAnnotations() {
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



  return {
    groups,
    setGroups,
    currentGroup,
    createGroup,
    finalizeGroup,
  };
}