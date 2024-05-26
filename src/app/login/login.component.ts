import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment.development';
import { SocketService } from '../services/socket.service';
import { HttpService } from '../services/http.service';
import { Route, Router, RouterModule } from '@angular/router';
  


  @Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule,FormsModule,CommonModule,RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    
  })
  export class LoginComponent implements OnInit{
    showSignUp: boolean = false;
    loginForm!: FormGroup;
    signupForm!: FormGroup;
    error = {
      message:'',
      error:false
    }


    constructor(private http: HttpClient,
      private socketService:SocketService,
      private fb:FormBuilder,private httpService:HttpService,
      private router :Router
    ){}

    ngOnInit(): void {
      console.log(environment.apiUrl);
      this.initializeForms()
      // this.socketService.connect()
    }

    toggleForm() {
      // this.showSignUp = (form === 'signup');
      this.showSignUp = !this.showSignUp
    }

    initializeForms(){
      this.loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
    
      this.signupForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
    }

    login(){
      console.log(this.loginForm);
      const formValues = this.loginForm.value
      const body = {
        userName : formValues.username,
        password : formValues.password
      }
      // this.httpService.login(body).subscribe((response)=>{
      //   if(response && response.ok){
      //     this.router.navigate(['chatwindow'])
      //   }
      //   console.log(response,"response form login API")
      // })



      this.httpService
      .login(body)
      .subscribe({
        next: (response) => {
          console.log(response,"Respons_from_login_API");
          if(response && response.ok){
            const loginDetails = response.user[0]
            this.socketService.connect(loginDetails.userName)
            this.router.navigate(['chatwindow'],{queryParams:{userName:loginDetails.userName}})
            this.error.error = false
          }
          console.log(response,"response form login API")
        },
        error: (e) => {
          console.log(e);
          this.error.error = true
          this.error.message = e.error.message;
        },
        complete: () => console.log('done'),
      });

    }

    signUp(){
      console.log(this.signupForm)
      const formValues = this.signupForm.value
      const body ={
        email : formValues.email,
        userName  :formValues.username,
        password : formValues.password
      }

      this.httpService.signUp(body).subscribe((response)=>{
        console.log(response,"response form login API")
        if(response.ok){
          const loginDetails = response.user
          console.log(loginDetails,"sgkjrskgbsrhbhjgjh");
          
          this.router.navigate(['chatwindow'],{queryParams:{userName:loginDetails.userName}})
        }
      })
    }


  }
