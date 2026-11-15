import { useTranslation } from 'react-i18next'
import { statusLabel } from '../data/statuses'
export default function ProjectStateBadge({ status }) {
  const { i18n } = useTranslation()
  return <span className={`shared-status state-${status}`}><span aria-hidden="true" />{statusLabel(status, i18n.language)}</span>
}
