import { ReactNode, ComponentProps } from "react";
import { Dialog, DialogTrigger, ModalOverlay, Modal, DialogTriggerProps } from "react-aria-components";

type HUDModalProps = { trigger: ReactNode, children: ComponentProps<typeof Dialog>['children'] } & Omit<DialogTriggerProps, 'children'>;
export function HUDModal({ trigger, children, ...props }: HUDModalProps) {
  return (
    <DialogTrigger {...props}>
      {trigger}
      <ModalOverlay
        className={"fixed inset-0 z-10 overflow-y-auto bg-black/25 flex items-center justify-center px-32"}
      >
        <Modal
          className={"w-full max-w-[68vw] overflow-hidden rounded-2xl bg-white p-6"}
        >
          <Dialog role="alertdialog" className="outline-none relative">
            {children}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}