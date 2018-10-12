import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

import {
  Observable,
} from 'rxjs';

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatSlideToggle,
} from '@angular/material';

import {
  ApiService,
  ErrorHandlerService
} from '@app/services/core';

import { Area } from '@app/models/area';

@Component({
  selector: 'app-area-dialog',
  templateUrl: './area-dialog.component.html',
  styleUrls: ['./area-dialog.component.css']
})
export class AreaDialogComponent implements OnInit {
  title: string;

  areaForm: FormGroup;
  name: FormControl;
  description: FormControl;
  location: FormControl;

  @ViewChild(MatSlideToggle) enabled: MatSlideToggle;

  constructor(public dialogRef: MatDialogRef<AreaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { area: Area, edit: boolean },
              private api: ApiService,
              private errh: ErrorHandlerService) {
    this.title = this.data.edit ? 'Editar' : 'Crear';
  }

  ngOnInit() {
    this.initForm();
  }

  initForm(): void {
    this.initFormControls();
    this.areaForm = new FormGroup({
      name: this.name,
      description: this.description,
      location: this.location,
    });
  }

  initFormControls(): void {
    this.name = new FormControl(this.data.area.name, Validators.required);
    this.description = new FormControl(this.data.area.description, Validators.required);
    this.location = new FormControl(this.data.area.location, Validators.required);
  }

  onSubmit(): void {
    const area = new Area(
      this.data.area.id,
      this.name.value,
      this.description.value,
      this.location.value,
      this.enabled.checked,
    );

    let obs: Observable<Area>;
    obs = this.data.edit ? this.api.AdminPatchArea(area) : this.api.AdminPostArea(area);

    obs.subscribe(
      (a) => {
        console.log(a);
        this.dialogRef.close();
      },
      (err) => this.errh.HandleError(err)
    );
  }
}
