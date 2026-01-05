import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { Status, PaymentMode } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent {

  dataLoading: boolean = false
  expenseList: any = []
  Expense: any = {}
  isSubmitted = false
  StatusList = this.loadData.GetEnumList(Status);
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.ExpenseHeadList();
    this.ExpenseList();
    // this.resetForm();
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(obj).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }
  resetForm() {
    if (this.formExpense) {
      this.formExpense.resetForm({
        Status: 1   // default value
      });
    }

    this.Expense = {};
    this.Expense.Status = 1;

    this.isSubmitted = false;
  }

  resetFormEdit() {
    if (this.formExpense) {
      this.formExpense.resetForm({
        Status: 1   // default value
      });
    }

    this.Expense = {};
    this.Expense.Status = 1;

    this.isSubmitted = false;
    this.ExpenseList();

  }


  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }


  @ViewChild('formExpense') formExpense: NgForm;


  saveExpense() {
    this.isSubmitted = true;
    this.formExpense.control.markAllAsTouched();
    if (this.formExpense.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    this.Expense.CreatedBy = this.staffLogin.StaffLoginId;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Expense)).toString()
    }
    this.dataLoading = true;

    this.service.saveExpense(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Expense.ExpenseId > 0) {
          this.toastr.success("Expense Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Expense added successfully")
        }


        this.resetForm()


        // ✅ CLOSE MODAL
        const modalEl = document.getElementById('staticBackdrop');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        this.dataLoading = false;
        this.ExpenseList();
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  // Expense list
  ExpenseList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;

    this.service.ExpenseList(obj).subscribe(
      (response: any) => {
        if (response.Message === ConstantData.SuccessMessage) {
          this.expenseList = response.ExpenseList || [];
          console.log('Expense list loaded:', this.expenseList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        console.error('ExpenseList API error:', err);
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }



  // delete
  deleteExpense(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteExpense(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.ExpenseList()
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while deleteing the recored")
        this.dataLoading = false;
      }))
    }
  }
  expenseHeadList: any = [];

  // ExpenseHeadList
  editExpense(item: any) {
    this.Expense = { ...item }; // clone object
    console.log(this.Expense.ExpenseHeadId);
    console.log(this.Expense);

  }

  // edit
  ExpenseHeadList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;

    this.service.ExpenseHeadList(obj).subscribe(
      (response: any) => {
        if (response.Message === ConstantData.SuccessMessage) {
          this.expenseHeadList = response.ExpenseHeadList || [];
          console.log('ExpenseHead list loaded:', this.expenseHeadList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        console.error('ExpenseHeadList API error:', err);
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }
  maxDate = new Date(); // today
  getPaymentModeName(modeId: number): string {
    return this.PaymentModeList.find(x => x.Key === modeId)?.Value || '';
  }



}
