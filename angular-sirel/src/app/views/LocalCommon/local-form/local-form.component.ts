import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatSlideToggle, MatCheckboxChange, MatSelectChange } from '@angular/material';

import {
  ApiService,
  ErrorHandlerService,
} from '@app/services/core';

import {
  Local,
  Area,
  WorkingTimeUtil,
  WorkingMonth,
  WorkingWeekDay,
} from '@app/models/core';

@Component({
  selector: 'app-local-form',
  templateUrl: './local-form.component.html',
  styleUrls: ['./local-form.component.css']
})
export class LocalFormComponent implements OnInit {

  @Input() local: Local;
  @Input() localArea: Area;
  @Input() edit: boolean;
  @Output() editLocalChange = new EventEmitter<Local>();

  title: string;

  opts: Area[] = [];
  private loadingAreasSubject = new BehaviorSubject<boolean>(false);
  private loadingAreas: Observable<boolean>;

  localForm: FormGroup;
  name: FormControl;
  description: FormControl;
  location: FormControl;
  area: FormControl;
  workingBeginTimeHours: FormControl;
  workingBeginTimeMinutes: FormControl;
  workingEndTimeHours: FormControl;
  workingEndTimeMinutes: FormControl;
  @ViewChild(MatSlideToggle) enabled: MatSlideToggle;

  workingTimeUtil = new WorkingTimeUtil();
  wds: WorkingWeekDay[] = [];
  wms: WorkingMonth[] = [];

  constructor(private api: ApiService,
              private errh: ErrorHandlerService) {
    this.loadingAreas = this.loadingAreasSubject.asObservable();
  }

  ngOnInit() {
    this.title = this.edit ? 'Editar' : 'Crear';
    this.wds = this.workingTimeUtil.GetWorkingWeekDays( this.local.WorkingWeekDays );
    this.wms = this.workingTimeUtil.GetWorkingMonths( this.local.WorkingMonths );
    this.loadAreas();
    this.initForm();
  }

  initForm() {
    this.initFormControls();
    this.localForm = new FormGroup({
      area: this.area,
      name: this.name,
      description : this.description,
      location : this.location,
      wbth: this.workingBeginTimeHours,
      wbtm: this.workingBeginTimeMinutes,
      weth: this.workingEndTimeHours,
      wetm: this.workingEndTimeMinutes,
    });
  }

  initFormControls() {
    this.area = new FormControl(
      {
        value: this.local.AreaID,
        disabled: this.edit,
      },
      this.local.AreaIDValidators
    );
    this.name = new FormControl(this.local.Name, this.local.NameValidators);
    this.description = new FormControl(this.local.Description,
      this.local.DescriptionValidators);
    this.location = new FormControl(this.local.Location, this.local.LocationValidators);
    this.workingBeginTimeHours = new FormControl(
      this.local.WorkingBeginTimeHours,
      this.local.WorkingBeginTimeHoursValidators,
    );
    this.workingBeginTimeMinutes = new FormControl(
      this.local.WorkingBeginTimeMinutes,
      this.local.WorkingBeginTimeMinutesValidators,
    );
    this.workingEndTimeHours = new FormControl(
      this.local.WorkingEndTimeHours,
      this.local.WorkingEndTimeHoursValidators,
    );
    this.workingEndTimeMinutes = new FormControl(
      this.local.WorkingEndTimeMinutes,
      this.local.WorkingEndTimeMinutesValidators
    );
  }

  onSubmit() {
    const local = new Local(
      this.local.ID,
      Number(this.area.value),
      this.name.value,
      this.description.value,
      this.location.value,
      this.workingTimeUtil.GetWorkingMonthsConfig(this.wms),
      this.workingTimeUtil.GetWorkingWeekDaysConfig(this.wds),
      Number(this.workingBeginTimeHours.value),
      Number(this.workingBeginTimeMinutes.value),
      Number(this.workingEndTimeHours.value),
      Number(this.workingEndTimeMinutes.value),
      this.enabled.checked,
    );
    let obs: Observable<Local>;
    obs = this.edit ? this.api.AdminPatchLocal(local) : this.api.AdminPostLocal(local);

    obs.subscribe(
      (data) => {
        this.editLocalChange.emit(data);
      },
      (err) => this.errh.HandleError(err)
    );
  }

  loadAreas(): void {
    if (!this.edit) {
      this.loadingAreasSubject.next(true);
      this.api.AdminGetAreasList().subscribe(
        (areas) => {
          this.opts = areas;
          this.loadingAreasSubject.next(false);
        },
        (err) => {
          this.errh.HandleError(err);
        }
      );
    } else {
      this.opts = [this.localArea];
    }
  }

  ChangeWorkingMonthStatus(wm: WorkingMonth, event: MatCheckboxChange) {
    wm.working = event.checked;
  }

  ChangeWorkingWeekDayStatus(wd: WorkingWeekDay, event: MatCheckboxChange) {
    wd.working = event.checked;
  }

  ChangeNeedConfirmation(wd: WorkingWeekDay, event: MatSelectChange) {
    wd.needConfirmation = (event.value === 'true');
  }
}