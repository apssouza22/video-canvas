import type { CompositionCanvasAPI } from '../src/domains/canvas/compositionCanvasApi';
import { ImageClip, TextClip, VideoClip } from '../src/domains/canvas/clips';
import { SAMPLE_VIDEO_SRC } from '../src/domains/canvas/constants';
import type { CanvasElementType } from '../src/domains/canvas/types';
import { UIComponent } from './core/UIComponent';

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

export class CanvasToolbar extends UIComponent {
  constructor(container: HTMLElement, api: CompositionCanvasAPI) {
    super(container, api);
    this.bind();
  }

  protected createElement(): HTMLElement {
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

    const forwardBtn = this.tagRef(createButton('Forward'), 'forward');
    const backwardBtn = this.tagRef(createButton('Backward'), 'backward');
    const deleteBtn = this.tagRef(createButton('Delete'), 'delete');

    const imageInput = this.tagRef(document.createElement('input'), 'image-input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.hidden = true;

    const videoInput = this.tagRef(document.createElement('input'), 'video-input');
    videoInput.type = 'file';
    videoInput.accept = 'video/*';
    videoInput.hidden = true;

    addGroup.append(addLabel, textBtn, imageBtn, videoBtn, sampleVideoBtn);
    layerGroup.append(layerLabel, forwardBtn, backwardBtn, deleteBtn);
    toolbar.append(addGroup, layerGroup, imageInput, videoInput);

    textBtn.addEventListener('click', () => this.addByType('text'));
    imageBtn.addEventListener('click', () => imageInput.click());
    videoBtn.addEventListener('click', () => videoInput.click());
    sampleVideoBtn.addEventListener('click', () => this.addByType('video'));

    return toolbar;
  }

  protected bind(): void {
    const imageInput = this.ref<HTMLInputElement>('image-input');
    const videoInput = this.ref<HTMLInputElement>('video-input');
    const forwardBtn = this.ref<HTMLButtonElement>('forward');
    const backwardBtn = this.ref<HTMLButtonElement>('backward');
    const deleteBtn = this.ref<HTMLButtonElement>('delete');

    imageInput.addEventListener('change', () => {
      this.handleFile('image', imageInput.files?.[0]);
      imageInput.value = '';
    });

    videoInput.addEventListener('change', () => {
      this.handleFile('video', videoInput.files?.[0]);
      videoInput.value = '';
    });

    forwardBtn.addEventListener('click', () => {
      const selected = this.api.getSelectedElement();
      if (selected) {
        this.api.bringForward(selected.id);
      }
    });

    backwardBtn.addEventListener('click', () => {
      const selected = this.api.getSelectedElement();
      if (selected) {
        this.api.sendBackward(selected.id);
      }
    });

    deleteBtn.addEventListener('click', () => {
      const selected = this.api.getSelectedElement();
      if (selected) {
        this.api.removeElement(selected.id);
      }
    });

    this.track(this.api.on('state:changed', () => this.updateLayerButtons()));
    this.updateLayerButtons();
  }

  private addByType(type: CanvasElementType, src?: string): void {
    const startTime = this.api.getCurrentTime();

    if (type === 'text') {
      this.api.addLayer(new TextClip('Double-click style editing in the panel →', startTime));
      return;
    }

    if (type === 'video') {
      this.api.addLayer(new VideoClip(src ?? SAMPLE_VIDEO_SRC, startTime));
      return;
    }

    this.api.addLayer(new ImageClip(src ?? '', startTime));
  }

  private handleFile(type: 'image' | 'video', file: File | undefined): void {
    if (!file) {
      return;
    }
    this.addByType(type, URL.createObjectURL(file));
  }

  private updateLayerButtons(): void {
    const hasSelection = this.api.getSelectedElement() !== null;
    this.ref<HTMLButtonElement>('forward').disabled = !hasSelection;
    this.ref<HTMLButtonElement>('backward').disabled = !hasSelection;
    this.ref<HTMLButtonElement>('delete').disabled = !hasSelection;
  }
}
