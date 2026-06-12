import type { CompositionCanvasAPI } from '../compositionCanvasApi';
import type { CanvasElement } from '../types';

const panelClass =
  'flex flex-col gap-3 p-3.5 border border-vc-border rounded-xl bg-white/[0.02]';
const labelClass = 'flex flex-col gap-1.5 text-[0.8rem] text-vc-muted';
const inputClass =
  'border border-vc-border rounded-lg px-2.5 py-2 bg-[#11151d] text-vc-text';
const checkboxClass = 'flex-row items-center';

export function mountElementProperties(container: HTMLElement, api: CompositionCanvasAPI): () => void {
  const panel = document.createElement('div');
  panel.className = panelClass;
  container.append(panel);

  let mountedId: string | null = null;

  const syncTransformFields = (element: CanvasElement) => {
    const setValue = (field: string, value: number) => {
      const input = panel.querySelector<HTMLInputElement>(`[data-field="${field}"]`);
      if (input && document.activeElement !== input) {
        input.value = String(Math.round(value));
      }
    };

    setValue('x', element.x);
    setValue('y', element.y);
    setValue('width', element.width);
    setValue('height', element.height);
    setValue('rotation', element.rotation);
  };

  const render = () => {
    const selected = api.getSelectedElement();

    if (!selected) {
      mountedId = null;
      panel.innerHTML = `
        <h2 class="m-0 text-base">Properties</h2>
        <p class="m-0 text-vc-muted text-sm">Select an element on the canvas to edit its properties.</p>
      `;
      return;
    }

    if (selected.id !== mountedId) {
      mountedId = selected.id;
      panel.replaceChildren(buildPropertiesForm(selected, api));
      return;
    }

    syncTransformFields(selected);
  };

  const unsubscribe = api.on('state:changed', render);
  render();

  return () => {
    unsubscribe();
    panel.remove();
  };
}

function buildPropertiesForm(element: CanvasElement, api: CompositionCanvasAPI): DocumentFragment {
  const fragment = document.createDocumentFragment();

  const title = document.createElement('h2');
  title.className = 'm-0 text-base';
  title.textContent = element.name;

  const type = document.createElement('p');
  type.className = 'm-0 text-vc-accent text-xs uppercase tracking-wider';
  type.textContent = element.type;

  const nameLabel = createLabel('Name');
  const nameInput = document.createElement('input');
  nameInput.className = inputClass;
  nameInput.value = element.name;
  nameInput.addEventListener('input', () => {
    api.updateElement(element.id, { name: nameInput.value });
  });
  nameLabel.append(nameInput);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-2.5';
  grid.append(
    createNumberField('X', 'x', element.x, (value) => api.updateElement(element.id, { x: value })),
    createNumberField('Y', 'y', element.y, (value) => api.updateElement(element.id, { y: value })),
    createNumberField('Width', 'width', element.width, (value) =>
      api.updateElement(element.id, { width: value }),
    ),
    createNumberField('Height', 'height', element.height, (value) =>
      api.updateElement(element.id, { height: value }),
    ),
    createNumberField('Rotation', 'rotation', element.rotation, (value) =>
      api.updateElement(element.id, { rotation: value }),
    ),
  );

  fragment.append(title, type, nameLabel, grid);

  if (element.type === 'text') {
    const contentLabel = createLabel('Content');
    const contentInput = document.createElement('textarea');
    contentInput.className = inputClass;
    contentInput.rows = 3;
    contentInput.value = element.content;
    contentInput.addEventListener('input', () => {
      api.updateElement(element.id, { content: contentInput.value });
    });
    contentLabel.append(contentInput);

    const fontSizeLabel = createLabel('Font size');
    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'number';
    fontSizeInput.className = inputClass;
    fontSizeInput.value = String(element.fontSize);
    fontSizeInput.addEventListener('input', () => {
      api.updateElement(element.id, { fontSize: Number(fontSizeInput.value) });
    });
    fontSizeLabel.append(fontSizeInput);

    const colorLabel = createLabel('Color');
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = inputClass;
    colorInput.value = element.color;
    colorInput.addEventListener('input', () => {
      api.updateElement(element.id, { color: colorInput.value });
    });
    colorLabel.append(colorInput);

    const alignLabel = createLabel('Align');
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
      api.updateElement(element.id, {
        textAlign: alignSelect.value as 'left' | 'center' | 'right',
      });
    });
    alignLabel.append(alignSelect);

    fragment.append(contentLabel, fontSizeLabel, colorLabel, alignLabel);
  }

  if (element.type === 'image') {
    const fitLabel = createLabel('Fit');
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
      api.updateElement(element.id, {
        objectFit: fitSelect.value as 'cover' | 'contain' | 'fill',
      });
    });
    fitLabel.append(fitSelect);
    fragment.append(fitLabel);
  }

  if (element.type === 'video') {
    fragment.append(
      createCheckbox('Muted', element.muted, (checked) =>
        api.updateElement(element.id, { muted: checked }),
      ),
      createCheckbox('Loop', element.loop, (checked) =>
        api.updateElement(element.id, { loop: checked }),
      ),
    );
  }

  return fragment;
}

function createLabel(text: string): HTMLLabelElement {
  const label = document.createElement('label');
  label.className = labelClass;
  label.textContent = text;
  return label;
}

function createNumberField(
  label: string,
  field: string,
  value: number,
  onChange: (value: number) => void,
): HTMLLabelElement {
  const fieldLabel = createLabel(label);
  const input = document.createElement('input');
  input.type = 'number';
  input.className = inputClass;
  input.dataset.field = field;
  input.value = String(Math.round(value));
  input.addEventListener('input', () => onChange(Number(input.value)));
  fieldLabel.append(input);
  return fieldLabel;
}

function createCheckbox(
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): HTMLLabelElement {
  const field = createLabel(label);
  field.classList.add(checkboxClass);
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  field.prepend(input);
  return field;
}
