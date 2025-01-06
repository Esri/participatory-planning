/* Copyright 2024 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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