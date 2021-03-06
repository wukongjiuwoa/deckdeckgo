import {Component, Element, Event, EventEmitter, h, Prop, State} from '@stencil/core';

import {isIPad} from '@deckdeckgo/utils';

import {TargetElement} from '../../../utils/editor/target-element';
import {ImageAction} from '../../../utils/editor/image-action';
import {ImageHelper} from '../../../helpers/editor/image.helper';

@Component({
  tag: 'app-deck-style',
  styleUrl: 'app-deck-style.scss'
})
export class AppDeck {
  @Element() el: HTMLElement;

  @Prop()
  signIn: EventEmitter<void>;

  @Prop()
  blockSlide: EventEmitter<boolean>;

  @Prop()
  deckDidChange: EventEmitter<HTMLElement>;

  @State()
  private applyToTargetElement: TargetElement = TargetElement.COLOR;

  @State()
  private moreColors: boolean = true;

  @State()
  private deckElement: HTMLElement;

  private imageHelper: ImageHelper;

  @Event() private imgDidChange: EventEmitter<HTMLElement>;

  async componentWillLoad() {
    this.moreColors = !isIPad();

    this.deckElement = document ? document.querySelector('deckgo-deck') : undefined;

    this.imageHelper = new ImageHelper(this.deckDidChange, this.blockSlide, this.signIn);
  }

  private async closePopover() {
    await (this.el.closest('ion-popover') as HTMLIonPopoverElement).dismiss();
  }

  private async selectApplyToTargetElement($event: CustomEvent<TargetElement>) {
    if ($event && $event.detail) {
      this.applyToTargetElement = $event.detail;
    }
  }

  private onColorChange() {
    this.deckDidChange.emit(this.deckElement);
  }

  private async onTransitionChange() {
    this.deckDidChange.emit(this.deckElement);

    const popover = this.el.closest('ion-popover') as HTMLIonPopoverElement;

    await popover.dismiss();
  }

  private async onImageAction($event: CustomEvent<ImageAction>) {
    if ($event && $event.detail) {
      const popover = this.el.closest('ion-popover') as HTMLIonPopoverElement;

      popover.onWillDismiss().then(async () => {
        await this.imageHelper.imageAction(this.deckElement, false, true, $event.detail);
      });

      await popover.dismiss();
    }
  }

  private onImgDidChange($event: CustomEvent<HTMLElement>) {
    if ($event && $event.detail) {
      this.imgDidChange.emit($event.detail);
    }
  }

  render() {
    return [
      <ion-toolbar>
        <h2>Deck style</h2>
        <ion-router-link slot="end" onClick={() => this.closePopover()}>
          <ion-icon name="close"></ion-icon>
        </ion-router-link>
      </ion-toolbar>,
      <app-select-target-element
        colorTarget={true}
        background={true}
        transition={true}
        fonts={true}
        onApplyTo={($event: CustomEvent<TargetElement>) => this.selectApplyToTargetElement($event)}></app-select-target-element>,

      this.renderOptions()
    ];
  }

  private renderOptions() {
    if (this.applyToTargetElement === TargetElement.COLOR) {
      return (
        <app-color-text-background
          selectedElement={this.deckElement}
          moreColors={this.moreColors}
          deck={true}
          onColorChange={() => this.onColorChange()}></app-color-text-background>
      );
    } else if (this.applyToTargetElement === TargetElement.BACKGROUND) {
      return (
        <app-image
          selectedElement={this.deckElement}
          deck={true}
          onAction={($event: CustomEvent<ImageAction>) => this.onImageAction($event)}
          onImgDidChange={($event: CustomEvent<HTMLElement>) => this.onImgDidChange($event)}></app-image>
      );
    } else if (this.applyToTargetElement === TargetElement.TRANSITION) {
      return <app-deck-transition deckElement={this.deckElement} onTransitionChange={() => this.onTransitionChange()}></app-deck-transition>;
    } else if (this.applyToTargetElement === TargetElement.FONTS) {
      return <app-deck-fonts deckElement={this.deckElement} onFontsChange={() => this.onTransitionChange()}></app-deck-fonts>;
    } else {
      return undefined;
    }
  }
}
