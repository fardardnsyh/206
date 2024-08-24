import { Link } from 'react-router-dom';

type Props = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

export default function BackButton({ to, label, icon }: Props) {
  return (
    <Link
      to={to}
      className="inline-flex flex-wrap items-center text-md font-bold text-zinc-500 hover:text-black p-2 gap-2"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

