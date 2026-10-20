import { useState } from 'react';
import { Dots, SegmentedControl } from '@/components/ui';
import { peopleFor } from '@/domain/availability';
import { POINTS_JOINER, POINTS_OWNER, SHARE_PERCENTS, SPACES } from '@/domain/constants';
import { pluralize } from '@/domain/format';
import type { SharePercent } from '@/domain/types';

/** Demostración interactiva de cuánto se libera de la sala B-204. No guarda nada. */
export function ShareDemo() {
  const space = SPACES[0]!;
  const [percent, setPercent] = useState<SharePercent>(50);
  const released = peopleFor(space, percent);
  const kept = space.capacity - released;

  return (
    <div className="share__demo">
      <div className="label" id="share-demo-label">
        Sala {space.code}, capacidad {space.capacity}. ¿Cuánto liberas?
      </div>
      <SegmentedControl
        labelledBy="share-demo-label"
        value={percent}
        onChange={setPercent}
        options={SHARE_PERCENTS.map((p) => ({ value: p, label: `${p}%` }))}
      />
      <Dots
        large
        capacity={space.capacity}
        segments={[
          { kind: 'mine', count: kept },
          { kind: 'taken', count: released },
        ]}
      />
      <div className="share__who">
        <div>
          <i style={{ background: 'var(--orange)' }} />
          Tú, {kept} {pluralize(kept, 'persona', 'personas')}
        </div>
        <div>
          <i style={{ background: 'var(--occ)' }} />
          Otro estudiante, {released} {pluralize(released, 'persona', 'personas')}
        </div>
      </div>
      <div className="share__pts">
        <div>
          <b>+{POINTS_OWNER}</b>
          <span>para ti, por liberar</span>
        </div>
        <div>
          <b>+{POINTS_JOINER}</b>
          <span>para quien toma tu parte</span>
        </div>
      </div>
    </div>
  );
}
