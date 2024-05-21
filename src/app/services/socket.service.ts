import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket:Socket | undefined

  constructor() { }


  connect(){
    this.socket = io(environment.apiUrl)
  }
}
