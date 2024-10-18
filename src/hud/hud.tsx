import { HUDSubBar } from "./hud-sub-bar";
import { HUDButton } from "./hud-button";
import { useWebScene } from "../arcgis/components/web-scene";
import { useAccessorValue } from "../arcgis/hooks/useAccessorValue";
import { useSceneView } from "../arcgis/components/scene-view";
import { Suspense, useEffect, useState } from "react";

import './hud-styles.css';
import { Toolbar } from "./toolbar/toolbar";
import { useEditor } from "../editor/editor";
import { SketchfabImport } from "../sketch-fab/sketch-fab-importer";

function Timeline() {
  const scene = useWebScene();
  const view = useSceneView();

  const slides = useAccessorValue(() => (scene.presentation.slides.map(slide => slide.id), scene.presentation.slides.toArray())) ?? [];

  return (
    <HUDSubBar>
      {slides.map(slide => (<HUDButton key={slide.id} onPress={() => {
        slide.applyTo(view)
      }}>{slide.title.text}</HUDButton>))}
    </HUDSubBar>
  );
}

export function HUD() {
  const editor = useEditor();
  const isEditing = useAccessorValue(() => editor.isActive);

  const [identityDialog, setIdentityDialog] = useState(false)
  const [observer] = useState(() => new MutationObserver(() => {
    const authPopup = document.body.querySelector(".esri-identity-modal")
    setIdentityDialog(authPopup != null);
  }));

  useEffect(() => {
    observer.observe(document.body, { childList: true })
  })

  const [selectedToolkit, setSelectedToolkit] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1 pointer-events-none">
      <Timeline />
      <SketchfabImport isActive={selectedToolkit === 'gltf' && !isEditing} />
      <Suspense>
        <Toolbar
          identityDialog={identityDialog}
          selectedToolkit={selectedToolkit}
          toggleToolkit={(toolkit) => setSelectedToolkit(selectedToolkit => selectedToolkit === toolkit ? null : toolkit)}
        />
      </Suspense>
    </div>
  );
}
