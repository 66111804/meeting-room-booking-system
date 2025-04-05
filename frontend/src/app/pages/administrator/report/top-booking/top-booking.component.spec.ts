import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBookingComponent } from './top-booking.component';

describe('TopBookingComponent', () => {
  let component: TopBookingComponent;
  let fixture: ComponentFixture<TopBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
