import type { CompositionCanvasAPI } from '../compositionCanvasApi';
import { UIComponent } from '../core/UIComponent';
import type { CanvasElement } from '../types';

const panelClass =
  'flex flex-col gap-3 p-3.5 border border-vc-border rounded-xl bg-white/[0.02]';
const labelClass = 'flex flex-col gap-1.5 text-[0.8rem] text-vc-muted';
const inputClass =
  'border border-vc-border rounded-lg px-2.5 py-2 bg-[#11151d] text-vc-text';
const checkboxClass = 'flex-row items-center';

export class ElementPropertiesPanel extends UIComponent {
  constructor(container: HTMLElement, api: CompositionCanvasAPI) {
    super(container, api);
    this.bind();
  }

  private mountedId: string | null = null;

  protected createElement(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = panelClass;
    return panel;
  }

  protected bind(): void {
    this.track(this.api.on('state:changed', () => this.render()));
    this.render();
  }

  private render(): void {
    const selected = this.api.getSelectedElement();

    if (!selected) {
      this.mountedId = null;
      this.element.innerHTML = `
        <h2 class="m-0 text-base">Properties</h2>
        <p class="m-0 text-vc-muted text-sm">Select an element on the canvas to edit its properties.</p>
      `;
      return;
    }

    if (selected.id !== this.mountedId) {
      this.mountedId = selected.id;
      this.element.replaceChildren(this.buildPropertiesForm(selected));
      return;
    }

    this.syncTransformFields(selected);
  }

  private syncTransformFields(element: CanvasElement): void {
    const setValue = (field: string, value: number) => {
      const input = this.element.querySelector<HTMLInputElement>(`[data-field="${field}"]`);
      if (input && document.activeElement !== input) {
        input.value = String(Math.round(value));
      }
    };

    setValue('x', element.x);
    setValue('y', element.y);
    setValue('width', element.width);
    setValue('height', element.height);
    setValue('rotation', element.rotation);
  }

  private buildPropertiesForm(element: CanvasElement): DocumentFragment {
    const fragment = document.createDocumentFragment();

    const title = document.createElement('h2');
    title.className = 'm-0 text-base';
    title.textContent = element.name;

    const type = document.createElement('p');
    type.className = 'm-0 text-vc-accent text-xs uppercase tracking-wider';
    type.textContent = element.type;

    const nameLabel = this.createLabel('Name');
    const nameInput = document.createElement('input');
    nameInput.className = inputClass;
    nameInput.value = element.name;
    nameInput.addEventListener('input', () => {
      this.api.updateElement(element.id, { name: nameInput.value });
    });
    nameLabel.append(nameInput);

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-2.5';
    grid.append(
      this.createNumberField('X', 'x', element.x, (value) =>
        this.api.updateElement(element.id, { x: value }),
      ),
      this.createNumberField('Y', 'y', element.y, (value) =>
        this.api.updateElement(element.id, { y: value }),
      ),
      this.createNumberField('Width', 'width', element.width, (value) =>
        this.api.updateElement(element.id, { width: value }),
      ),
      this.createNumberField('Height', 'height', element.height, (value) =>
        this.api.updateElement(element.id, { height: value }),
      ),
      this.createNumberField('Rotation', 'rotation', element.rotation, (value) =>
        this.api.updateElement(element.id, { rotation: value }),
      ),
    );

    fragment.append(title, type, nameLabel, grid);

    if (element.type === 'text') {
      fragment.append(...this.buildTextFields(element));
    }

    if (element.type === 'image') {
      fragment.append(this.buildImageFields(element));
    }

    if (element.type === 'video') {
      fragment.append(
        this.createCheckbox('Muted', element.muted, (checked) =>
          this.api.updateElement(element.id, { muted: checked }),
        ),
        this.createCheckbox('Loop', element.loop, (checked) =>
          this.api.updateElement(element.id, { loop: checked }),
        ),
      );
    }

    return fragment;
  }

  private buildTextFields(element: Extract<CanvasElement, { type: 'text' }>): HTMLElement[] {
    const contentLabel = this.createLabel('Content');
    const contentInput = document.createElement('textarea');
    contentInput.className = inputClass;
    contentInput.rows = 3;
    contentInput.value = element.content;
    contentInput.addEventListener('input', () => {
      this.api.updateElement(element.id, { content: contentInput.value });
    });
    contentLabel.append(contentInput);

    const fontSizeLabel = this.createLabel('Font size');
    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'number';
    fontSizeInput.className = inputClass;
    fontSizeInput.value = String(element.fontSize);
    fontSizeInput.addEventListener('input', () => {
      this.api.updateElement(element.id, { fontSize: Number(fontSizeInput.value) });
    });
    fontSizeLabel.append(fontSizeInput);

    const colorLabel = this.createLabel('Color');
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = inputClass;
    colorInput.value = element.color;
    colorInput.addEventListener('input', () => {
      this.api.updateElement(element.id, { color: colorInput.value });
    });
    colorLabel.append(colorInput);

    const alignLabel = this.createLabel('Align');
    const alignSelect = document.createElement('select');
    alignSelect.className = inputClass;
    for (const option of ['left', 'center', 'right'] as const) {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
      alignSelect.append(opt);
    }
    alignSelect.value = element.textAlign;
    alignSelect.addEventListener('change', () => {
      this.api.updateElement(element.id, {
        textAlign: alignSelect.value as 'left' | 'center' | 'right',
      });
    });
    alignLabel.append(alignSelect);

    return [contentLabel, fontSizeLabel, colorLabel, alignLabel];
  }

  private buildImageFields(element: Extract<CanvasElement, { type: 'image' }>): HTMLElement {
    const fitLabel = this.createLabel('Fit');
    const fitSelect = document.createElement('select');
    fitSelect.className = inputClass;
    for (const option of ['cover', 'contain', 'fill'] as const) {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
      fitSelect.append(opt);
    }
    fitSelect.value = element.objectFit;
    fitSelect.addEventListener('change', () => {
      this.api.updateElement(element.id, {
        objectFit: fitSelect.value as 'cover' | 'contain' | 'fill',
      });
    });
    fitLabel.append(fitSelect);
    return fitLabel;
  }

  private createLabel(text: string): HTMLLabelElement {
    const label = document.createElement('label');
    label.className = labelClass;
    label.textContent = text;
    return label;
  }

  private createNumberField(
    label: string,
    field: string,
    value: number,
    onChange: (value: number) => void,
  ): HTMLLabelElement {
    const fieldLabel = this.createLabel(label);
    const input = document.createElement('input');
    input.type = 'number';
    input.className = inputClass;
    input.dataset.field = field;
    input.value = String(Math.round(value));
    input.addEventListener('input', () => onChange(Number(input.value)));
    fieldLabel.append(input);
    return fieldLabel;
  }

  private createCheckbox(
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
  ): HTMLLabelElement {
    const field = this.createLabel(label);
    field.classList.add(checkboxClass);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));
    field.prepend(input);
    return field;
  }
}

/** @deprecated Use the `ElementPropertiesPanel` class instead. */
export function mountElementProperties(
  container: HTMLElement,
  api: CompositionCanvasAPI,
): () => void {
  const panel = new ElementPropertiesPanel(container, api);
  return () => panel.destroy();
}
