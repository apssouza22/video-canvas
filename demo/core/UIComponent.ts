import type { CompositionPreviewAPI } from '../../src/common/compositionPreviewApi';
import type { Disposable } from '../../src/common/Disposable';

export abstract class UIComponent implements Disposable {
  readonly element: HTMLElement;
  private readonly disposers: Array<() => void> = [];
  protected readonly container: HTMLElement;
  protected readonly api: CompositionPreviewAPI;

  constructor(container: HTMLElement, api: CompositionPreviewAPI) {
    this.container = container;
    this.api = api;
    this.element = this.createElement();
    this.container.append(this.element);
  }

  protected track(disposer: () => void): void {
    this.disposers.push(disposer);
  }

  /**
   * Tags a DOM node so subclasses can resolve it after construction.
   * Do not store tagged nodes on class fields — ES field initializers run after
   * `super()` and would overwrite refs assigned during `createElement()`.
   */
  protected tagRef<T extends HTMLElement>(element: T, name: string): T {
    element.dataset.uiRef = name;
    return element;
  }

  protected ref<T extends HTMLElement>(name: string): T {
    const node = this.element.querySelector<T>(`[data-ui-ref="${name}"]`);
    if (!node) {
      throw new Error(`UI ref "${name}" not found in ${this.constructor.name}`);
    }
    return node;
  }

  destroy(): void {
    while (this.disposers.length > 0) {
      this.disposers.pop()?.();
    }
    this.element.remove();
  }

  protected abstract createElement(): HTMLElement;
  protected abstract bind(): void;
}
