import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOpportunitiesComponent } from './admin-opportunities-component.component';

describe('AdminOpportunitiesComponent', () => {
  let component: AdminOpportunitiesComponent;
  let fixture: ComponentFixture<AdminOpportunitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOpportunitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
