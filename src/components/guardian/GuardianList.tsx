
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GuardianCard from './GuardianCard';
import { EmptyState } from './GuardianListStates';

interface Guardian {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface GuardianListProps {
  guardians: Guardian[];
  loading: boolean;
  onAddClick: () => void;
  onRemoveGuardian: (id: string) => Promise<void>;
  onSendInvite: (email: string, name: string | null) => Promise<void>;
}

const GuardianList: React.FC<GuardianListProps> = ({
  guardians,
  loading,
  onAddClick,
  onRemoveGuardian,
  onSendInvite
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex justify-between mt-6">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (guardians.length === 0) {
    return <EmptyState onAddClick={onAddClick} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {guardians.map((guardian) => (
        <GuardianCard
          key={guardian.id}
          id={guardian.id}
          name={guardian.full_name}
          email={guardian.email}
          phone={guardian.phone}
          isActive={guardian.is_active}
          createdAt={guardian.created_at}
          onRemove={onRemoveGuardian}
          onSendInvite={onSendInvite}
        />
      ))}
    </div>
  );
};

export default GuardianList;
