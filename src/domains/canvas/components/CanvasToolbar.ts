import type { CompositionCanvasAPI } from '../compositionCanvasApi';
import type { CanvasElementType } from '../types';

const panelClass =
  'flex flex-col gap-3 p-3.5 border border-vc-border rounded-xl bg-white/[0.02]';
const groupClass = 'flex flex-wrap gap-2 items-center';
const labelClass = 'w-full text-vc-muted text-xs uppercase tracking-wide';
const buttonClass =
  'border border-vc-border rounded-lg px-3 py-1.5 bg-[#1f2430] text-vc-text cursor-pointer hover:border-vc-accent hover:bg-[#243149] disabled:opacity-45 disabled:cursor-not-allowed';

function createButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = buttonClass;
  button.textContent = label;
  return button;
}

export function mountCanvasToolbar(container: HTMLElement, api: CompositionCanvasAPI): () => void {
  const toolbar = document.createElement('div');
  toolbar.className = panelClass;

  const addGroup = document.createElement('div');
  addGroup.className = groupClass;
  const addLabel = document.createElement('span');
  addLabel.className = labelClass;
  addLabel.textContent = 'Add';

  const textBtn = createButton('Text');
  const imageBtn = createButton('Image');
  const videoBtn = createButton('Video');
  const sampleVideoBtn = createButton('Sample Video');

  const layerGroup = document.createElement('div');
  layerGroup.className = groupClass;
  const layerLabel = document.createElement('span');
  layerLabel.className = labelClass;
  layerLabel.textContent = 'Layer';

  const forwardBtn = createButton('Forward');
  const backwardBtn = createButton('Backward');
  const deleteBtn = createButton('Delete');

  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.accept = 'image/*';
  imageInput.hidden = true;

  const videoInput = document.createElement('input');
  videoInput.type = 'file';
  videoInput.accept = 'video/*';
  videoInput.hidden = true;

  addGroup.append(addLabel, textBtn, imageBtn, videoBtn, sampleVideoBtn);
  layerGroup.append(layerLabel, forwardBtn, backwardBtn, deleteBtn);
  toolbar.append(addGroup, layerGroup, imageInput, videoInput);
  container.append(toolbar);

  const addByType = (type: CanvasElementType, src?: string) => {
    api.addMedia({ type, src });
  };

  const handleFile = (type: 'image' | 'video', file: File | undefined) => {
    if (!file) {
      return;
    }
    addByType(type, URL.createObjectURL(file));
  };

  textBtn.addEventListener('click', () => addByType('text'));
  imageBtn.addEventListener('click', () => imageInput.click());
  videoBtn.addEventListener('click', () => videoInput.click());
  sampleVideoBtn.addEventListener('click', () => addByType('video'));

  imageInput.addEventListener('change', () => {
    handleFile('image', imageInput.files?.[0]);
    imageInput.value = '';
  });

  videoInput.addEventListener('change', () => {
    handleFile('video', videoInput.files?.[0]);
    videoInput.value = '';
  });

  forwardBtn.addEventListener('click', () => {
    const selected = api.getSelectedElement();
    if (selected) {
      api.bringForward(selected.id);
    }
  });

  backwardBtn.addEventListener('click', () => {
    const selected = api.getSelectedElement();
    if (selected) {
      api.sendBackward(selected.id);
    }
  });

  deleteBtn.addEventListener('click', () => {
    const selected = api.getSelectedElement();
    if (selected) {
      api.removeElement(selected.id);
    }
  });

  const updateLayerButtons = () => {
    const hasSelection = api.getSelectedElement() !== null;
    forwardBtn.disabled = !hasSelection;
    backwardBtn.disabled = !hasSelection;
    deleteBtn.disabled = !hasSelection;
  };

  const unsubscribe = api.on('state:changed', updateLayerButtons);
  updateLayerButtons();

  return () => {
    unsubscribe();
    toolbar.remove();
  };
}
