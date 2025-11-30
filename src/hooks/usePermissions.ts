import { useMemo } from 'react';
import { useAuth, PermissionAction } from '../context/AuthContext';

const actions: PermissionAction[] = ['view', 'create', 'update', 'delete'];

export function usePermissions(entity: string) {
  const { can } = useAuth();

  return useMemo(
    () => ({
      canView: can(entity, 'view'),
      canCreate: can(entity, 'create'),
      canUpdate: can(entity, 'update'),
      canDelete: can(entity, 'delete'),
      check: (action: PermissionAction) => can(entity, action),
    }),
    [can, entity],
  );
}




