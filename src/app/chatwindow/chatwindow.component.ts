import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { ActivatedRoute } from '@angular/router';
import { usersList } from '../interfaces';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-chatwindow',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './chatwindow.component.html',
  styleUrl: './chatwindow.component.scss'
})
export class ChatwindowComponent implements OnInit{

  users:usersList[] = [];
  selectedUser:usersList | null = null;
  messages:any = [];
  newMessage = '';
  currentUser : string = ''


  constructor(private httpService:HttpService,private route:ActivatedRoute,private socketService:SocketService){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      console.log(params,"params");
      this.currentUser = params['userName']
      console.log(this.currentUser);
      
    })
    this.getUsers(this.currentUser)
  }

  selectUser(user: any) {
    this.selectedUser = user;
    console.log(this.selectedUser);
  
    // Fetch messages for the selected user
    this.messages = [
      { text: 'Hello!', isResponse: false },
      { text: 'Hi there!', isResponse: true }
    ];
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      console.log(this.newMessage);
      
      // this.messages.push({ text: this.newMessage, isResponse: false });
      // this.newMessage = '';
      // // Simulate a response
      // setTimeout(() => {
      //   this.messages.push({ text: 'Response from user', isResponse: true });
      // }, 1000);
      this.socketService.sendMesssage({message:this.newMessage,userId:this.selectedUser})
    }
  }

  getUsers(userName:string){
    this.httpService.getUsers({userName:userName}).subscribe({
      next: (response) =>{
        console.log(response)
        if(response && response.ok){
          // this.users = response.users as usersList[]       
          this.users = response.users      
          console.log(this.users);
          
        }
      }
    })
  }
}
