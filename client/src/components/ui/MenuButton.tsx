import { NavLink } from 'react-router-dom';

type Props = {
  to?: string;
  as?: 'link' | 'button';
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

const activeLink =
  'inline-flex flex-wrap items-center w-full rounded-lg bg-green-400 font-bold px-6 pr-8 py-4 gap-3 text-sm transition-colors';
const baseLink =
  'inline-flex flex-wrap items-center w-full rounded-lg text-zinc-500 hover:text-black font-bold px-6 pr-8 py-4 gap-3 text-sm transition-colors';

export default function MenuButton({
  to,
  label,
  icon,
  as = 'link',
  onClick,
}: Props) {
  return as === 'link' ? (
    <NavLink
      className={({ isActive }) => (isActive ? activeLink : baseLink)}
      to={to ?? ''}
    >
      <span>{icon}</span>
      <span className="pt-1">{label}</span>
    </NavLink>
  ) : (
    <button className={baseLink} onClick={onClick}>
      <span>{icon}</span>
      <span className="pt-1">{label}</span>
    </button>
  );
}

