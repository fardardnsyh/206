import { useRouteError } from 'react-router-dom';

export default function Error() {
  const error = useRouteError() as { statusText?: string; message?: string };

  return (
    <div>
      <h2>Error</h2>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}

