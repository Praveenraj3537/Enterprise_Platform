import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css']
})
export class SignOutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log("Signed out");
  }
  getHostName(){
    return window.location.host;
  }
}
