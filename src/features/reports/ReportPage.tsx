import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paths } from '@/app/paths';
import { Breadcrumbs, Button, ButtonLink, DetailRows, SuccessMark } from '@/components/ui';
import { MIN_REPORT_DESCRIPTION_LENGTH, REPORT_CATEGORIES, SPACES } from '@/domain/constants';
import { getSpace } from '@/domain/availability';
import type { DamageReport, ReportCategory } from '@/domain/types';
import { isReportReady } from '@/domain/validators';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useActions } from '@/store';

function ReportReceipt({ report }: { report: DamageReport }) {
  return (
    <div className="wrap page">
      <div className="cols cols--even">
        <div>
          <SuccessMark />
          <h1 className="h1">Reporte recibido</h1>
          <p className="lead" style={{ margin: '10px 0 28px' }}>
            Guarda tu número de seguimiento.
          </p>
          <div className="ticket">
            <div className="ticket__top">
              <div>
                <small>Número de seguimiento</small>
                <div className="ticket__code">{report.id}</div>
              </div>
            </div>
            <div className="ticket__cut" />
            <DetailRows
              rows={[
                ['Espacio', getSpace(report.spaceId)?.name ?? report.spaceId],
                ['Categoría', report.category],
                [
                  'Descripción',
                  <span style={{ display: 'inline-block', maxWidth: '28ch' }}>
                    {report.description}
                  </span>,
                ],
              ]}
            />
          </div>
        </div>
        <div className="col-offset">
          <div className="stack">
            <ButtonLink to={paths.explore}>Volver al inicio</ButtonLink>
            <ButtonLink variant="ghost" to={paths.profile}>
              Ir a mi perfil
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportPage() {
  useDocumentTitle('Reportar un daño');
  const actions = useActions();
  const [params] = useSearchParams();
  const initialSpace = getSpace(params.get('espacio') ?? '')?.id ?? SPACES[0]!.id;

  const [spaceId, setSpaceId] = useState(initialSpace);
  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState<DamageReport | null>(null);

  if (sent) return <ReportReceipt report={sent} />;

  const ready = isReportReady(category, description);

  const submit = () => {
    const result = actions.sendReport({ spaceId, category, description });
    if (result.ok) setSent(result.report);
  };

  return (
    <div className="wrap page">
      <Breadcrumbs
        items={[{ label: 'Perfil', to: paths.profile }, { label: 'Reportar un daño' }]}
      />
      <div className="measure">
        <h1 className="h1">Reportar un daño</h1>
        <p className="lead" style={{ margin: '10px 0 26px' }}>
          Elige el espacio, la categoría y cuenta qué pasa.
        </p>

        <div className="field">
          <label htmlFor="report-space">Espacio</label>
          <select
            className="input"
            id="report-space"
            value={spaceId}
            onChange={(event) => setSpaceId(event.target.value)}
          >
            {SPACES.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="label" id="report-category">
            Categoría
          </span>
          <div className="chips" role="group" aria-labelledby="report-category">
            {REPORT_CATEGORIES.map((option) => (
              <button
                key={option}
                type="button"
                className="chip"
                aria-pressed={category === option}
                onClick={() => setCategory(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="report-description">Describe el problema</label>
          <textarea
            className="input"
            id="report-description"
            placeholder="Qué pasa y dónde está exactamente"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-describedby="report-hint"
          />
          <p className="hint" id="report-hint">
            Elige una categoría y escribe al menos {MIN_REPORT_DESCRIPTION_LENGTH} caracteres para
            enviar.
          </p>
        </div>

        <Button size="lg" disabled={!ready} onClick={submit}>
          Enviar reporte
        </Button>
      </div>
    </div>
  );
}
