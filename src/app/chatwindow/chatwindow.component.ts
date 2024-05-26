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
  socketId:any= null


  constructor(private httpService:HttpService,private route:ActivatedRoute,private socketService:SocketService){
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      console.log(params,"params");
      this.currentUser = params['userName']
      if(!this.socketService.socket){
        this.socketService.connect(this.currentUser)
        this.socketId = this.socketService.socket
      }

      console.log(this.messages);
      

      console.log(this.socketId);
      

      
      console.log(this.socketService.socket);
      
      
      console.log(this.currentUser);

      // Subscribe to incoming messages
      this.socketService.onMessage(message => {
        console.log('Received message:', message);
        // Update your messages array here based on the received message
      });
      
    })
    this.getUsers(this.currentUser)
  }

  selectUser(user: usersList) {
    this.selectedUser = user;
    console.log(this.selectedUser);
    const userName= this.selectedUser?.userName

    const body = {
      currentUser: this.currentUser,
      selectedUser : this.selectedUser.userName
    }
    this.httpService.getMessages(body).subscribe({
      next: (response) =>{
        console.log(response,"response_from_getMesages")
        if(response && response.ok){
          // this.messages = 
          
          
        }
      }
    })
    // Fetch messages for the selected user
    this.messages = [
      { text: 'Hello!', isResponse: false },
      { text: 'Hi there!', isResponse: true }
    ];
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      console.log(this.newMessage);
      const body ={
        sender: this.currentUser,
        recipient: this.selectedUser?.userName,
        message: this.newMessage,
        socketId: this.selectedUser?.socketId
      }
      this.socketService.sendMessage(body)
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
