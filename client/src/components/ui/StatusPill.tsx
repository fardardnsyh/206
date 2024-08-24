type Props = {
  status: 'pending' | 'draft' | 'paid';
};

export default function StatusPill({ status }: Props) {
  const colors: Record<string, string> = {
    pending: 'bg-orange-400/30 text-orange-500',
    draft: 'bg-slate-500/30 text-slate-500',
    paid: 'bg-green-500/30 text-green-600',
  };

  return (
    <span
      className={`inline-flex min-w-20 text-xs justify-center capitalize font-bold px-4 py-1 rounded-full ${colors[status]}`}
    >
      {status}
    </span>
  );
}

