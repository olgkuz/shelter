import {
  AfterViewChecked,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit, OnChanges, AfterViewChecked {
  // CSS selector for child items inside the host that can become "active".
  @Input() selector = '';

  // If true, makes the first matched item active once the view is ready.
  @Input() initFirst = false;

  // If true, enables ArrowLeft/ArrowRight navigation + Enter emit.
  @Input() enableKeys = false;

  // CSS class applied to the active item.
  @Input() activeClass = 'active';

  @Output() renderComplete = new EventEmitter<void>();
  @Output() onEnter = new EventEmitter<number>();

  private index = 0;
  private isLoaded = false;
  private activeEl: Element | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  get activeIndex(): number {
    return this.index;
  }

  ngOnInit(): void {}

  ngOnChanges(_changes: SimpleChanges): void {
    // If the selector changes, ensure stale "active" class is removed.
    this.clearActive();
    this.isLoaded = false;
    this.index = 0;
  }

  ngAfterViewChecked(): void {
    const items = this.getItems();

    if (this.initFirst && items.length && !this.isLoaded) {
      this.isLoaded = true;
      this.setActive(items[0]);
      this.renderComplete.emit();
    }
  }

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent): void {
    const target = this.closestItem(event.target);
    if (!target) return;
    this.setActive(target);
  }

  @HostListener('focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    const target = this.closestItem(event.target);
    if (!target) return;
    this.setActive(target);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.clearActive();
  }

  @HostListener('document:keyup', ['$event'])
  initKeyUp(event: KeyboardEvent): void {
    if (!this.enableKeys) return;

    if (event.key === 'ArrowRight') {
      this.changeIndex(1);
    } else if (event.key === 'ArrowLeft') {
      this.changeIndex(-1);
    } else if (event.key === 'Enter') {
      this.onEnter.emit(this.index);
    }
  }

  changeIndex(shift: -1 | 1 | 0): void {
    const items = this.getItems();
    if (!items.length) return;

    const currentIndex = this.activeEl ? items.indexOf(this.activeEl) : -1;
    this.index = currentIndex === -1 ? 0 : currentIndex;

    // Remove previous active class.
    items[this.index].classList.remove(this.activeClass);

    this.index += shift;

    if (this.index < 0) this.index = items.length - 1;
    if (this.index > items.length - 1) this.index = 0;

    this.activeEl = items[this.index];
    this.activeEl.classList.add(this.activeClass);

    (this.activeEl as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  private getItems(): Element[] {
    if (!this.selector) return [];
    return Array.from(this.el.nativeElement.querySelectorAll(this.selector));
  }

  private closestItem(target: EventTarget | null): Element | null {
    if (!this.selector) return null;
    if (!(target instanceof Element)) return null;

    const item = target.closest(this.selector);
    if (!item) return null;

    // Ensure the match belongs to this directive host.
    if (!this.el.nativeElement.contains(item)) return null;

    return item;
  }

  private setActive(item: Element): void {
    const items = this.getItems();
    const idx = items.indexOf(item);
    if (idx !== -1) this.index = idx;

    if (this.activeEl && this.activeEl !== item) {
      this.activeEl.classList.remove(this.activeClass);
    }

    this.activeEl = item;
    this.activeEl.classList.add(this.activeClass);
  }

  private clearActive(): void {
    if (!this.activeEl) return;
    this.activeEl.classList.remove(this.activeClass);
    this.activeEl = null;
  }

}
