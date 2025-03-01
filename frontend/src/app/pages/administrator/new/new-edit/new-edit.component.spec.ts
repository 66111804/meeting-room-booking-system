import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEditComponent } from './new-edit.component';

describe('NewEditComponent', () => {
  let component: NewEditComponent;
  let fixture: ComponentFixture<NewEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
