import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';
import { DiffCompareService } from "./diffcompare.service";
import { ToastrManager } from 'ng6-toastr-notifications';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { NgbDropdownConfig, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-diff-compare',
  templateUrl: './diff-compare.component.html',
  styleUrls: ['./diff-compare.component.css']
})
export class DiffCompareComponent implements OnInit {
  @ViewChildren(NgbDropdown) dropdowns: QueryList<NgbDropdown>;
  @Input() dataSourceID: string;
  versionList = [];
  versionListState = {
    isSuccess : false,
    isLoading : false,
  }
  fieldMapping = {
    version0: [],
    version1: [],
    isSuccess: false,
    isLoading: false
  }
  isComparisonAvailable = false;
  isCompare = false;
  selected = {
    version0: '',
    version1: ''
  }
  comparisonMatrix: any;
  selectedAction = {
    list: [],
    name: ''
  };
  constructor(
    private _diffcompareSerivce: DiffCompareService,
    public toastr: ToastrManager,
    private spinner: Ng4LoadingSpinnerService,
    private ngbDropDownConfig: NgbDropdownConfig,
  ) { 
    this.ngbDropDownConfig.autoClose = 'outside';
  }

  ngOnInit() {
    // this.dataSourceID = '1d460c87-b3fb-4a12-b212-6088359efa06';
    this.spinner.show();
    this.versionListState.isLoading = true;
    this._diffcompareSerivce.getDataSourceVersion(this.dataSourceID).subscribe((resp) => {
      if (resp) {
        this.versionList = resp.body;
        this.spinner.hide();
      }
    }, (error) => {
      this.toastr.errorToastr(
        "to load versions for the Data Set",
        "Failed",
        { position: "bottom-right", showCloseButton: true }
      );
      this.versionListState.isLoading = false;
      this.spinner.hide();
    }, () => {
      this.versionListState.isLoading = false;
      this.spinner.hide();
    })


  }

  selectVersion(version: string, keyvers: string): void {
    this.selected[keyvers] = version;
    if (this.selected.version1 === this.selected.version0) {
      this.selected[keyvers] = '';
      this.toastr.errorToastr('Please select a different version',
        'Same version',
        { position: "bottom-right", showCloseButton: true });
    } else {
      this.dropdowns.toArray().forEach(el => {
        el.close();
      });
      this.getFieldMappings(this.selected[keyvers], keyvers);
    }

  }

  getFieldMappings(version: string,versionName?:string): void {

    this.spinner.show();
    this.isCompare = false;
    this.isComparisonAvailable = false;
    this.fieldMapping.isSuccess = false;
    // forkJoin(
    //   [this._exploreTagSerivce.getDataSourceVersionFieldMapping(this.dataSourceID, this.selected.version0),
    //   this._exploreTagSerivce.getDataSourceVersionFieldMapping(this.dataSourceID, this.selected.version1)]).subscribe(resp => {
    //     this.fieldMapping.version0 = resp[0].body;
    //     this.fieldMapping.version1 = resp[1].body;
    //     this.fieldMapping.isSuccess = true;
    //   }, (error) => {
    //     this.toastr.errorToastr("Failed to load field mappings for the versions " +
    //       this.selected.version0 + " and " + this.selected.version1,
    //       "Unsuccessful",
    //       { position: "bottom-right", showCloseButton: true })
    //     this.spinner.hide();
    //   }, () => {
    //     this.spinner.hide();
    //   });
    const clearAction = (fieldMappings: object[]): object[] => {
      if (fieldMappings) {
        if (fieldMappings.length !== 0) {
          fieldMappings.forEach(elem => {
            elem['action'] = '';
          })
        }
      }
      return fieldMappings;
    }
    this.fieldMapping.version0['listOfFieldMapping'] = clearAction(this.fieldMapping.version0['listOfFieldMapping'])
    this.fieldMapping.version1['listOfFieldMapping'] = clearAction(this.fieldMapping.version1['listOfFieldMapping'])

    this._diffcompareSerivce.getDataSourceVersionFieldMapping(this.dataSourceID, version).
    subscribe(resp => {
      this.fieldMapping[versionName] = resp.body;
      this.fieldMapping.isSuccess = true;
    }, (error) => {
      this.toastr.errorToastr("Failed to load field mappings for the version " +
        version,
        "Unsuccessful",
        { position: "bottom-right", showCloseButton: true })
      this.spinner.hide();
    }, () => {
      this.spinner.hide();
    });
  }

  getComparison() {
    this.spinner.show();
    // this.isCompare = true;
    this._diffcompareSerivce.getDataSourceFieldComparison(this.dataSourceID, this.selected).subscribe(resp => {
      if (resp.ok) {
        this.comparisonMatrix = resp.body
        this.selectAction(Object.keys(this.comparisonMatrix)[0])
        this.spinner.hide();
        this.isComparisonAvailable = true;
      }
    }, (error) => {
      this.toastr.errorToastr("Failed to compare the versions " +
        this.selected.version0 + " and " + this.selected.version1,
        "Unsuccessful",
        { position: "bottom-right", showCloseButton: true })
      this.spinner.hide();
    },
      () => {
        const assignAction = (columnsList: object[], columnsModifiedMatrix: object, actionArray: string[]): object[] => {
          actionArray.forEach(elem => {
            columnsModifiedMatrix[elem].forEach(column => {
              const foundIndex = columnsList.findIndex(tuple => tuple['name'] == column.fieldName);
              if (foundIndex != -1) {
                columnsList[foundIndex]['action'] = elem;
              }
            })
          })
          return columnsList;
        }

        this.fieldMapping.version1['listOfFieldMapping'] = assignAction(this.fieldMapping.version1['listOfFieldMapping'], this.comparisonMatrix, ['ADDED', 'MODIFIED']);
        this.fieldMapping.version0['listOfFieldMapping'] = assignAction(this.fieldMapping.version0['listOfFieldMapping'], this.comparisonMatrix, ['DROPPED']);
        this.spinner.hide();
      })

  }

  selectAction(action: string): void {
    this.selectedAction.name = action;
    this.selectedAction.list = this.comparisonMatrix[action];
  }

}
