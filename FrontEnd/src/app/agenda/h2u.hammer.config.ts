import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

@Injectable()
export class H2uHammerConfig extends HammerGestureConfig {
  override overrides = <any>{
    swipe: {
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 50,      // precisa mover um pouco mais o dedo
      velocity: 0.3       // precisa um pouco mais de velocidade
    },
    pan: {
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 30        // ignora micro movimentos
    }
  };
}
