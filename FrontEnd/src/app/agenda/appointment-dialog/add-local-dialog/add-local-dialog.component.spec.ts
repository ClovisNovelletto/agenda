import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocalDialogComponent } from './add-local-dialog.component';

describe('AddLocalDialogComponent', () => {
  let component: AddLocalDialogComponent;
  let fixture: ComponentFixture<AddLocalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLocalDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLocalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
