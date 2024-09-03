import { Button, Heading } from "react-aria-components"
import { HUDModal } from "../hud-modal";
import { HUDEndButton } from "../hud-button";

export function Submission() {
  return (
    <HUDModal
      trigger={
        <HUDEndButton>
          Submit plan
        </HUDEndButton>
      }
    >
      {({ close }) => (
        <div className="flex gap-6">
          <figure className="flex-none w-48 relative -my-6 -ms-6 flex items-end">
            <img className="absolute inset-0 w-full h-full object-cover" src="https://www.arcgis.com/sharing/rest/content/items/bceae470c9a04e5bb3ad42323c726c97/info/thumbnail/thumbnail1556108667093.png?f=json&w=400" />
            <figcaption className="bg-white/60 py-2 px-4 w-full">Dumbo, Brooklyn NY</figcaption>
          </figure>
          <div className="flex flex-col gap-2">
            <Heading slot="title" className="text-xl">Participatory planning</Heading>
            <ul className="list-disc ps-6">
              <li>When creating shapes, either double click or press <pre className="inline">C</pre> to complete.</li>
              <li>Press <pre className="inline">Del</pre> or <pre className="inline">Backspace</pre> to remove a selected object.</li>
              <li>Press <pre className="inline">Escape</pre> to revert a current editing.</li>
            </ul>
            <div className="flex gap-4">
              <Button onPress={close}>
                Start planning
              </Button>
              <Button onPress={close}>
                Skip animation
              </Button>
            </div>
          </div>
        </div>
      )}
    </HUDModal>
  )
}