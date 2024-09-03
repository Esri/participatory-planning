import { ReactNode, ComponentProps } from "react";
import { Dialog, DialogTrigger, ModalOverlay, Modal, DialogTriggerProps } from "react-aria-components";

type HUDModalProps = { trigger: ReactNode, children: ComponentProps<typeof Dialog>['children'] } & Omit<DialogTriggerProps, 'children'>;
export function HUDModal({ trigger, children, ...props }: HUDModalProps) {
  return (
    <DialogTrigger {...props}>
      {trigger}
      <ModalOverlay
        className={({ isEntering, isExiting }) => `
          fixed inset-0 z-10 overflow-y-auto bg-black/25 flex items-center justify-center px-32
          ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
          ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
        `}
      >
        <Modal
          className={({ isEntering, isExiting }) => `
            w-full max-w-[68vw] overflow-hidden rounded-2xl bg-white p-6
            ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
            ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
          `}
        >
          <Dialog role="alertdialog" className="outline-none relative">
            {children}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}