import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket:Socket | undefined

  constructor() { this.connect()}


  connect(){
    if(!this.socket){
      this.socket = io(environment.apiUrl)
    }
    console.log(this.socket)
  }

  sendMesssage(message:any){
    console.log(message);
    console.log(this.socket);
    
    
    this.socket?.emit('message',message)
  }
}
