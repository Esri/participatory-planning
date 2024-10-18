import { ReactNode, ComponentProps } from "react";
import { Dialog, DialogTrigger, ModalOverlay, Modal, DialogTriggerProps } from "react-aria-components";

type HUDModalProps = {
  trigger: ReactNode,
  overlayOpacity?: number;
  children: ComponentProps<typeof Dialog>['children'];
} & Omit<DialogTriggerProps, 'children'>;
export function HUDModal({ trigger, children, ...props }: HUDModalProps) {
  return (
    <DialogTrigger {...props}>
      {trigger}
      <ModalOverlay
        style={{ '--overlay-opacity': props.overlayOpacity ?? 0.25 }}
        className="fixed inset-0 z-10 overflow-y-auto bg-black flex items-center justify-center px-32 transition-colors bg-opacity-[var(--overlay-opacity)]"
      >
        <Modal
          className={"overflow-hidden rounded-2xl bg-white p-6"}
        >
          <Dialog role="alertdialog" className="outline-none relative">
            {children}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

export function ScreenshotModal({ trigger, children, ...props }: HUDModalProps & { isDismissisable?: boolean }) {
  return (
    <DialogTrigger {...props}>
      {trigger}
      <ModalOverlay
        isDismissable={props.isDismissisable}
        style={{ '--overlay-opacity': props.overlayOpacity ?? 0.25 }}
        className="fixed inset-0 z-10 overflow-y-auto bg-black flex items-center justify-center px-32 transition-colors duration-500 bg-opacity-[var(--overlay-opacity)] pb-10 pt-10"
      >
        <Modal
          isDismissable={props.isDismissisable}
          className={"overflow-hidden rounded-2xl bg-white p-6 max-h-full aspect-square flex"}
        >
          <Dialog role="alertdialog" className="contents">
            {children}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}