import { useRef } from 'react';
import Button from './Button';
import ExclamationIcon from '../icons/ExclamationIcon';

type Props = {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, onConfirm, children }: Props) {
  const dialogRef = useRef<null | HTMLDialogElement>(null);

  const closeDialog = () => {
    dialogRef.current?.close();
    onClose();
  };

  const confirmDialog = () => {
    onConfirm();
    closeDialog();
  };

  if (open) {
    dialogRef.current?.showModal();
  }

  return (
    <dialog ref={dialogRef} className="rounded-xl backdrop:bg-black/40">
      <div className="flex flex-col items-center bg-white p-8 text-lg">
        <div className="gap-2 items-center bg-red-200 text-red-500 font-bold p-2 text-sm mb-8 rounded-full border border-red-300">
          <ExclamationIcon />
        </div>
        {children}
        <div className="grid grid-cols-2 w-full gap-2 mt-8">
          <Button label="Cancel" variant="tertiary" onClick={closeDialog} />
          <Button label="Delete" variant="danger" onClick={confirmDialog} />
        </div>
      </div>
    </dialog>
  );
}

